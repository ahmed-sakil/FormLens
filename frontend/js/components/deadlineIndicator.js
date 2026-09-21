import { createElement } from '../utils/domUtils.js';
import { getDeadlineStatus, formatDateShort } from '../utils/dateUtils.js';

export function createDeadlineIndicator(deadline) {
  const { status, daysRemaining } = getDeadlineStatus(deadline);
  
  if (!deadline) {
    return createElement('div', { className: 'deadline-badge deadline-normal' }, 'No deadline set');
  }
  
  let statusClass = 'deadline-normal';
  if (status === 'Urgent') statusClass = 'deadline-urgent';
  else if (status === 'Approaching') statusClass = 'deadline-approaching';
  else if (status === 'Expired') statusClass = 'deadline-expired';
  
  const text = daysRemaining !== null && daysRemaining >= 0 
    ? `${formatDateShort(deadline)} (${daysRemaining} days left)` 
    : `${formatDateShort(deadline)} (Expired)`;
    
  return createElement('div', { className: `deadline-badge ${statusClass}` },
    createElement('span', {}, '📅'),
    createElement('span', {}, text)
  );
}
