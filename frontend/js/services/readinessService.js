export function calculateReadiness(application, requirements) {
  const reqs = requirements || [];
  const required = reqs.filter(r => r.required !== false);
  const total = required.length;
  const completed = required.filter(r => r.completed);
  const completedCount = completed.length;
  const percentage = total === 0 ? 0 : Math.round((completedCount / total) * 100);
  const ready = total > 0 && completedCount === total;
  const missing = required.filter(r => !r.completed).map(r => ({ id: r.id, title: r.title }));
  return { total, completed: completedCount, percentage, ready, missing };
}

