'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, useRequireAuth } from '@/hooks/useAuth';
import { taskApi, proposalApi, categoryApi, type Task, type Proposal, type Category } from '@/lib/api';
import { formatTaskBudget, categoryNameFromList } from '@/lib/taskDisplay';
import Link from 'next/link';
import { Briefcase, FileText, TrendingUp, DollarSign, Loader2, Plus } from 'lucide-react';

export default function DashboardPage() {
  useRequireAuth();
  const router = useRouter();
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingTaskId, setUpdatingTaskId] = useState<number | null>(null);

  useEffect(() => {
    if (user?.role === 'ADMIN') {
      router.replace('/admin');
      return;
    }
    if (user) loadDashboardData();
  }, [user, router]);

  const loadDashboardData = async () => {
    if (!user) return;
    try {
      const cats = await categoryApi.getAll().catch(() => [] as Category[]);
      setCategories(cats);
      if (user.role === 'CLIENT') {
        const [myTasks, incomingProposals] = await Promise.all([
          taskApi.getMine(),
          proposalApi.getMine().catch(() => [] as Proposal[]),
        ]);
        setTasks(myTasks);
        setProposals(incomingProposals);
      } else if (user.role === 'PROFESSIONAL') {
        const myProposals = await proposalApi.getMine();
        setProposals(myProposals);
      }
    } catch (error) {
      console.error('Failed to load dashboard', error);
    } finally {
      setLoading(false);
    }
  };

  const updateTaskStatus = async (taskId: number, status: 'IN_PROGRESS' | 'COMPLETED', assignedProfessionalId?: number) => {
    try {
      setUpdatingTaskId(taskId);
      await taskApi.updateStatus(taskId, status, assignedProfessionalId);
      await loadDashboardData();
    } catch (error) {
      console.error('Failed to update task status', error);
      alert('Failed to update task status');
    } finally {
      setUpdatingTaskId(null);
    }
  };

  if (loading || user?.role === 'ADMIN') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen py-20">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Dashboard</h1>
            <p className="text-muted-foreground">Welcome back, {user?.fullName}!</p>
          </div>
          {user?.role === 'CLIENT' && (
            <Link
              href="/create-gig"
              className="flex items-center gap-2 px-6 py-3 rounded-xl gradient-hero text-white font-semibold hover:opacity-90"
            >
              <Plus className="w-5 h-5" />
              Create Gig
            </Link>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Total Gigs</span>
              <Briefcase className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-2xl font-bold">{tasks.length}</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Proposals</span>
              <FileText className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-2xl font-bold">{proposals.length}</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Active</span>
              <TrendingUp className="w-5 h-5 text-orange-600" />
            </div>
            <p className="text-2xl font-bold">
              {user?.role === 'CLIENT' 
                ? tasks.filter(t => t.status === 'IN_PROGRESS').length
                : proposals.filter(p => p.status === 'ACCEPTED').length}
            </p>
          </div>
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Earnings</span>
              <DollarSign className="w-5 h-5 text-purple-600" />
            </div>
            <p className="text-2xl font-bold">₹0</p>
          </div>
        </div>

        {/* Main Content */}
        {user?.role === 'CLIENT' ? (
          <div>
            <h2 className="text-2xl font-bold mb-4">My Gigs</h2>
            {tasks.length === 0 ? (
              <div className="text-center py-20 bg-card border border-border rounded-xl">
                <Briefcase className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground mb-4">You haven&apos;t created any gigs yet</p>
                <Link
                  href="/create-gig"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl gradient-hero text-white font-semibold hover:opacity-90"
                >
                  <Plus className="w-5 h-5" />
                  Create Your First Gig
                </Link>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tasks.map((task) => (
                  <div key={task.id} className="block border border-border rounded-xl p-6 hover-lift bg-card">
                    <div className="flex items-center gap-2 mb-3">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        task.status === 'OPEN' ? 'bg-green-600/10 text-green-600' :
                        task.status === 'IN_PROGRESS' ? 'bg-yellow-600/10 text-yellow-600' :
                        'bg-gray-600/10 text-gray-600'
                      }`}>
                        {task.status}
                      </span>
                    </div>
                    <h3 className="font-semibold mb-2 line-clamp-2">
                      <Link href={`/gig/${task.id}`} className="hover:text-blue-600">
                        {task.title}
                      </Link>
                    </h3>
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      {task.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        {categoryNameFromList(task.categoryId, categories)}
                      </span>
                      <span className="text-lg font-bold text-blue-600">{formatTaskBudget(task)}</span>
                    </div>
                    <div className="mt-4 flex gap-2">
                      {task.status === 'OPEN' && task.assignedProfessionalId && (
                        <button
                          type="button"
                          disabled={updatingTaskId === task.id}
                          onClick={() => updateTaskStatus(task.id, 'IN_PROGRESS', task.assignedProfessionalId)}
                          className="text-xs px-3 py-1.5 rounded-lg bg-yellow-600/10 text-yellow-700 hover:bg-yellow-600/20 disabled:opacity-50"
                        >
                          Mark In Progress
                        </button>
                      )}
                      {task.status === 'IN_PROGRESS' && (
                        <button
                          type="button"
                          disabled={updatingTaskId === task.id}
                          onClick={() => updateTaskStatus(task.id, 'COMPLETED', task.assignedProfessionalId)}
                          className="text-xs px-3 py-1.5 rounded-lg bg-green-600/10 text-green-700 hover:bg-green-600/20 disabled:opacity-50"
                        >
                          Mark Completed
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-10">
              <h2 className="text-2xl font-bold mb-4">Proposals On My Gigs</h2>
              {proposals.length === 0 ? (
                <div className="bg-card border border-border rounded-xl p-8 text-muted-foreground text-sm">
                  No proposals yet.
                </div>
              ) : (
                <div className="space-y-4">
                  {proposals.map((proposal) => (
                    <div key={proposal.id} className="border border-border rounded-xl p-4 bg-card">
                      <div className="flex items-center justify-between mb-2">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          proposal.status === 'PENDING'
                            ? 'bg-yellow-600/10 text-yellow-600'
                            : proposal.status === 'ACCEPTED'
                            ? 'bg-green-600/10 text-green-600'
                            : 'bg-red-600/10 text-red-600'
                        }`}>
                          {proposal.status}
                        </span>
                        <span className="text-base font-bold text-blue-600">₹{proposal.proposedAmount ?? 0}</span>
                      </div>
                      <p className="text-sm mb-2">{proposal.message}</p>
                      <p className="text-xs text-muted-foreground">
                        Estimated: {proposal.estimatedDuration ?? '—'} • Submitted{' '}
                        {new Date(proposal.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div>
            <h2 className="text-2xl font-bold mb-4">My Proposals</h2>
            {proposals.length === 0 ? (
              <div className="text-center py-20 bg-card border border-border rounded-xl">
                <FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground mb-4">You haven&apos;t submitted any proposals yet</p>
                <Link
                  href="/find-work"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl gradient-hero text-white font-semibold hover:opacity-90"
                >
                  Find Work
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {proposals.map((proposal) => (
                  <div
                    key={proposal.id}
                    className="border border-border rounded-xl p-6 bg-card"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        proposal.status === 'PENDING' ? 'bg-yellow-600/10 text-yellow-600' :
                        proposal.status === 'ACCEPTED' ? 'bg-green-600/10 text-green-600' :
                        'bg-red-600/10 text-red-600'
                      }`}>
                        {proposal.status}
                      </span>
                      <span className="text-lg font-bold text-blue-600">₹{proposal.proposedAmount}</span>
                    </div>
                    <p className="text-sm mb-2 line-clamp-2">{proposal.message}</p>
                    <p className="text-xs text-muted-foreground">
                      Estimated: {proposal.estimatedDuration ?? '—'} •{' '}
                      Submitted {new Date(proposal.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
