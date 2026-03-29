'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { taskApi, categoryApi, type Task, type Category } from '@/lib/api';
import { formatTaskBudget, categoryNameFromList } from '@/lib/taskDisplay';
import Link from 'next/link';
import { Search, Filter, Briefcase, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

function BrowseContent() {
  const searchParams = useSearchParams();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);

  const [filters, setFilters] = useState({
    keyword: searchParams.get('keyword') || '',
    categoryId: '',
    minBudget: '',
    maxBudget: '',
    sortBy: 'createdAt',
    sortDirection: 'DESC' as 'ASC' | 'DESC',
  });

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    loadTasks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, currentPage]);

  const loadCategories = async () => {
    try {
      const data = await categoryApi.getAll();
      setCategories(data);
    } catch (error) {
      console.error('Failed to load categories', error);
    }
  };

  const loadTasks = async () => {
    setLoading(true);
    try {
      const sortBy =
        filters.sortBy === 'budget' ? 'budgetMax' : filters.sortBy;
      const response = filters.keyword
        ? await taskApi.search({
            keyword: filters.keyword,
            page: currentPage,
            size: 12,
          })
        : await taskApi.browse({
            categoryId: filters.categoryId ? Number(filters.categoryId) : undefined,
            minBudget: filters.minBudget ? Number(filters.minBudget) : undefined,
            maxBudget: filters.maxBudget ? Number(filters.maxBudget) : undefined,
            status: 'OPEN',
            page: currentPage,
            size: 12,
            sortBy,
            sortDirection: filters.sortDirection,
          });
      setTasks(response.content);
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error('Failed to load tasks', error);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-20">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">Browse Gigs</h1>
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                value={filters.keyword}
                onChange={(e) => setFilters({ ...filters, keyword: e.target.value })}
                onKeyPress={(e) => e.key === 'Enter' && loadTasks()}
                placeholder="Search for services..."
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-border bg-card"
              />
            </div>
            <button
              onClick={loadTasks}
              className="px-6 py-3 rounded-xl gradient-hero text-white font-semibold hover:opacity-90"
            >
              Search
            </button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          <aside className="lg:w-64 shrink-0">
            <div className="lg:sticky lg:top-20 space-y-6">
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  Filters
                </h3>
                
                <div className="mb-4">
                  <label className="text-sm font-medium mb-2 block">Category</label>
                  <select
                    value={filters.categoryId}
                    onChange={(e) => setFilters({ ...filters, categoryId: e.target.value })}
                    className="w-full p-2 rounded-lg border border-border bg-card"
                  >
                    <option value="">All Categories</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={String(cat.id)}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mb-4">
                  <label className="text-sm font-medium mb-2 block">Budget Range</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={filters.minBudget}
                      onChange={(e) => setFilters({ ...filters, minBudget: e.target.value })}
                      className="w-full p-2 rounded-lg border border-border bg-card"
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      value={filters.maxBudget}
                      onChange={(e) => setFilters({ ...filters, maxBudget: e.target.value })}
                      className="w-full p-2 rounded-lg border border-border bg-card"
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="text-sm font-medium mb-2 block">Sort By</label>
                  <select
                    value={filters.sortBy}
                    onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
                    className="w-full p-2 rounded-lg border border-border bg-card"
                  >
                    <option value="createdAt">Latest</option>
                    <option value="budget">Budget</option>
                    <option value="deadline">Deadline</option>
                  </select>
                </div>

                <button
                  onClick={() => {
                    setFilters({
                      keyword: '',
                      categoryId: '',
                      minBudget: '',
                      maxBudget: '',
                      sortBy: 'createdAt',
                      sortDirection: 'DESC',
                    });
                    setCurrentPage(0);
                  }}
                  className="w-full py-2 px-4 rounded-lg border border-border hover:bg-muted"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </aside>

          <div className="flex-1">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              </div>
            ) : tasks.length === 0 ? (
              <div className="text-center py-20">
                <Briefcase className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-semibold mb-2">No gigs found</h3>
                <p className="text-muted-foreground">Try adjusting your filters</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {tasks.map((task, i) => (
                    <motion.div
                      key={task.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                    >
                      <Link
                        href={`/gig/${task.id}`}
                        className="block border border-border rounded-xl overflow-hidden hover-lift bg-card"
                      >
                        <div className="h-40 bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                          <Briefcase className="w-12 h-12 text-blue-600" />
                        </div>
                        <div className="p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs px-2 py-1 rounded-full bg-blue-600/10 text-blue-600">
                              {categoryNameFromList(task.categoryId, categories)}
                            </span>
                            {task.priority === 'URGENT' && (
                              <span className="text-xs px-2 py-1 rounded-full bg-red-600/10 text-red-600">
                                Urgent
                              </span>
                            )}
                          </div>
                          <h3 className="font-semibold mb-2 line-clamp-2">{task.title}</h3>
                          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                            {task.description}
                          </p>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">
                              {task.isRemote ? 'Remote' : 'On-site'}
                            </span>
                            <span className="text-lg font-bold text-blue-600">{formatTaskBudget(task)}</span>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="flex justify-center gap-2 mt-8">
                    <button
                      onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                      disabled={currentPage === 0}
                      className="px-4 py-2 rounded-lg border border-border hover:bg-muted disabled:opacity-50"
                    >
                      Previous
                    </button>
                    <span className="px-4 py-2">
                      Page {currentPage + 1} of {totalPages}
                    </span>
                    <button
                      onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
                      disabled={currentPage >= totalPages - 1}
                      className="px-4 py-2 rounded-lg border border-border hover:bg-muted disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function BrowsePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    }>
      <BrowseContent />
    </Suspense>
  );
}
