from django import forms
from django.contrib.auth.forms import UserCreationForm, UserChangeForm
from django.contrib.auth.models import User
from django.contrib.auth.models import Group  # Add this line

from . import models
from bootstrap_datepicker_plus.widgets import DatePickerInput

from django.contrib.auth.forms import AuthenticationForm

from nepali_datetime_field.forms import NepaliDateField
from django.contrib.auth import update_session_auth_hash




# class EnquiryForm(forms.ModelForm):
# 	class Meta:
# 		model=models.Enquiry
# 		fields=('full_name','email','detail')




# class ProfileForm(UserChangeForm):
# 	class Meta:
# 		model=User
# 		fields=('first_name','last_name','email','username', 'password1', 'password2')
from datetime import datetime


class CustomProfileForm(UserChangeForm):
    password1 = forms.CharField(widget=forms.PasswordInput(), label='New Password', required=False)
    password2 = forms.CharField(widget=forms.PasswordInput(), label='Confirm New Password', required=False)

    class Meta:
        model = User
        fields = ('first_name', 'last_name', 'email', 'username', 'password1', 'password2')

    def __init__(self, *args, **kwargs):
        self.request = kwargs.pop('request', None)
        super().__init__(*args, **kwargs)

        if self.request and self.request.user.is_authenticated:
            self.fields['password1'].required = False
            self.fields['password2'].required = False
        else:
            self.fields['password1'].required = True
            self.fields['password2'].required = True

    def clean_password2(self):
        password1 = self.cleaned_data.get("password1")
        password2 = self.cleaned_data.get("password2")
        if password1 and password2 and password1 != password2:
            raise forms.ValidationError("Passwords do not match")
        return password2

    def save(self, commit=True):
        user = super().save(commit=False)
        password1 = self.cleaned_data["password1"]
        user.first_name = self.cleaned_data["first_name"]
        user.last_name = self.cleaned_data["last_name"]
        user.email = self.cleaned_data["email"]
        if password1:
            user.set_password(password1)
        elif 'password1' in self.changed_data:
        # If password1 is empty but it's in changed_data, clear the password
            user.set_password(None)
        if commit:
            user.save()
            update_session_auth_hash(self.request, user)
        return user


class SignUp(UserCreationForm):
	class Meta:
		model=User
		fields=('first_name','last_name','email','username','password1','password2')

	group = forms.ModelChoiceField(
        queryset=Group.objects.all(),
        label=''
    )		    








class LoginForm(AuthenticationForm):
    class Meta:
        model = User	


class UserUpdateForm(UserChangeForm):
    user_to_update = forms.ModelChoiceField(
        queryset=User.objects.all(),
        label='Select User to Update',
        widget=forms.Select(attrs={'class': 'form-control'})
    )

    class Meta:
        model = User
        fields = ('first_name', 'last_name', 'email')

    def __init__(self, *args, **kwargs):
        super(UserUpdateForm, self).__init__(*args, **kwargs)
        self.fields['user_to_update'].label_from_instance = lambda obj: f"{obj.username} - {obj.get_full_name()}"

    def clean_user_to_update(self):
        user_to_update = self.cleaned_data.get('user_to_update')
        if user_to_update == self.instance:
            raise forms.ValidationError("Cannot update your own profile using this form.")
        return user_to_update

    def clean(self):
        cleaned_data = super().clean()

         # Check if at least one field (excluding username) is updated
        fields_to_check = [field for field in self.Meta.fields if field != 'username']
        if not any(cleaned_data.get(field) for field in fields_to_check):
            raise forms.ValidationError("At least one field (other than username) should be updated.")

        return cleaned_data

# class ResetPasswordForm(forms.Form):
#     user_to_reset = forms.ModelChoiceField(
#         queryset=User.objects.all(),
#         label='Select User to Reset Password',
#         widget=forms.Select(attrs={'class': 'form-control'})
#     )

#     def save(self, commit=True):
#         user_to_reset = self.cleaned_data['user_to_reset']
#         user_to_reset.set_password('Nepal@123')  # Set the default password
#         if commit:
#             user_to_reset.save()
#         return user_to_reset

class ResetPasswordForm(forms.Form):
    user_to_reset = forms.ModelChoiceField(
        queryset=User.objects.all(),
        label='Select User to Reset Password',
        widget=forms.Select(attrs={'class': 'form-control'})
    )
    new_password = forms.CharField(
        label='New Password',
        widget=forms.PasswordInput(attrs={'class': 'form-control'})
    )

    def save(self, commit=True):
        user_to_reset = self.cleaned_data['user_to_reset']
        new_password = self.cleaned_data['new_password']
        
        # Set the new password
        user_to_reset.set_password(new_password)

        if commit:
            user_to_reset.save()
        
        return user_to_reset


#Add Group
class GroupForm(forms.ModelForm):
    class Meta:
        model = Group
        fields = ['name']
        widgets = {
            'name': forms.TextInput(attrs={'class': 'form-control'}),
        }




# TESTING BY SUWAN
class FormDataForm(forms.ModelForm):
    assigned_office = forms.ChoiceField(choices=[], required=False, label="Quater")
    num_of_add_people = forms.IntegerField(required=False)
    purpose = forms.CharField(max_length=100)




    date = forms.CharField(
        widget=forms.DateInput(format='%Y-%m-%d', attrs={'class': 'form-control nepali-datepicker'}),
        #input_formats=('%Y-%m-%d',),
        required=True  # Ensure the field is explicitly marked as required
    )
    
    province = forms.ChoiceField(
        choices=models.FormData.PROVINCE_CHOICES,
        required=False,
        widget=forms.Select(attrs={'class': 'form-select toggle-province'})
    )  
    district = forms.CharField(max_length=20, required=False, widget=forms.Select(attrs={'class': 'form-select'}))

    class Meta:
        model = models.FormData
        fields = '__all__'

   

    def clean(self):
        cleaned_data = super().clean()
        province = cleaned_data.get('province')
        district = cleaned_data.get('district')

        if not province:
            self.add_error('province', "Province cannot be Empty.")
        
        if not district:
            self.add_error('district', "District cannot be Empty.")

        return cleaned_data



    def __init__(self, *args, **kwargs):
        super(FormDataForm, self).__init__(*args, **kwargs)
        self.fields['vehicle_number'].required = False  # Set it to not required initially

        # Add classes or attributes for JavaScript to detect
        self.fields['has_vehicle'].widget.attrs['class'] = 'toggle-vehicle'
       
        self.fields['id_number'].widget.attrs['class'] = 'form-control'  # Add class for styling

        self.fields['additional_people_names'].widget.attrs['class'] = 'form-control'  # Add class for styling

        group_choices = [(group.name, group.name) for group in Group.objects.exclude(name__in=['SUPERADMIN', 'GATE ADMIN'])]
        # Add the default option
        group_choices.insert(0, ('', 'Select the quater to visit'))        
        self.fields['assigned_office'].choices = group_choices


        # Initialize the province and district choices
        province_value = self.initial.get('province') if self.initial else None
        self.set_province_choices()
        self.set_district_choices(province_value)
        self.fields['district'].widget.attrs['class'] = 'form-select'  # Add class for the select element

    def set_province_choices(self):
        self.fields['province'].choices = models.FormData.PROVINCE_CHOICES

    def set_district_choices(self, province):
        if province:
            districts = [district[1] for district in models.FormData.DISTRICT_CHOICES if district[0] == province]
            self.fields['district'].choices = [(district, district) for district in districts[0]]


    # def set_district_choices(self, province):
    #     if province:
    #         districts = models.FormData.DISTRICT_CHOICES.get(province, [])
    #         self.fields['district'].choices = [(district, district) for district in districts]
    


    
    