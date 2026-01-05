# context_processors.py
from .utils import get_user_group_full_name

def user_group_full_name(request):
    user_group_full_name = None

    if request.user.is_authenticated:
        user_group_full_name = get_user_group_full_name(request.user)

    return {'user_group_full_name': user_group_full_name}


def user_group_name(request):
    user_group_name = None
    if request.user.is_authenticated and request.user.groups.exists():
        user_group_name = request.user.groups.first().name
    return {'user_group_name': user_group_name}