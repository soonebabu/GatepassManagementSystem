from django.shortcuts import redirect
from django.urls import reverse

class RestrictGuestUserMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        if request.user.is_authenticated and request.user.groups.filter(name='Guest').exists():
            allowed_paths = [reverse('form_view'), reverse('guest_login'), reverse('logout')]
            if request.path not in allowed_paths and not request.path.startswith(reverse('admin:index')):
                return redirect('form_view')
        return self.get_response(request)
