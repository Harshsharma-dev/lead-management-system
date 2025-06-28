from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Lead


class LeadSerializer(serializers.ModelSerializer):
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    lead_source_display = serializers.CharField(source='get_lead_source_display', read_only=True)
    status_color = serializers.CharField(read_only=True)
    created_by_name = serializers.CharField(source='created_by.username', read_only=True)
    
    class Meta:
        model = Lead
        fields = [
            'id', 'name', 'phone', 'email', 'lead_source', 'lead_source_display',
            'status', 'status_display', 'status_color', 'notes',
            'created_by', 'created_by_name', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_by', 'created_at', 'updated_at']
    
    def create(self, validated_data):
        # Set the created_by field to the current user
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)
    
    def validate_email(self, value):
        """Validate email format and uniqueness"""
        if not value:
            raise serializers.ValidationError("Email is required.")
        
        # Check for duplicate email (optional - uncomment if needed)
        # if Lead.objects.filter(email=value).exists():
        #     raise serializers.ValidationError("A lead with this email already exists.")
        
        return value
    
    def validate_phone(self, value):
        """Validate phone number format"""
        if not value:
            raise serializers.ValidationError("Phone number is required.")
        return value


class LeadStatusUpdateSerializer(serializers.ModelSerializer):
    """Serializer specifically for updating lead status"""
    
    class Meta:
        model = Lead
        fields = ['status']
    
    def validate_status(self, value):
        """Validate status is one of the allowed choices"""
        valid_statuses = [choice[0] for choice in Lead.STATUS_CHOICES]
        if value not in valid_statuses:
            raise serializers.ValidationError(f"Status must be one of: {', '.join(valid_statuses)}")
        return value 