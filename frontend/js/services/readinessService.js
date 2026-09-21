export function calculateReadiness(application, requirements) {
  const required = requirements.filter(r => r.required);
  const completed = required.filter(r => r.completed);
  const missing = required.filter(r => !r.completed).map(r => ({ id: r.id, title: r.title }));
  const total = required.length;
  const completedCount = completed.length;
  const percentage = total === 0 ? 100 : Math.round((completedCount / total) * 100);
  const ready = total > 0 && completedCount === total;
  return { total, completed: completedCount, percentage, ready, missing };
}
