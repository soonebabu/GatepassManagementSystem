from django.shortcuts import render,redirect
from django.template.loader import get_template
from django.core import serializers
from django.http import JsonResponse
from django.db.models import Count
from . import models
from . import forms
#import stripe
from django.contrib.auth import login
from django.contrib.auth.models import Group
from .models import StatusEnum
from datetime import timedelta
from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import User



# Contact
def contact_page(request):
	return render(request, 'contact_us.html')

def update_profile(request):
    msg = None

    if request.method == 'POST':
        form = forms.CustomProfileForm(request.POST, instance=request.user, request=request)
        if form.is_valid():
            form.save()
            msg = 'Data has been saved'
    else:
        form = forms.CustomProfileForm(instance=request.user, request=request)

    return render(request, 'user/update-profile.html', {'form': form, 'msg': msg})


from django.http import JsonResponse

@login_required

def add_group(request):
    if request.method == 'POST':
        form = forms.GroupForm(request.POST)
        if form.is_valid():
            form.save()
            return redirect('group_list') 
    else:
        form = forms.GroupForm()
    return render(request, 'groups/add_group.html', {'form': form})

#Group List

def group_list(request):
    groups = Group.objects.all()  
    return render(request, 'groups/group_list.html', {'groups': groups})

from django.contrib.auth.models import Group as AuthGroup

@login_required
def delete_group(request, group_id):
    group = get_object_or_404(AuthGroup, pk=group_id)
    
    # Get all users associated with the group
    users = User.objects.filter(groups=group)
    
    # Remove each user from the group
    for user in users:
        user.groups.remove(group)
        user.save()
    
    # Delete the group
    group.delete()
    
    return redirect('group_list')


@login_required
def update_user_profile(request):
    msg = None

    # Check if the logged-in user is in the 'SUPERADMIN' group
    if not request.user.groups.filter(name='SUPERADMIN').exists():
        return render(request, 'contact_us.html')

    if request.method == 'POST':
        form = forms.UserUpdateForm(request.POST)
        if form.is_valid():
            user_to_update = form.cleaned_data['user_to_update']

            # Update only the fields that have changed
            for field in form.Meta.fields:
                if field != 'username' and form.cleaned_data[field] is not None:
                    setattr(user_to_update, field, form.cleaned_data[field])

            # Save the changes, excluding the username field
            user_to_update.save(update_fields=[field for field in form.Meta.fields if field != 'username'])
            msg = 'User profile updated successfully'
        else:
            print(form.errors)

    else:
        form = forms.UserUpdateForm()

    return render(request, 'user/update-user-profile.html', {'form': form, 'msg': msg})

def cancel_update(request):
    # Redirect to the desired URL when the cancel button is clicked
    return redirect('user/update-user-profile.html')

@login_required
def reset_user_password(request):
    # Check if the logged-in user is in the 'SUPERADMIN' group
    if not request.user.groups.filter(name='SUPERADMIN').exists():
        return render(request, 'contact_us.html')

    msg = None

    if request.method == 'POST':
        form = forms.ResetPasswordForm(request.POST)
        if form.is_valid():
            form.save()
            msg = 'Password reset successfully'

    else:
        form = forms.ResetPasswordForm()

    return render(request, 'user/reset-password.html', {'form': form, 'msg': msg})

def get_user_data(request, user_id):
    try:
        user = User.objects.get(pk=user_id)
        user_data = {
            'first_name': user.first_name,
            'last_name': user.last_name,
            'email': user.email,
            'username': user.username
            # Add other fields as needed
        }
        return JsonResponse(user_data)
    except User.DoesNotExist:
        return JsonResponse({'error': 'User not found'}, status=404)

def user_list(request):
    # Check if the user is a superadmin
    if request.user.groups.filter(name='SUPERADMIN').exists():
        # Get all users
        users = User.objects.all()
        
        # Pass the users to the template
        context = {'users': users}
        return render(request, 'user_list.html', context)
    else:
        # If the user is not a superadmin, you may want to handle this case appropriately
        return render(request, 'access_denied.html')

from django.contrib.auth.decorators import login_required

# if Group.objects.exists():
#     # Exclude certain groups and retrieve their names
#     allowed_offices = Group.objects.exclude(name__in=['SUPERADMIN', 'GATE ADMIN', 'GUEST']).values_list('name', flat=True)

#     # Convert QuerySet to list
#     ALLOWED_OFFICES = list(allowed_offices)
# else:
#     # If no groups exist, set ALLOWED_OFFICES to an empty list
#     ALLOWED_OFFICES = []
try:
    if Group.objects.exists():
        # Exclude certain groups and retrieve their names
        allowed_offices = Group.objects.exclude(name__in=['SUPERADMIN', 'GATE ADMIN', 'GUEST']).values_list('name', flat=True)
        # Convert QuerySet to list
        ALLOWED_OFFICES = list(allowed_offices)
    else:
        # If no groups exist, set ALLOWED_OFFICES to an empty list
        ALLOWED_OFFICES = []
except Exception as e:
    # If an error occurs, log it and set ALLOWED_OFFICES to an empty list
    print(f"Error occurred while fetching groups: {e}")
    ALLOWED_OFFICES = []


# Home Page
@login_required
def home(request):
    
    user_group = request.user.groups.first().name

    if user_group in ['GATE ADMIN', 'SUPERADMIN']:
        # Fetch data for users who entered
        entered_data = models.FormData.objects.filter(Q(current_status='Exited') | Q(current_status='Entered'))
        
        # Aggregate data based on the office
        entered_office_counts = entered_data.values('group').annotate(count=Count('id'))

        # Prepare data for the pie chart
        entered_data_for_chart = [{'office': entry['group'], 'count': entry['count']} for entry in entered_office_counts]

        # Fetch line chart data based on the user's group
        # line_chart_data = get_line_chart_data(user_group)
        
        return render(request, 'home.html', {'entered_data': entered_data_for_chart})

    else:
        
        return render(request, 'home.html')


from django.contrib.auth.decorators import login_required

@login_required
def signup(request):
    msg = None
    user_is_superadmin = request.user.groups.filter(name='SUPERADMIN').exists()

    if not user_is_superadmin:
      return render(request, 'contact_us.html')

    if request.method == 'POST':
        form = forms.SignUp(request.POST)
        if form.is_valid():
            user = form.save()

            # Get the selected group
            group_name = form.cleaned_data['group']

            # Get the Group object
            user_group = Group.objects.get(name=group_name)

            # Add the user to the group
            user.groups.add(user_group)

            print("User registered:", user)
            msg = 'Thank you for registering.'
            return redirect('user_list')
    else:
        form = forms.SignUp()

    return render(request, 'registration/signup.html', {'form': form, 'msg': msg})

from django.contrib.auth import authenticate, login as auth_login
from django.urls import reverse


def guest_login(request):
    username = 'guest_user'
    password = 'Kath@123'
    user = authenticate(request, username=username, password=password)
    if user is not None:
        auth_login(request, user)
        return redirect(reverse('home'))  # Replace 'apply_pass' with the name of your URL pattern for the target page
    else:
        return redirect(reverse('login'))  # Replace 'login' with the name of your login URL pattern



from datetime import date
from .templatetags.custom_filters import ad_to_bs  # Import the custom filter



import nepali_datetime

def display_data(request):
    current_date = timezone.now().date()
    all_groups = Group.objects.all()

    try:
        current_bs_date = nepali_datetime.date.today().isoformat()  # Get current BS date in ISO 8601 format
        print('Current BS Date', current_bs_date)
        if current_bs_date is None:
            raise ValueError("Error converting date to BS: Conversion result is None.")
    except ValueError as e:
        # Handle the case where conversion fails
        print(f"Error converting date to BS: {e}")
        return HttpResponse("Error: Unable to convert date to BS.")

    if request.user.is_authenticated:
        user_group = request.user.groups.first().name
        if user_group in ['GATE ADMIN', 'SUPERADMIN']:
            data = models.FormData.objects.all()
        else:
            try:
                data = models.FormData.objects.filter(Q(group=user_group) | Q(assigned_office=user_group))
            except Exception as e:
                print(f"Error filtering data: {e}")
                return HttpResponse("Error: Unable to fetch data.")
    else:
        # Handle the case where the user is not authenticated
        return HttpResponse("Error: User is not authenticated.")

    context = {
        'data': data,
        'user_group': user_group,
        'current_date': current_date,  # Pass current date to the template
        'current_bs_date': current_bs_date,
        'all_groups': all_groups, 
    }
    return render(request, 'display_data.html', context)



from django.contrib import messages 

from django.shortcuts import render, redirect
from django.contrib import messages
from . import forms
from django.contrib.auth.models import Group

from django.contrib.auth.decorators import user_passes_test

@login_required


@login_required
def form_view(request):
    if request.method == 'POST':
        form = forms.FormDataForm(request.POST)

        # TO PRINT THE VALUES
        submitted_date = request.POST.get('date')
        print(request.POST)

        if form.is_valid():
            user_group = request.user.groups.first().name
            
            # Set the group field to the user's group
            form.instance.group = user_group

            # Check the user's group and set assigned_office accordingly
            if user_group not in ['SUPERADMIN', 'GATE ADMIN', 'GUEST']:
                form.instance.assigned_office = user_group
            else:
                form.instance.assigned_office = form.cleaned_data.get('assigned_office')

            form.save()
           
            primary_key = form.instance.pk  # This gets the primary key of the saved instance
            print("primary_key", primary_key)

            # Check if the user is a guest and redirect accordingly
            if user_group == 'GUEST':
                return redirect('home')  # Replace 'home' with the name of your home URL pattern
            else:
                return redirect('display_data')
        else:
            print("Form errors:", form.errors)
            # Log validation errors
            for field, errors in form.errors.items():
                for error in errors:
                    messages.error(request, f"Validation Error for field {field}: {error}")
    else:
        # Get the user's group and set it as the initial value for the group field
        user_group = request.user.groups.first().name
        form = forms.FormDataForm(initial={'group': user_group})

    # Determine if the user is SUPERADMIN, GATE ADMIN, or GUEST
    user_is_admin = request.user.groups.filter(name__in=["SUPERADMIN", "GATE ADMIN", "GUEST"]).exists()

    return render(request, 'form.html', {'form': form, 'user_is_admin': user_is_admin})



def get_districts(request):
    province = request.GET.get('province')
    if province:
        districts = []
        for province_name, province_districts in models.FormData.DISTRICT_CHOICES:
            if province_name == province:
                districts = province_districts
                break
        return JsonResponse(districts, safe=False)
    return JsonResponse({}, safe=False)

from django.shortcuts import get_object_or_404
from datetime import datetime


def edit_form_view(request, item_id):
    item = get_object_or_404(models.FormData, pk=item_id)

    if request.method == 'POST':
        form_data = request.POST.copy()
        form = forms.FormDataForm(form_data, instance=item)

        if form.is_valid():
            user_group = request.user.groups.first().name
            
            # Set the group field to the user's group
            form.instance.group = user_group

            # Check the user's group and set assigned_office accordingly
            if user_group not in ['SUPERADMIN', 'GATE ADMIN']:
                form.instance.assigned_office = user_group
            else:
                form.instance.assigned_office = form.cleaned_data.get('assigned_office')

            form.save()
            return redirect('display_data')
        else:
            print(form.errors)
            for field, errors in form.errors.items():
                for error in errors:
                    messages.error(request, f"Validation Error for field {field}: {error}")
    else:
        form = forms.FormDataForm(instance=item)

    # Determine if the user is SUPERADMIN or GATE ADMIN
    user_is_admin = request.user.groups.filter(name__in=["SUPERADMIN", "GATE ADMIN"]).exists()

    return render(request, 'form.html', {'form': form, 'user_is_admin': user_is_admin})


def delete_form_view(request, item_id):
    try:
        item = models.FormData.objects.get(pk=item_id)
        item.delete()
        return JsonResponse({'success': True})
    except models.FormData.DoesNotExist:
        return JsonResponse({'success': False, 'error': 'Item not found'})


from django.http import JsonResponse
from django.views.decorators.http import require_POST

@require_POST
def update_status(request):
    print("****update_status ENTERED")
    item_id = request.POST.get('primary_key')
    new_status = request.POST.get('new_status')
    print("****item_id & new_status",item_id,new_status )

    # You should add error handling and permission checks here
    try:
        item = models.FormData.objects.get(pk=item_id)
        print("item",item)
        print('new_status',new_status)
        if new_status == 'Entered':	
            nepali_entry_date = nepali_datetime.datetime.now()
            formatted_entry_date = nepali_entry_date.strftime('%Y-%m-%d')
            item.date_of_entry = formatted_entry_date
            print('item.date_of_entry', item.date_of_entry)
            # item.date_of_entry = timezone.now()  # Set the entry time
            # print('item.date_of_entry', item.date_of_entry)

            
        elif new_status == 'Exited':
            nepali_exit_date = nepali_datetime.datetime.now()
            formatted_exit_date = nepali_exit_date.strftime('%Y-%m-%d')
            item.date_of_exit = formatted_exit_date
            print('item.date_of_exit', item.date_of_exit)
            # item.date_of_exit = nepali_exit_date
            # print('item.date_of_exit', item.date_of_exit)
            # item.date_of_exit = timezone.now()  # Set the exit time
        item.current_status = new_status
        print('item.current_status',item.current_status)
        item.save()
        response_data = {
            'success': True,
            'entry_date': item.date_of_entry,
            'exit_date': item.date_of_exit,
            'current_status': item.current_status,
        }
        return JsonResponse({'success': True})
    except models.FormData.DoesNotExist:
        return JsonResponse({'success': False, 'error': 'Item not found'})

# Login
def login(request):
    if request.method == 'POST':
        form = forms.LoginForm(data=request.POST)
        if form.is_valid():
            user = form.get_user()
            login(request, user)  # Log the user in
            return redirect('home')  # Redirect to the user's profile or any other desired page
    else:
        form = forms.LoginForm()
    return render(request, 'registration/login.html', {'form': form})

from django.utils import timezone

def handleButtonClick(request, primary_key, new_status):
    if new_status == "Entered":
        # Record the entry time as the current time
        entry_time = timezone.now()
        form_data = models.FormData.objects.get(pk=primary_key)
        form_data.date_of_entry = entry_time
        form_data.current_status = new_status
        form_data.save()

    # Handle other status changes as before

    return JsonResponse({"status": "success"})

from django_excel import make_response

from django.http import HttpResponse
from openpyxl import Workbook
from django.utils.encoding import escape_uri_path
from io import BytesIO
import pyexcel as p
from pyexcel_xlsx import save_data
from urllib.parse import quote
from django.contrib.auth.decorators import user_passes_test
from datetime import datetime
from nepali.datetime import nepalidate, parser


def can_export_data(user):
    return user.is_authenticated and (user.groups.filter(name__in=['GATE ADMIN', 'SUPERADMIN']).exists() or user.groups.filter(name__in=ALLOWED_OFFICES).exists())

# views.py
from django.shortcuts import render
from django.utils import timezone
from django.db.models import Q



@login_required
def export_to_excel_filter(request):
    all_groups = Group.objects.exclude(name__in=['SUPERADMIN', 'GATE ADMIN'])

    # Get the user's group
    user_group = request.user.groups.first().name

    # Fetch data for users who entered
    entered_data = models.FormData.objects.filter(Q(current_status='Exited') | Q(current_status='Entered'))

    # Aggregate data based on the office
    entered_office_counts = entered_data.values('group').annotate(count=Count('id'))

    # Prepare data for the pie chart
    entered_data_for_chart = [{'office': entry['group'], 'count': entry['count']} for entry in entered_office_counts]

    # Fetch line chart data based on the user's group
    # line_chart_data = get_line_chart_data(user_group)

    # Render the template with line chart data and entered data
    return render(request, 'export_filter.html', { 'entered_data': entered_data_for_chart, 'all_groups': all_groups})


from django.utils.dateparse import parse_date

@user_passes_test(can_export_data)
def export_to_excel(request):
    # Retrieve user's group
    user_group = request.user.groups.first().name
    print(f"User Group: {user_group}")  # Add this line for debugging

    # Get filter options
    filter_option = request.GET.get('filter_option')  # 'date' or 'date_of_entry'
    start_date = request.GET.get('start_date')
    end_date = request.GET.get('end_date')
    visited_quater = request.GET.get('visited_quater')  # Added for visited quater filtering


    if not start_date or not end_date:
        return JsonResponse({'error': 'Start date and end date are required.'}, status=400)
    if start_date:
        # start_date = timezone.make_aware(datetime)
        start_date = start_date
    if end_date:
        # end_date = timezone.make_aware(datetime)
        end_date = end_date   # Increment by one day

        # end_date = end_date

    if user_group == 'SUPERADMIN':
        data = models.FormData.objects.all()
    else:
        # Filter data based on the user's group
        data = models.FormData.objects.filter(Q(group=user_group) | Q(assigned_office=user_group))

    if filter_option == 'date':
        # Filter based on pass creation date
        if start_date and end_date:
            data = data.filter(date__range=[start_date, end_date])
    elif filter_option == 'date_of_entry':
        # Filter based on date of entry
        if start_date and end_date:
            data = data.filter(date_of_entry__range=[start_date, end_date])

    if visited_quater and visited_quater != 'all':
        data = data.filter(assigned_office=visited_quater)        

    print(f"Number of items for {user_group}: {data.count()}")  # Add this line for debugging

    # Create an Excel workbook and add a worksheet
    wb = Workbook()
    ws = wb.active
    # Add headers to the worksheet
    headers = ['NAME', 'NO OF ADDITIONAL PEOPLE','ADDITIONAL PEOPLE', 'PROVINCE', 'DISTRICT', 'DATE', 'PHONE', 'PURPOSE', 'VEHICLE', 'STATUS', 'ISSUED BY', 'VISITED QUATER' ,'Entered Time']
    ws.append(headers)  # Add all your headers here
    # Add data rows to the worksheet
    for item in data:
        # Convert datetime objects to naive datetimes
        date = item.date if item.date else None
        date_of_entry = item.date_of_entry if item.date_of_entry else None
        date_of_exit = item.date_of_exit if item.date_of_exit else None
        # Add all your fields here
        row = [
            item.name,
            item.num_of_add_people,
            item.additional_people_names,
            item.province,
            item.district,
            date,
            item.id_number,
            item.purpose,
            item.vehicle_number,
            item.current_status,
            item.group,
            item.assigned_office,
            date_of_entry,

            # date_of_exit,
            # item.duration_of_stay
        ]
        ws.append(row)

    # Create a BytesIO buffer to save the workbook
    output = BytesIO()
    wb.save(output)
    # Construct the response with the Excel file
    response = HttpResponse(output.getvalue(), content_type='application/ms-excel')
    current_datetime = datetime.now()
    response['Content-Disposition'] = f'attachment; filename="{current_datetime}_data_export.xlsx"'
    # response['Content-Disposition'] = f'attachment; filename={escape_uri_path("data_export.xlsx")}'
    return response





from django.db.models import Count
from django.db.models.functions import ExtractMonth





from django.http import HttpResponse
from django.template.loader import render_to_string
from weasyprint import HTML

def download_pdf(request, item_id):
    item = get_object_or_404(models.FormData, id=item_id)
    
    html_string = render_to_string('pdf_template_copy.html', {'item': item})
    html = HTML(string=html_string)
    pdf = html.write_pdf()

    response = HttpResponse(pdf, content_type='application/pdf')
    response['Content-Disposition'] = f'attachment; filename="details_{item_id}.pdf"'
    
    return response




from django.shortcuts import render, get_object_or_404
from .models import FormData  # Replace YourModel with the actual name of your model

def detail_view(request, item_id):
    print("$$$$$$$$detail_view called with id ", item_id)
    # Retrieve the latest object from the database based on the primary key
    latest_item = get_object_or_404(FormData, pk=item_id)
    print("latest item", latest_item.date_of_entry)

    # Pass the latest item to the template for rendering
    return render(request, 'pdf_template.html', {'item': latest_item})
