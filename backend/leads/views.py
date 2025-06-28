from django.shortcuts import render
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import api_view, permission_classes
from django.db.models import Q
from .models import Lead
from .serializers import LeadSerializer, LeadStatusUpdateSerializer


class LeadListCreateView(generics.ListCreateAPIView):
    """
    GET: List all leads for the authenticated user
    POST: Create a new lead
    """
    serializer_class = LeadSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        queryset = Lead.objects.filter(created_by=self.request.user)
        
        # Filter by status if provided
        status_filter = self.request.query_params.get('status', None)
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        # Search functionality
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(
                Q(name__icontains=search) |
                Q(email__icontains=search) |
                Q(phone__icontains=search)
            )
        
        return queryset
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(
                {
                    'success': True,
                    'message': 'Lead created successfully',
                    'data': serializer.data
                },
                status=status.HTTP_201_CREATED
            )
        return Response(
            {
                'success': False,
                'message': 'Failed to create lead',
                'errors': serializer.errors
            },
            status=status.HTTP_400_BAD_REQUEST
        )


class LeadDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET: Retrieve a specific lead
    PUT/PATCH: Update a lead
    DELETE: Delete a lead
    """
    serializer_class = LeadSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Lead.objects.filter(created_by=self.request.user)
    
    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        
        if serializer.is_valid():
            serializer.save()
            return Response(
                {
                    'success': True,
                    'message': 'Lead updated successfully',
                    'data': serializer.data
                }
            )
        return Response(
            {
                'success': False,
                'message': 'Failed to update lead',
                'errors': serializer.errors
            },
            status=status.HTTP_400_BAD_REQUEST
        )
    
    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.delete()
        return Response(
            {
                'success': True,
                'message': 'Lead deleted successfully'
            },
            status=status.HTTP_204_NO_CONTENT
        )


@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def update_lead_status(request, pk):
    """
    Update only the status of a lead
    """
    try:
        lead = Lead.objects.get(pk=pk, created_by=request.user)
    except Lead.DoesNotExist:
        return Response(
            {
                'success': False,
                'message': 'Lead not found'
            },
            status=status.HTTP_404_NOT_FOUND
        )
    
    serializer = LeadStatusUpdateSerializer(lead, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        
        # Return full lead data with updated status
        full_serializer = LeadSerializer(lead)
        return Response(
            {
                'success': True,
                'message': 'Lead status updated successfully',
                'data': full_serializer.data
            }
        )
    
    return Response(
        {
            'success': False,
            'message': 'Failed to update lead status',
            'errors': serializer.errors
        },
        status=status.HTTP_400_BAD_REQUEST
    )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def leads_by_status(request):
    """
    Get leads grouped by status for the dashboard
    """
    user_leads = Lead.objects.filter(created_by=request.user)
    
    leads_data = {
        'new_lead': [],
        'lead_sent': [],
        'deal_done': []
    }
    
    for status_key, status_label in Lead.STATUS_CHOICES:
        leads = user_leads.filter(status=status_key)
        serializer = LeadSerializer(leads, many=True)
        leads_data[status_key] = serializer.data
    
    # Calculate summary statistics
    summary = {
        'total_leads': user_leads.count(),
        'new_leads': user_leads.filter(status='new_lead').count(),
        'leads_sent': user_leads.filter(status='lead_sent').count(),
        'deals_done': user_leads.filter(status='deal_done').count(),
    }
    
    return Response(
        {
            'success': True,
            'data': leads_data,
            'summary': summary
        }
    )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def lead_statistics(request):
    """
    Get lead statistics for dashboard
    """
    user_leads = Lead.objects.filter(created_by=request.user)
    
    stats = {
        'total_leads': user_leads.count(),
        'new_leads': user_leads.filter(status='new_lead').count(),
        'leads_sent': user_leads.filter(status='lead_sent').count(),
        'deals_done': user_leads.filter(status='deal_done').count(),
        'conversion_rate': 0,
    }
    
    # Calculate conversion rate (deals done / total leads * 100)
    if stats['total_leads'] > 0:
        stats['conversion_rate'] = round(
            (stats['deals_done'] / stats['total_leads']) * 100, 2
        )
    
    return Response(
        {
            'success': True,
            'data': stats
        }
    )
