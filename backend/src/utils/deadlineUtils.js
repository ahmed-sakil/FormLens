import { DEADLINE_APPROACHING_DAYS, DEADLINE_URGENT_DAYS } from '../config/constants.js';

export function getDeadlineStatus(deadline) {
  if (!deadline) return { status: 'No deadline', daysRemaining: null };
  const now = new Date();
  const d = new Date(deadline);
  const diffTime = d - now;
  const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (daysRemaining < 0) return { status: 'Expired', daysRemaining };
  if (daysRemaining <= DEADLINE_URGENT_DAYS) return { status: 'Urgent', daysRemaining };
  if (daysRemaining <= DEADLINE_APPROACHING_DAYS) return { status: 'Approaching', daysRemaining };
  return { status: 'Normal', daysRemaining };
}
