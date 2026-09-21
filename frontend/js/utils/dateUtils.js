export function formatDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}
export function formatDateShort(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}
export function daysUntil(dateStr) {
  if (!dateStr) return null;
  const target = new Date(dateStr);
  target.setHours(0,0,0,0);
  const now = new Date();
  now.setHours(0,0,0,0);
  return Math.ceil((target - now) / (1000 * 60 * 60 * 24));
}
export function daysFromNow(dateStr) { return daysUntil(dateStr); }
export function getDeadlineStatus(deadline) {
  if (!deadline) return { status: 'No deadline', daysRemaining: null };
  const days = daysUntil(deadline);
  if (days < 0) return { status: 'Expired', daysRemaining: days };
  if (days <= 3) return { status: 'Urgent', daysRemaining: days };
  if (days <= 14) return { status: 'Approaching', daysRemaining: days };
  return { status: 'Normal', daysRemaining: days };
}
export function getExpiryStatus(expiryDate) {
  if (!expiryDate) return { status: 'No expiry', daysRemaining: null };
  const days = daysUntil(expiryDate);
  if (days < 0) return { status: 'Expired', daysRemaining: days };
  if (days <= 30) return { status: 'Expiring Soon', daysRemaining: days };
  return { status: 'Valid', daysRemaining: days };
}
