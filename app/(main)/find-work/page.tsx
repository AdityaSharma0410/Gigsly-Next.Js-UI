'use client';

import { useState, useEffect } from 'react';
import { taskApi, type Task } from '@/lib/api';
import { formatTaskBudget } from '@/lib/taskDisplay';
import Link from 'next/link';
import { Search, Briefcase, Loader2, Filter } from 'lucide-react';
import { motion } from 'framer-motion';

export default function FindWorkPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [keyword, setKeyword] = useState('');

  useEffect(() => {
    loadTasks();
  }, [currentPage]);

  const loadTasks = async () => {
    setLoading(true);
    try {
      const response = keyword 
        ? await taskApi.search({ keyword, page: currentPage, size: 12 })
        : await taskApi.browse({ status: 'OPEN', page: currentPage, size: 12 });
      setTasks(response.content);
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error('Failed to load tasks', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-20">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold mb-8">Find Work</h1>
        
        <div className="mb-8 flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && loadTasks()}
              placeholder="Search for projects..."
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

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : tasks.length === 0 ? (
          <div className="text-center py-20">
            <Briefcase className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">No projects available</h3>
            <p className="text-muted-foreground">Check back later for new opportunities</p>
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
                    <div className="h-32 bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                      <Briefcase className="w-10 h-10 text-blue-600" />
                    </div>
                    <div className="p-4">
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
                <span className="px-4 py-2">Page {currentPage + 1} of {totalPages}</span>
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
  );
}
