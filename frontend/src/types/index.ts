// Authentication types
export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  date_joined: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    access_token: string;
    refresh_token: string;
  };
}

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  password_confirm: string;
  first_name: string;
  last_name: string;
}

// Lead types
export interface Lead {
  id: number;
  name: string;
  phone: string;
  email: string;
  lead_source: string;
  lead_source_display: string;
  status: 'new_lead' | 'lead_sent' | 'deal_done';
  status_display: string;
  status_color: string;
  notes?: string;
  created_by: number;
  created_by_name: string;
  created_at: string;
  updated_at: string;
}

export interface CreateLeadData {
  name: string;
  phone: string;
  email: string;
  lead_source: string;
  notes?: string;
}

export interface UpdateLeadData {
  name?: string;
  phone?: string;
  email?: string;
  lead_source?: string;
  status?: string;
  notes?: string;
}

export interface LeadsByStatus {
  new_lead: Lead[];
  lead_sent: Lead[];
  deal_done: Lead[];
}

export interface LeadStatistics {
  total_leads: number;
  new_leads: number;
  leads_sent: number;
  deals_done: number;
  conversion_rate: number;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: Record<string, string[]>;
}

export interface ApiError {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
}

// Form types
export interface FormFieldProps {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
  options?: { value: string; label: string }[];
  register: any;
  error?: string;
  className?: string;
}

// Lead source options
export const LEAD_SOURCE_OPTIONS = [
  { value: 'website', label: 'Website' },
  { value: 'social_media', label: 'Social Media' },
  { value: 'referral', label: 'Referral' },
  { value: 'cold_call', label: 'Cold Call' },
  { value: 'email_marketing', label: 'Email Marketing' },
  { value: 'google_ads', label: 'Google Ads' },
  { value: 'facebook_ads', label: 'Facebook Ads' },
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'other', label: 'Other' },
];

// Lead status options
export const LEAD_STATUS_OPTIONS = [
  { value: 'new_lead', label: 'New Lead' },
  { value: 'lead_sent', label: 'Lead Sent' },
  { value: 'deal_done', label: 'Deal Done' },
];

// Status colors
export const STATUS_COLORS: Record<string, string> = {
  new_lead: '#6B7280',    // Gray
  lead_sent: '#3B82F6',   // Blue
  deal_done: '#10B981',   // Green
};

// Status display names
export const STATUS_DISPLAY: Record<string, string> = {
  new_lead: 'New Lead',
  lead_sent: 'Lead Sent',
  deal_done: 'Deal Done',
}; 