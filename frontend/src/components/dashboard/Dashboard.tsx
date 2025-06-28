import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { Lead, LeadsByStatus, CreateLeadData } from '../../types';
import apiService from '../../services/api';
import LeadCard from '../leads/LeadCard';
import CreateLeadModal from '../leads/CreateLeadModal';
import Header from './Header';
import StatsCards from './StatsCards';
import Button from '../common/Button';
import LoadingSpinner from '../common/LoadingSpinner';
import { 
  PlusIcon, 
  FunnelIcon, 
  MagnifyingGlassIcon,
  ArrowPathIcon,
  ChartBarIcon,
  AdjustmentsHorizontalIcon
} from '@heroicons/react/24/outline';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [leads, setLeads] = useState<LeadsByStatus>({
    new_lead: [],
    lead_sent: [],
    deal_done: [],
  });
  const [statistics, setStatistics] = useState({
    total_leads: 0,
    new_leads: 0,
    leads_sent: 0,
    deals_done: 0,
    conversion_rate: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSource, setSelectedSource] = useState('all');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showFilters, setShowFilters] = useState(false);
  const [creatingDemo, setCreatingDemo] = useState(false);

  useEffect(() => {
    fetchLeadsAndStats();
  }, []);

  const fetchLeadsAndStats = async (showLoader = true) => {
    try {
      if (showLoader) setLoading(true);
      else setRefreshing(true);
      setError(null);
      
      const [leadsResponse, statsResponse] = await Promise.all([
        apiService.getLeadsByStatus(),
        apiService.getLeadStatistics(),
      ]);

      if (leadsResponse.success && leadsResponse.data) {
        setLeads(leadsResponse.data);
      } else {
        setError('Failed to load leads data');
      }

      if (statsResponse.success && statsResponse.data) {
        setStatistics(statsResponse.data);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    fetchLeadsAndStats(false);
  };

  const handleCreateLead = async (leadData: CreateLeadData) => {
    try {
      const response = await apiService.createLead(leadData);
      if (response.success && response.data) {
        setLeads(prev => ({
          ...prev,
          [response.data!.status]: [...(prev[response.data!.status as keyof LeadsByStatus] || []), response.data!],
        }));
        
        setStatistics(prev => ({
          ...prev,
          total_leads: prev.total_leads + 1,
          new_leads: prev.new_leads + 1,
        }));
        
        setShowCreateModal(false);
      }
    } catch (error) {
      console.error('Failed to create lead:', error);
      throw error;
    }
  };

  const handleStatusChange = async (leadId: number, newStatus: string) => {
    try {
      const response = await apiService.updateLeadStatus(leadId, newStatus);
      if (response.success && response.data) {
        const updatedLead = response.data;
        
        setLeads(prev => {
          const newLeads = { ...prev };
          
          Object.keys(newLeads).forEach(status => {
            newLeads[status as keyof LeadsByStatus] = (newLeads[status as keyof LeadsByStatus] || []).filter(
              lead => lead.id !== leadId
            );
          });
          
          if (!newLeads[newStatus as keyof LeadsByStatus]) {
            newLeads[newStatus as keyof LeadsByStatus] = [];
          }
          newLeads[newStatus as keyof LeadsByStatus].push(updatedLead);
          
          return newLeads;
        });
        
        const statsResponse = await apiService.getLeadStatistics();
        if (statsResponse.success && statsResponse.data) {
          setStatistics(statsResponse.data);
        }
      }
    } catch (error) {
      console.error('Failed to update lead status:', error);
      throw error;
    }
  };

  const handleDeleteLead = async (leadId: number) => {
    if (!window.confirm('Are you sure you want to delete this lead?')) {
      return;
    }

    try {
      const response = await apiService.deleteLead(leadId);
      if (response.success) {
        setLeads(prev => {
          const newLeads = { ...prev };
          Object.keys(newLeads).forEach(status => {
            newLeads[status as keyof LeadsByStatus] = (newLeads[status as keyof LeadsByStatus] || []).filter(
              lead => lead.id !== leadId
            );
          });
          return newLeads;
        });
        
        setStatistics(prev => ({
          ...prev,
          total_leads: prev.total_leads - 1,
        }));
      }
    } catch (error) {
      console.error('Failed to delete lead:', error);
    }
  };

  const handleEditLead = (lead: Lead) => {
    console.log('Edit lead:', lead);
  };

  const handleCreateDemoData = async () => {
    try {
      setCreatingDemo(true);
      const response = await apiService.createDemoData();
      if (response.success) {
        // Refresh the dashboard data
        await fetchLeadsAndStats(false);
      }
    } catch (error) {
      console.error('Failed to create demo data:', error);
      setError('Failed to create demo data. Please try again.');
    } finally {
      setCreatingDemo(false);
    }
  };

  // Filter and sort leads
  const filteredAndSortedLeads = useMemo(() => {
    const filterLeads = (leadList: Lead[]) => {
      return leadList
        .filter(lead => {
          const matchesSearch = !searchTerm || 
            lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            lead.phone.includes(searchTerm);
          
          const matchesSource = selectedSource === 'all' || lead.lead_source === selectedSource;
          
          return matchesSearch && matchesSource;
        })
        .sort((a, b) => {
          let aValue = a[sortBy as keyof Lead] ?? '';
          let bValue = b[sortBy as keyof Lead] ?? '';
          
          if (sortBy === 'created_at' || sortBy === 'updated_at') {
            aValue = new Date(aValue as string).getTime();
            bValue = new Date(bValue as string).getTime();
          }
          
          if (sortOrder === 'asc') {
            return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
          } else {
            return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
          }
        });
    };

    return {
      new_lead: filterLeads(leads.new_lead || []),
      lead_sent: filterLeads(leads.lead_sent || []),
      deal_done: filterLeads(leads.deal_done || []),
    };
  }, [leads, searchTerm, selectedSource, sortBy, sortOrder]);

  const statusConfig = [
    {
      key: 'new_lead' as keyof LeadsByStatus,
      title: 'New Leads',
      color: 'bg-gradient-to-br from-gray-50 to-gray-100',
      borderColor: 'border-gray-200',
      headerColor: 'bg-gray-600',
      icon: '👤',
      count: filteredAndSortedLeads.new_lead.length,
    },
    {
      key: 'lead_sent' as keyof LeadsByStatus,
      title: 'In Progress',
      color: 'bg-gradient-to-br from-blue-50 to-blue-100',
      borderColor: 'border-blue-200',
      headerColor: 'bg-blue-600',
      icon: '🚀',
      count: filteredAndSortedLeads.lead_sent.length,
    },
    {
      key: 'deal_done' as keyof LeadsByStatus,
      title: 'Closed Won',
      color: 'bg-gradient-to-br from-green-50 to-green-100',
      borderColor: 'border-green-200',
      headerColor: 'bg-green-600',
      icon: '🎉',
      count: filteredAndSortedLeads.deal_done.length,
    },
  ];

  const leadSources = [
    { value: 'all', label: 'All Sources' },
    { value: 'website', label: 'Website' },
    { value: 'social_media', label: 'Social Media' },
    { value: 'referral', label: 'Referral' },
    { value: 'cold_call', label: 'Cold Call' },
    { value: 'email_marketing', label: 'Email Marketing' },
    { value: 'google_ads', label: 'Google Ads' },
    { value: 'other', label: 'Other' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center h-96">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Welcome back, {user?.first_name || user?.username}! 👋
              </h1>
              <p className="text-gray-600 mt-1">
                Here's what's happening with your leads today.
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                loading={refreshing}
                className="flex items-center"
              >
                <ArrowPathIcon className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Add Lead
              </Button>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="mb-8">
          <StatsCards statistics={statistics} />
        </div>

        {/* Filters and Search */}
        <div className="mb-6 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            {/* Search */}
            <div className="flex-1 max-w-md">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search leads..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>

            {/* Filters */}
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center"
              >
                <AdjustmentsHorizontalIcon className="h-4 w-4 mr-2" />
                Filters
              </Button>
              
              {showFilters && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center space-x-3"
                >
                  <select
                    value={selectedSource}
                    onChange={(e) => setSelectedSource(e.target.value)}
                    className="text-sm border border-gray-300 rounded-md px-3 py-1 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    {leadSources.map(source => (
                      <option key={source.value} value={source.value}>
                        {source.label}
                      </option>
                    ))}
                  </select>
                  
                  <select
                    value={`${sortBy}-${sortOrder}`}
                    onChange={(e) => {
                      const [field, order] = e.target.value.split('-');
                      setSortBy(field);
                      setSortOrder(order as 'asc' | 'desc');
                    }}
                    className="text-sm border border-gray-300 rounded-md px-3 py-1 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="created_at-desc">Newest First</option>
                    <option value="created_at-asc">Oldest First</option>
                    <option value="name-asc">Name A-Z</option>
                    <option value="name-desc">Name Z-A</option>
                  </select>
                </motion.div>
              )}
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4"
          >
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-800">{error}</p>
              </div>
              <div className="ml-auto pl-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setError(null)}
                  className="text-red-600 border-red-200 hover:bg-red-50"
                >
                  Dismiss
                </Button>
              </div>
            </div>
          </motion.div>
        )}

        {/* No Leads - Demo Data Option */}
        {statistics.total_leads === 0 && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16 bg-white rounded-lg border border-gray-200 mb-8"
          >
            <div className="text-6xl mb-4">🚀</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Welcome to your CRM Dashboard!
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              You don't have any leads yet. Get started by creating your first lead or adding some demo data to explore the features.
            </p>
            <div className="flex justify-center space-x-4">
              <Button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Create First Lead
              </Button>
              <Button
                variant="outline"
                onClick={handleCreateDemoData}
                loading={creatingDemo}
                className="flex items-center"
              >
                <ChartBarIcon className="h-4 w-4 mr-2" />
                Add Demo Data
              </Button>
            </div>
          </motion.div>
        )}

        {/* Lead Pipeline */}
        {statistics.total_leads > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {statusConfig.map((status, index) => (
              <motion.div
                key={status.key}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`${status.color} rounded-lg border ${status.borderColor} overflow-hidden`}
              >
                {/* Column Header */}
                <div className={`${status.headerColor} text-white px-4 py-3`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{status.icon}</span>
                      <h3 className="font-semibold text-sm">{status.title}</h3>
                    </div>
                    <span className="bg-white bg-opacity-20 px-2 py-1 rounded-full text-xs font-medium">
                      {status.count}
                    </span>
                  </div>
                </div>

                {/* Lead Cards */}
                <div className="p-4 space-y-4 min-h-[600px] max-h-[600px] overflow-y-auto">
                  <AnimatePresence>
                    {filteredAndSortedLeads[status.key].length === 0 ? (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-12"
                      >
                        <div className="text-gray-400 text-4xl mb-4">{status.icon}</div>
                        <p className="text-gray-500 text-sm">No leads in this stage</p>
                        {statistics.total_leads === 0 && (
                          <div className="mt-4">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={handleCreateDemoData}
                              loading={creatingDemo}
                              className="text-xs"
                            >
                              Add Demo Data
                            </Button>
                          </div>
                        )}
                      </motion.div>
                    ) : (
                      filteredAndSortedLeads[status.key].map((lead) => (
                        <motion.div
                          key={lead.id}
                          layout
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          transition={{ duration: 0.2 }}
                        >
                          <LeadCard
                            lead={lead}
                            onStatusChange={handleStatusChange}
                            onEdit={handleEditLead}
                            onDelete={handleDeleteLead}
                          />
                        </motion.div>
                      ))
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>

      {/* Create Lead Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <CreateLeadModal
            isOpen={showCreateModal}
            onClose={() => setShowCreateModal(false)}
            onSubmit={handleCreateLead}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Dashboard; 