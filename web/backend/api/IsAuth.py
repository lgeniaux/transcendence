from datetime import datetime
from rest_framework.permissions import IsAuthenticated

class IsAuth(IsAuthenticated):
    def has_permission(self, request, view):
        has_perm = super().has_permission(request, view)
        if has_perm:
            request.user.online_status = datetime.now().timestamp()
            request.user.save()
        return has_perm