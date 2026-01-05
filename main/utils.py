from .group_mappings import GROUP_NAME_MAPPING

def get_user_group_full_name(user):
    user_group_name = user.groups.first().name if user.groups.exists() else None
    
    return GROUP_NAME_MAPPING.get(user_group_name, user_group_name)
