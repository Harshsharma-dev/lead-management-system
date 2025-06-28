from django.contrib import admin
from .models import Lead


@admin.register(Lead)
class LeadAdmin(admin.ModelAdmin):
    list_display = [
        'name', 'email', 'phone', 'lead_source', 
        'status', 'created_by', 'created_at'
    ]
    list_filter = ['status', 'lead_source', 'created_at', 'updated_at']
    search_fields = ['name', 'email', 'phone']
    readonly_fields = ['created_at', 'updated_at']
    list_per_page = 25
    
    fieldsets = (
        ('Lead Information', {
            'fields': ('name', 'phone', 'email', 'lead_source')
        }),
        ('Status & Notes', {
            'fields': ('status', 'notes')
        }),
        ('Tracking', {
            'fields': ('created_by', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def save_model(self, request, obj, form, change):
        if not change:  # If creating a new lead
            obj.created_by = request.user
        super().save_model(request, obj, form, change)
