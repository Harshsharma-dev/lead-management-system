from django.db import models
from django.contrib.auth.models import User
from django.core.validators import RegexValidator


class Lead(models.Model):
    STATUS_CHOICES = [
        ('new_lead', 'New Lead'),
        ('lead_sent', 'Lead Sent'),
        ('deal_done', 'Deal Done'),
    ]
    
    LEAD_SOURCE_CHOICES = [
        ('website', 'Website'),
        ('social_media', 'Social Media'),
        ('referral', 'Referral'),
        ('cold_call', 'Cold Call'),
        ('email_marketing', 'Email Marketing'),
        ('google_ads', 'Google Ads'),
        ('facebook_ads', 'Facebook Ads'),
        ('linkedin', 'LinkedIn'),
        ('other', 'Other'),
    ]
    
    phone_regex = RegexValidator(
        regex=r'^\+?1?\d{9,15}$',
        message="Phone number must be entered in the format: '+999999999'. Up to 15 digits allowed."
    )
    
    name = models.CharField(max_length=100)
    phone = models.CharField(validators=[phone_regex], max_length=17)
    email = models.EmailField()
    lead_source = models.CharField(max_length=20, choices=LEAD_SOURCE_CHOICES)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='new_lead')
    notes = models.TextField(blank=True, null=True)
    
    # Tracking fields
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='created_leads')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Lead'
        verbose_name_plural = 'Leads'
    
    def __str__(self):
        return f"{self.name} - {self.get_status_display()}"
    
    @property
    def status_color(self):
        """Return the color associated with the lead status"""
        colors = {
            'new_lead': '#6B7280',  # Gray
            'lead_sent': '#3B82F6',  # Blue
            'deal_done': '#10B981',  # Green
        }
        return colors.get(self.status, '#6B7280')
