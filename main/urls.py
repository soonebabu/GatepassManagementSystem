from django.urls import path

from django.conf import settings
from django.conf.urls.static import static

from . import views
urlpatterns=[
	path('',views.home,name='home'),
	path('form_view',views.form_view,name='form_view'),
    path('display_data/',views.display_data,name='display_data'),
    path('edit-form/<int:item_id>/', views.edit_form_view, name='edit_form_view'),
    path('delete-form/<int:item_id>/', views.delete_form_view, name='delete_form_view'),
    path('get-districts/', views.get_districts, name='get_districts'),
    path('export-to-excel/', views.export_to_excel, name='export_to_excel'),
	path('contact',views.contact_page,name='contact_page'),

	path('accounts/signup',views.signup,name='signup'),
	path('accounts/login',views.login,name='login'),
    path('guest_login/', views.guest_login, name='guest_login'),  # Add this line


    path('add_group/', views.add_group, name='add_group'),
	path('group_list/', views.group_list, name='group_list'),
    path('group/<int:group_id>/delete/', views.delete_group, name='delete_group'),

	
	path('update_status/', views.update_status, name='update_status'),
	
	path('update-profile',views.update_profile,name='update_profile'),
	
    path('reset_user_password/', views.reset_user_password, name='reset_user_password'),
    path('get_user_data/<int:user_id>/', views.get_user_data, name='get_user_data'),
    path('cancel_update/', views.cancel_update, name='cancel_update'),
    path('update_user_profile/', views.update_user_profile, name='update_user_profile'),
    path('user_list/', views.user_list, name='user_list'),
    path('export_filter/', views.export_to_excel_filter, name='export_filter'),
    # path('generate_pie_chart/', views.generate_pie_chart, name='generate_pie_chart'),

    path('download-pdf/<int:item_id>/', views.download_pdf, name='download_pdf'),

    path('detail/<int:item_id>/', views.detail_view, name='detail_view'),


 ]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)