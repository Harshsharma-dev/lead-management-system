import React from 'react';
import { motion } from 'framer-motion';
import { LeadStatistics } from '../../types';
import {
  UserGroupIcon,
  PlusCircleIcon,
  PaperAirplaneIcon,
  CheckCircleIcon,
  ArrowTrendingUpIcon,
  ArrowUpIcon,
  ArrowDownIcon
} from '@heroicons/react/24/outline';

interface StatsCardsProps {
  statistics: LeadStatistics;
}

const StatsCards: React.FC<StatsCardsProps> = ({ statistics }) => {
  const stats = [
    {
      id: 'total',
      name: 'Total Leads',
      value: statistics.total_leads,
      change: '+12%',
      changeType: 'increase' as const,
      icon: UserGroupIcon,
      color: 'bg-gradient-to-r from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
      description: 'All leads in your pipeline'
    },
    {
      id: 'new',
      name: 'New Leads',
      value: statistics.new_leads,
      change: '+8%',
      changeType: 'increase' as const,
      icon: PlusCircleIcon,
      color: 'bg-gradient-to-r from-green-500 to-green-600',
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600',
      description: 'Fresh leads to process'
    },
    {
      id: 'sent',
      name: 'In Progress',
      value: statistics.leads_sent,
      change: '+3%',
      changeType: 'increase' as const,
      icon: PaperAirplaneIcon,
      color: 'bg-gradient-to-r from-yellow-500 to-yellow-600',
      bgColor: 'bg-yellow-50',
      iconColor: 'text-yellow-600',
      description: 'Leads being worked on'
    },
    {
      id: 'closed',
      name: 'Closed Won',
      value: statistics.deals_done,
      change: '+15%',
      changeType: 'increase' as const,
      icon: CheckCircleIcon,
      color: 'bg-gradient-to-r from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600',
      description: 'Successfully closed deals'
    },
  ];

  const conversionRate = statistics.conversion_rate || 0;

  return (
    <div className="space-y-6">
      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200"
          >
            <div className="flex items-center">
              <div className={`flex-shrink-0 p-3 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-6 w-6 ${stat.iconColor}`} />
              </div>
              <div className="ml-4 flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {stat.value?.toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      stat.changeType === 'increase' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {stat.changeType === 'increase' ? (
                        <ArrowUpIcon className="h-3 w-3 mr-1" />
                      ) : (
                        <ArrowDownIcon className="h-3 w-3 mr-1" />
                      )}
                      {stat.change}
                    </div>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-1">{stat.description}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Conversion Rate Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="flex-shrink-0 p-3 rounded-lg bg-indigo-50">
              <ArrowTrendingUpIcon className="h-6 w-6 text-indigo-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">Conversion Rate</h3>
              <p className="text-sm text-gray-600">Percentage of leads that convert to deals</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-gray-900">
              {conversionRate.toFixed(1)}%
            </div>
            <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              <ArrowUpIcon className="h-3 w-3 mr-1" />
              +5.2%
            </div>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="mt-4">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Goal: 25%</span>
            <span>Current: {conversionRate.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(conversionRate / 25 * 100, 100)}%` }}
              transition={{ delay: 0.6, duration: 1 }}
              className={`h-2 rounded-full ${
                conversionRate >= 25 
                  ? 'bg-gradient-to-r from-green-500 to-green-600'
                  : conversionRate >= 15
                  ? 'bg-gradient-to-r from-yellow-500 to-yellow-600'
                  : 'bg-gradient-to-r from-red-500 to-red-600'
              }`}
            />
          </div>
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-xl shadow-sm p-6 text-white"
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Quick Insights</h3>
            <p className="text-gray-300 text-sm mt-1">Key metrics at a glance</p>
          </div>
          <div className="flex space-x-6">
            <div className="text-center">
              <div className="text-2xl font-bold">
                {statistics.total_leads > 0 ? Math.round((statistics.leads_sent / statistics.total_leads) * 100) : 0}%
              </div>
              <div className="text-xs text-gray-300">Active Rate</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">
                {statistics.total_leads > 0 ? Math.round((statistics.deals_done / statistics.total_leads) * 100) : 0}%
              </div>
              <div className="text-xs text-gray-300">Success Rate</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">
                {statistics.total_leads - statistics.deals_done - statistics.leads_sent}
              </div>
              <div className="text-xs text-gray-300">Pending</div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default StatsCards; 