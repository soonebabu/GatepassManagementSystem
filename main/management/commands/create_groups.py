from django.core.management.base import BaseCommand
from django.contrib.auth.models import Group

class Command(BaseCommand):
    help = 'Create SUPERADMIN and GATE ADMIN groups if they do not exist'

    def handle(self, *args, **kwargs):
        groups = ['SUPERADMIN', 'GATE ADMIN']
        for group_name in groups:
            group, created = Group.objects.get_or_create(name=group_name)
            if created:
                self.stdout.write(self.style.SUCCESS(f'Successfully created group {group_name}'))
            else:
                self.stdout.write(self.style.WARNING(f'Group {group_name} already exists'))
