import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Lead, LEAD_STATUS_OPTIONS } from '../../types';
import Button from '../common/Button';
import {
  EnvelopeIcon,
  PhoneIcon,
  GlobeAltIcon,
  CalendarIcon,
  UserIcon,
  EllipsisVerticalIcon,
  PencilIcon,
  TrashIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

interface LeadCardProps {
  lead: Lead;
  onStatusChange: (leadId: number, newStatus: string) => Promise<void>;
  onEdit: (lead: Lead) => void;
  onDelete: (leadId: number) => Promise<void>;
}

const LeadCard: React.FC<LeadCardProps> = ({ lead, onStatusChange, onEdit, onDelete }) => {
  const [isChangingStatus, setIsChangingStatus] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const handleStatusChange = async (newStatus: string) => {
    if (newStatus === lead.status) return;
    
    try {
      setIsChangingStatus(true);
      await onStatusChange(lead.id, newStatus);
    } catch (error) {
      console.error('Failed to update status:', error);
    } finally {
      setIsChangingStatus(false);
    }
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'new_lead':
        return {
          badge: 'bg-gray-100 text-gray-800 border-gray-200',
          icon: UserIcon,
          color: 'text-gray-600'
        };
      case 'lead_sent':
        return {
          badge: 'bg-blue-100 text-blue-800 border-blue-200',
          icon: ClockIcon,
          color: 'text-blue-600'
        };
      case 'deal_done':
        return {
          badge: 'bg-green-100 text-green-800 border-green-200',
          icon: CheckCircleIcon,
          color: 'text-green-600'
        };
      default:
        return {
          badge: 'bg-gray-100 text-gray-800 border-gray-200',
          icon: ExclamationTriangleIcon,
          color: 'text-gray-600'
        };
    }
  };

  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'website':
        return GlobeAltIcon;
      case 'social_media':
        return '📱';
      case 'referral':
        return '👥';
      case 'cold_call':
        return PhoneIcon;
      case 'email_marketing':
        return EnvelopeIcon;
      default:
        return GlobeAltIcon;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 3600 * 24));
    
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    });
  };

  const statusConfig = getStatusConfig(lead.status);
  const StatusIcon = statusConfig.icon;
  const SourceIcon = getSourceIcon(lead.lead_source);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95, y: -20 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      className="bg-white rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all duration-200 overflow-hidden group"
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-2">
              <h3 className="text-lg font-semibold text-gray-900 truncate">
                {lead.name}
              </h3>
              <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${statusConfig.badge}`}>
                <StatusIcon className="h-3 w-3 mr-1" />
                {lead.status_display}
              </div>
            </div>
            
            <div className="flex items-center text-sm text-gray-500 space-x-4">
              <div className="flex items-center">
                <CalendarIcon className="h-4 w-4 mr-1" />
                {formatDate(lead.created_at)}
              </div>
              <div className="flex items-center">
                {typeof SourceIcon === 'string' ? (
                  <span className="mr-1">{SourceIcon}</span>
                ) : (
                  <SourceIcon className="h-4 w-4 mr-1" />
                )}
                {lead.lead_source_display}
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowActions(!showActions)}
              className="p-1 rounded-md hover:bg-gray-100 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <EllipsisVerticalIcon className="h-4 w-4 text-gray-400" />
            </button>
          </div>
        </div>
      </div>

      {/* Contact Info */}
      <div className="p-4 space-y-3">
        <div className="flex items-center text-sm text-gray-600">
          <EnvelopeIcon className="h-4 w-4 mr-3 text-gray-400" />
          <a 
            href={`mailto:${lead.email}`}
            className="text-blue-600 hover:text-blue-800 hover:underline transition-colors"
          >
            {lead.email}
          </a>
        </div>
        
        <div className="flex items-center text-sm text-gray-600">
          <PhoneIcon className="h-4 w-4 mr-3 text-gray-400" />
          <a 
            href={`tel:${lead.phone}`}
            className="text-blue-600 hover:text-blue-800 hover:underline transition-colors"
          >
            {lead.phone}
          </a>
        </div>

        {lead.notes && (
          <div className="mt-3 p-3 bg-gray-50 rounded-md">
            <p className="text-sm text-gray-700 line-clamp-2">
              {lead.notes}
            </p>
            {lead.notes.length > 100 && (
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="text-xs text-blue-600 hover:text-blue-800 mt-1"
              >
                {showDetails ? 'Show less' : 'Show more'}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Status Change */}
      <div className="px-4 pb-4">
        <label className="block text-xs font-medium text-gray-700 mb-2">
          Update Status
        </label>
        <select
          value={lead.status}
          onChange={(e) => handleStatusChange(e.target.value)}
          disabled={isChangingStatus}
          className="block w-full text-sm border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {LEAD_STATUS_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Actions Menu */}
      {showActions && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="border-t border-gray-100 p-4 bg-gray-50"
        >
          <div className="flex items-center justify-between">
            <div className="text-xs text-gray-500">
              Created by {lead.created_by_name}
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(lead)}
                className="flex items-center text-gray-600 border-gray-300 hover:bg-gray-100"
              >
                <PencilIcon className="h-3 w-3 mr-1" />
                Edit
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDelete(lead.id)}
                className="flex items-center text-red-600 border-red-300 hover:bg-red-50"
              >
                <TrashIcon className="h-3 w-3 mr-1" />
                Delete
              </Button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Extended Details */}
      {showDetails && lead.notes && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="border-t border-gray-100 p-4 bg-blue-50"
        >
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-900">Full Notes</h4>
            <p className="text-sm text-gray-700">{lead.notes}</p>
            <div className="flex justify-between text-xs text-gray-500 pt-2 border-t border-blue-100">
              <span>Last updated: {formatDate(lead.updated_at)}</span>
              <span>ID: #{lead.id}</span>
            </div>
          </div>
        </motion.div>
      )}

      {/* Loading Overlay */}
      {isChangingStatus && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center rounded-lg"
        >
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent"></div>
            <span>Updating...</span>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default LeadCard; 