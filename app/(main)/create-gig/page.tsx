'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/contexts/AuthContext';
import { taskApi, categoryApi, type Category } from '@/lib/api';
import { Loader2, Plus, Minus } from 'lucide-react';
import { useRequireRole } from '@/hooks/useAuth';

export default function CreateGigPage() {
  useRequireRole(['CLIENT', 'ADMIN']);
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    categoryId: '',
    budget: '',
    deadline: '',
    remote: false,
    location: '',
    tags: [''],
  });

  useEffect(() => {
    categoryApi.getAll().then(setCategories).catch(() => setCategories([]));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!formData.categoryId) {
      setError('Please select a category');
      return;
    }

    setLoading(true);
    setError('');

    const budgetNum = Number(formData.budget);
    if (Number.isNaN(budgetNum) || budgetNum <= 0) {
      setError('Enter a valid budget');
      setLoading(false);
      return;
    }

    const tags = formData.tags.map((t) => t.trim()).filter(Boolean);
    const deadlineLocal = formData.deadline ? `${formData.deadline}T12:00:00` : undefined;

    try {
      await taskApi.createTask({
        title: formData.title,
        description: formData.description,
        categoryId: Number(formData.categoryId),
        budgetMin: budgetNum,
        budgetMax: budgetNum,
        deadline: deadlineLocal,
        requiredSkills: tags.length ? tags.join(', ') : undefined,
        location: formData.location || undefined,
        isRemote: formData.remote,
      });
      router.push('/dashboard');
    } catch (err: unknown) {
      const ax = err as { response?: { data?: { message?: string } } };
      setError(ax.response?.data?.message || 'Failed to create gig');
    } finally {
      setLoading(false);
    }
  };

  const addTag = () => setFormData({ ...formData, tags: [...formData.tags, ''] });
  const removeTag = (index: number) =>
    setFormData({ ...formData, tags: formData.tags.filter((_, i) => i !== index) });
  const updateTag = (index: number, value: string) => {
    const newTags = [...formData.tags];
    newTags[index] = value;
    setFormData({ ...formData, tags: newTags });
  };

  return (
    <div className="min-h-screen py-20">
      <div className="container mx-auto px-4 max-w-3xl">
        <h1 className="text-4xl font-bold mb-8">Create a Gig</h1>

        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-600/10 text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Gig Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Build a responsive website"
              required
              minLength={5}
              className="w-full p-3 rounded-lg border border-border bg-card"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Description *</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe your requirements in detail..."
              rows={6}
              required
              className="w-full p-3 rounded-lg border border-border bg-card"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">Category *</label>
              <select
                value={formData.categoryId}
                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                required
                className="w-full p-3 rounded-lg border border-border bg-card"
              >
                <option value="">Select a category</option>
                {categories.map((c) => (
                  <option key={c.id} value={String(c.id)}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Budget (₹) *</label>
              <input
                type="number"
                min={1}
                step={1}
                value={formData.budget}
                onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                placeholder="Enter amount"
                required
                className="w-full p-3 rounded-lg border border-border bg-card"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">Deadline (optional)</label>
              <input
                type="date"
                value={formData.deadline}
                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                className="w-full p-3 rounded-lg border border-border bg-card"
              />
            </div>
            <div className="flex items-center gap-2 pt-8">
              <input
                id="remote"
                type="checkbox"
                checked={formData.remote}
                onChange={(e) => setFormData({ ...formData, remote: e.target.checked })}
                className="rounded border-border"
              />
              <label htmlFor="remote" className="text-sm font-medium">
                Remote work
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Location (optional)</label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="City or region"
              className="w-full p-3 rounded-lg border border-border bg-card"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Skills / tags</label>
            {formData.tags.map((tag, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={tag}
                  onChange={(e) => updateTag(index, e.target.value)}
                  placeholder="e.g., React, Node.js"
                  className="flex-1 p-3 rounded-lg border border-border bg-card"
                />
                {formData.tags.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeTag(index)}
                    className="p-3 rounded-lg border border-border hover:bg-red-600/10"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addTag}
              className="flex items-center gap-2 text-sm text-blue-600 hover:underline"
            >
              <Plus className="w-4 h-4" />
              Add tag
            </button>
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 rounded-lg gradient-hero text-white font-semibold hover:opacity-90 disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating...
                </span>
              ) : (
                'Create Gig'
              )}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-3 rounded-lg border border-border hover:bg-muted"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
