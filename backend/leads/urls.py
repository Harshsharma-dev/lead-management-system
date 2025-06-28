from django.urls import path
from . import views

app_name = 'leads'

urlpatterns = [
    # Lead CRUD operations
    path('', views.LeadListCreateView.as_view(), name='lead-list-create'),
    path('<int:pk>/', views.LeadDetailView.as_view(), name='lead-detail'),
    
    # Status update endpoint
    path('<int:pk>/status/', views.update_lead_status, name='update-lead-status'),
    
    # Dashboard endpoints
    path('by-status/', views.leads_by_status, name='leads-by-status'),
    path('statistics/', views.lead_statistics, name='lead-statistics'),
] 