import type { Task } from '@/lib/api/types';

/** Human-readable budget from task-service budgetMin / budgetMax. */
export function formatTaskBudget(task: Task): string {
  const min = task.budgetMin;
  const max = task.budgetMax;
  if (min != null && max != null) {
    if (Number(min) === Number(max)) return `₹${min}`;
    return `₹${min} – ₹${max}`;
  }
  if (max != null) return `₹${max}`;
  if (min != null) return `₹${min}`;
  return '—';
}

export function categoryNameFromList(
  categoryId: number,
  categories: { id: number; name: string }[]
): string {
  return categories.find((c) => c.id === categoryId)?.name ?? `Category #${categoryId}`;
}
