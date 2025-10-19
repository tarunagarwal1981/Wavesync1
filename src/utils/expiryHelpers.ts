// Utility functions for document expiry status

export type ExpiryStatus = 'valid' | 'expiring_soon' | 'expiring_urgent' | 'expired' | 'no_expiry';

export interface ExpiryStatusInfo {
  status: ExpiryStatus;
  label: string;
  color: string;
  bgColor: string;
  icon: string;
  urgency: 'low' | 'medium' | 'high' | 'critical';
}

/**
 * Calculate the expiry status based on a date
 */
export function getExpiryStatus(expiryDate: string | null | undefined): ExpiryStatus {
  if (!expiryDate) return 'no_expiry';
  
  const expiry = new Date(expiryDate);
  const today = new Date();
  const daysUntilExpiry = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  
  if (daysUntilExpiry < 0) return 'expired';
  if (daysUntilExpiry <= 30) return 'expiring_urgent';
  if (daysUntilExpiry <= 90) return 'expiring_soon';
  return 'valid';
}

/**
 * Get days until expiry
 */
export function getDaysUntilExpiry(expiryDate: string | null | undefined): number | null {
  if (!expiryDate) return null;
  
  const expiry = new Date(expiryDate);
  const today = new Date();
  return Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

/**
 * Get human-readable text for days until expiry
 */
export function getExpiryText(expiryDate: string | null | undefined): string {
  if (!expiryDate) return 'No expiry date';
  
  const days = getDaysUntilExpiry(expiryDate);
  if (days === null) return 'No expiry date';
  
  if (days < 0) return `Expired ${Math.abs(days)} day${Math.abs(days) !== 1 ? 's' : ''} ago`;
  if (days === 0) return 'Expires today';
  if (days === 1) return 'Expires tomorrow';
  return `Expires in ${days} day${days !== 1 ? 's' : ''}`;
}

/**
 * Get expiry status information for UI display
 */
export function getExpiryStatusInfo(expiryDate: string | null | undefined): ExpiryStatusInfo {
  const status = getExpiryStatus(expiryDate);
  
  const statusMap: Record<ExpiryStatus, ExpiryStatusInfo> = {
    'expired': {
      status: 'expired',
      label: 'Expired',
      color: '#ef4444',
      bgColor: '#fee2e2',
      icon: '❌',
      urgency: 'critical'
    },
    'expiring_urgent': {
      status: 'expiring_urgent',
      label: 'Expires Soon',
      color: '#f59e0b',
      bgColor: '#fef3c7',
      icon: '⚠️',
      urgency: 'high'
    },
    'expiring_soon': {
      status: 'expiring_soon',
      label: 'Expiring',
      color: '#eab308',
      bgColor: '#fef9c3',
      icon: '⏰',
      urgency: 'medium'
    },
    'valid': {
      status: 'valid',
      label: 'Valid',
      color: '#10b981',
      bgColor: '#d1fae5',
      icon: '✅',
      urgency: 'low'
    },
    'no_expiry': {
      status: 'no_expiry',
      label: 'No Expiry',
      color: '#6b7280',
      bgColor: '#f3f4f6',
      icon: '📄',
      urgency: 'low'
    }
  };
  
  return statusMap[status];
}

/**
 * Check if a document is expiring or expired
 */
export function isExpiringOrExpired(expiryDate: string | null | undefined): boolean {
  const status = getExpiryStatus(expiryDate);
  return status === 'expired' || status === 'expiring_urgent' || status === 'expiring_soon';
}

/**
 * Get expiry badge class name (for CSS modules)
 */
export function getExpiryBadgeClass(expiryDate: string | null | undefined): string {
  const status = getExpiryStatus(expiryDate);
  return `expiry-badge expiry-${status}`;
}

/**
 * Sort documents by expiry urgency
 */
export function sortByExpiryUrgency<T extends { expiry_date?: string | null }>(
  documents: T[]
): T[] {
  return [...documents].sort((a, b) => {
    const daysA = getDaysUntilExpiry(a.expiry_date);
    const daysB = getDaysUntilExpiry(b.expiry_date);
    
    // No expiry date goes to the end
    if (daysA === null) return 1;
    if (daysB === null) return -1;
    
    // Sort by days until expiry (ascending)
    return daysA - daysB;
  });
}

/**
 * Filter documents by expiry status
 */
export function filterByExpiryStatus<T extends { expiry_date?: string | null }>(
  documents: T[],
  statuses: ExpiryStatus[]
): T[] {
  return documents.filter(doc => {
    const status = getExpiryStatus(doc.expiry_date);
    return statuses.includes(status);
  });
}

/**
 * Get count of documents by expiry status
 */
export function getExpiryStatusCounts<T extends { expiry_date?: string | null }>(
  documents: T[]
): Record<ExpiryStatus, number> {
  const counts: Record<ExpiryStatus, number> = {
    'expired': 0,
    'expiring_urgent': 0,
    'expiring_soon': 0,
    'valid': 0,
    'no_expiry': 0
  };
  
  documents.forEach(doc => {
    const status = getExpiryStatus(doc.expiry_date);
    counts[status]++;
  });
  
  return counts;
}

