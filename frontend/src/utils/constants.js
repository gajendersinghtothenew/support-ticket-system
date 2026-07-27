export const TICKET_STATUSES = {
  open: 'Open',
  in_progress: 'In Progress',
  waiting_on_customer: 'Waiting on Customer',
  resolved: 'Resolved',
  reopened: 'Reopened',
  closed: 'Closed',
}

export const TICKET_PRIORITIES = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  urgent: 'Urgent',
}

export const TICKET_CATEGORIES = {
  it_support: 'IT Support',
  access: 'Access',
  admin_issue: 'Admin Issue',
  hr: 'HR',
}

export const STATUS_BADGE_VARIANTS = {
  open: 'info',
  in_progress: 'primary',
  waiting_on_customer: 'warning',
  resolved: 'success',
  reopened: 'info',
  closed: 'neutral',
}

export const PRIORITY_BADGE_VARIANTS = {
  low: 'neutral',
  medium: 'info',
  high: 'warning',
  urgent: 'danger',
}

/** Mirrors backend tickets/services/workflow.py AGENT_TRANSITIONS */
export const AGENT_STATUS_TRANSITIONS = {
  open: ['in_progress', 'closed'],
  in_progress: ['waiting_on_customer', 'resolved', 'closed'],
  waiting_on_customer: ['in_progress'],
  resolved: ['closed', 'reopened'],
  reopened: ['in_progress'],
  closed: ['reopened'],
}

/** Mirrors backend CUSTOMER_TRANSITIONS */
export const CUSTOMER_STATUS_TRANSITIONS = {
  resolved: ['reopened'],
  closed: ['reopened'],
}

export function getAllowedStatusTransitions(currentStatus, role) {
  if (role === 'agent' || role === 'admin') {
    return AGENT_STATUS_TRANSITIONS[currentStatus] || []
  }
  return CUSTOMER_STATUS_TRANSITIONS[currentStatus] || []
}
