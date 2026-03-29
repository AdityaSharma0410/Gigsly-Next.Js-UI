'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRequireRole } from '@/hooks/useAuth';
import {
  adminApi,
  userApi,
  taskApi,
  proposalApi,
  reviewApi,
  categoryApi,
  contactApi,
  type User,
  type Task,
  type Proposal,
  type Review,
  type Category,
  type ContactQuery,
  type CreateAdminRequest,
} from '@/lib/api';
import { formatTaskBudget } from '@/lib/taskDisplay';
import Link from 'next/link';
import {
  Users,
  Briefcase,
  FileText,
  Star,
  FolderTree,
  Mail,
  Server,
  UserPlus,
  Loader2,
  Search,
  ShieldOff,
  ShieldCheck,
  Trash2,
  RefreshCw,
  Activity,
} from 'lucide-react';

type Tab =
  | 'overview'
  | 'users'
  | 'admins'
  | 'categories'
  | 'tasks'
  | 'proposals'
  | 'reviews'
  | 'contact'
  | 'system';

export default function AdminDashboardPage() {
  useRequireRole(['ADMIN']);

  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const [adminProfile, setAdminProfile] = useState<Awaited<ReturnType<typeof adminApi.getMe>> | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [queries, setQueries] = useState<ContactQuery[]>([]);

  const [newCategory, setNewCategory] = useState({ name: '', description: '', iconUrl: '' });
  const [newAdmin, setNewAdmin] = useState<CreateAdminRequest>({
    fullName: '',
    email: '',
    password: '',
    displayName: '',
  });

  const loadAll = useCallback(async () => {
    setError('');
    setRefreshing(true);
    try {
      const [me, u, tPage, prop, rev, cat, q] = await Promise.all([
        adminApi.getMe().catch(() => null),
        userApi.getAllUsers().catch(() => []),
        taskApi.browse({ page: 0, size: 500 }).catch(() => ({ content: [] })),
        proposalApi.getAll().catch(() => []),
        reviewApi.getAll().catch(() => []),
        categoryApi.getAll().catch(() => []),
        contactApi.list().catch(() => []),
      ]);
      setAdminProfile(me);
      setUsers(u);
      setTasks(tPage.content ?? []);
      setProposals(prop);
      setReviews(rev);
      setCategories(cat);
      setQueries(q);
    } catch (e: unknown) {
      setError('Failed to load monitoring data. Check API gateway and services.');
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const clients = users.filter((x) => x.role === 'CLIENT').length;
  const professionals = users.filter((x) => x.role === 'PROFESSIONAL').length;
  const admins = users.filter((x) => x.role === 'ADMIN').length;
  const activeUsers = users.filter((x) => x.isActive !== false).length;
  const suspendedUsers = users.length - activeUsers;
  const openTasks = tasks.filter((t) => t.status === 'OPEN').length;
  const pendingQueries = queries.filter((q) => q.status === 'PENDING').length;

  const handleSuspend = async (u: User) => {
    if (!confirm(`Suspend ${u.email}? They will not be able to sign in.`)) return;
    try {
      await userApi.updateUserStatus(u.id, { isVerified: !!u.isVerified, isActive: false });
      await loadAll();
    } catch (e) {
      console.error(e);
      alert('Could not suspend user (cannot target your own account).');
    }
  };

  const handleActivate = async (u: User) => {
    try {
      await userApi.updateUserStatus(u.id, { isVerified: !!u.isVerified, isActive: true });
      await loadAll();
    } catch (e) {
      console.error(e);
      alert('Could not activate user.');
    }
  };

  const handlePromote = async (u: User) => {
    if (!confirm(`Grant ADMIN to ${u.email}? They will appear in admin-service and can manage the platform.`)) return;
    try {
      await adminApi.promoteExistingUser(u.id);
      await loadAll();
    } catch (e) {
      console.error(e);
      alert('Promotion failed. User may already be admin or services unreachable.');
    }
  };

  const handleDeleteUser = async (u: User) => {
    if (!confirm(`Permanently delete ${u.email}? This cannot be undone.`)) return;
    try {
      await userApi.deleteUser(u.id);
      await loadAll();
    } catch (e) {
      console.error(e);
      alert('Delete failed.');
    }
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategory.name.trim()) return;
    try {
      await categoryApi.create({
        name: newCategory.name.trim(),
        description: newCategory.description.trim() || undefined,
        iconUrl: newCategory.iconUrl.trim() || undefined,
      });
      setNewCategory({ name: '', description: '', iconUrl: '' });
      await loadAll();
    } catch (err) {
      console.error(err);
      alert('Create category failed. Admin role required.');
    }
  };

  const handleDeleteCategory = async (c: Category) => {
    if (!confirm(`Delete category "${c.name}"?`)) return;
    try {
      await categoryApi.delete(c.id);
      await loadAll();
    } catch (err) {
      console.error(err);
      alert('Delete failed.');
    }
  };

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await adminApi.createAdminUser({
        fullName: newAdmin.fullName,
        email: newAdmin.email,
        password: newAdmin.password,
        displayName: newAdmin.displayName || undefined,
      });
      setNewAdmin({ fullName: '', email: '', password: '', displayName: '' });
      await loadAll();
    } catch (err) {
      console.error(err);
      alert('Create admin failed (email may already exist).');
    }
  };

  const handleDeleteReview = async (r: Review) => {
    if (!confirm('Delete this review?')) return;
    try {
      await reviewApi.delete(r.id);
      await loadAll();
    } catch (err) {
      console.error(err);
      alert('Delete review failed.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const tabBtn = (id: Tab, label: string) => (
    <button
      key={id}
      type="button"
      onClick={() => setActiveTab(id)}
      className={`px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
        activeTab === id ? 'bg-blue-600 text-white' : 'bg-muted/60 hover:bg-muted text-foreground'
      }`}
    >
      {label}
    </button>
  );

  const filteredUsers = users.filter(
    (u) =>
      !searchTerm ||
      u.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen py-20">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-1 flex items-center gap-2">
              <Activity className="w-8 h-8 text-blue-600" />
              Operations dashboard
            </h1>
            <p className="text-muted-foreground text-sm">
              Live view across users, gigs, proposals, reviews, categories, and contact queue.
              {adminProfile?.displayName && (
                <span className="block mt-1 text-foreground/80">
                  Signed in as admin profile: <strong>{adminProfile.displayName}</strong>
                </span>
              )}
            </p>
          </div>
          <button
            type="button"
            onClick={() => loadAll()}
            disabled={refreshing}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border bg-card hover:bg-muted"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh data
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-600/10 text-red-700 dark:text-red-300 text-sm">{error}</div>
        )}

        {/* KPI strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 mb-8">
          {[
            { label: 'Users', value: users.length, icon: Users, sub: `${activeUsers} active` },
            { label: 'Clients / Pros', value: `${clients}/${professionals}`, icon: Users, sub: `${admins} admins` },
            { label: 'Suspended', value: suspendedUsers, icon: ShieldOff, sub: 'inactive accounts' },
            { label: 'Gigs', value: tasks.length, icon: Briefcase, sub: `${openTasks} open` },
            { label: 'Proposals', value: proposals.length, icon: FileText, sub: 'all' },
            { label: 'Reviews', value: reviews.length, icon: Star, sub: 'visible to admin' },
          ].map((k) => {
            const Icon = k.icon;
            return (
              <div key={k.label} className="bg-card border border-border rounded-xl p-4">
                <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
                  <Icon className="w-3.5 h-3.5" />
                  {k.label}
                </div>
                <p className="text-xl font-bold">{k.value}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">{k.sub}</p>
              </div>
            );
          })}
        </div>

        <div className="flex flex-wrap gap-2 mb-6 overflow-x-auto pb-2">
          {tabBtn('overview', 'Overview')}
          {tabBtn('users', 'Users')}
          {tabBtn('admins', 'Admin accounts')}
          {tabBtn('categories', 'Categories')}
          {tabBtn('tasks', 'Gigs')}
          {tabBtn('proposals', 'Proposals')}
          {tabBtn('reviews', 'Reviews')}
          {tabBtn('contact', `Contact (${pendingQueries} pending)`)}
          {tabBtn('system', 'System')}
        </div>

        {activeTab === 'overview' && (
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-card border border-border rounded-xl p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <FolderTree className="w-5 h-5" />
                Catalog
              </h3>
              <p className="text-sm text-muted-foreground mb-2">{categories.length} categories</p>
              <p className="text-sm text-muted-foreground">{queries.length} contact messages total</p>
            </div>
            <div className="bg-card border border-border rounded-xl p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Server className="w-5 h-5" />
                Health checks
              </h3>
              <ul className="text-sm space-y-2 text-muted-foreground">
                <li>
                  • Gateway + services: use <strong>Refresh data</strong> — last load{' '}
                  {!error ? 'succeeded' : 'had errors'}.
                </li>
                <li>
                  • Eureka:{' '}
                  <a
                    href="http://localhost:8761"
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    http://localhost:8761
                  </a>
                </li>
                <li>
                  • API base:{' '}
                  <code className="text-xs bg-muted px-1 rounded">
                    {process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9090'}
                  </code>
                </li>
              </ul>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="space-y-4">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                className="w-full pl-9 pr-3 py-2 rounded-lg border border-border bg-background text-sm"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="bg-card border border-border rounded-xl overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/80">
                  <tr>
                    <th className="text-left p-3 font-medium">User</th>
                    <th className="text-left p-3 font-medium">Role</th>
                    <th className="text-left p-3 font-medium">Status</th>
                    <th className="text-right p-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((u) => (
                    <tr key={u.id} className="border-t border-border">
                      <td className="p-3">
                        <div className="font-medium">{u.fullName || '—'}</div>
                        <div className="text-muted-foreground text-xs">{u.email}</div>
                      </td>
                      <td className="p-3">{u.role}</td>
                      <td className="p-3">
                        {u.isActive === false ? (
                          <span className="text-amber-600">Suspended</span>
                        ) : (
                          <span className="text-green-600">Active</span>
                        )}
                        {u.isVerified ? ' · Verified' : ''}
                      </td>
                      <td className="p-3 text-right space-x-1 whitespace-nowrap">
                        {u.role !== 'ADMIN' && (
                          <button
                            type="button"
                            onClick={() => handlePromote(u)}
                            className="text-xs px-2 py-1 rounded bg-purple-600/15 text-purple-700 dark:text-purple-300 hover:bg-purple-600/25"
                          >
                            Make admin
                          </button>
                        )}
                        {u.isActive !== false ? (
                          <button
                            type="button"
                            onClick={() => handleSuspend(u)}
                            className="text-xs px-2 py-1 rounded bg-amber-600/15 text-amber-700 hover:bg-amber-600/25"
                          >
                            Suspend
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleActivate(u)}
                            className="text-xs px-2 py-1 rounded bg-green-600/15 text-green-700 hover:bg-green-600/25"
                          >
                            Activate
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleDeleteUser(u)}
                          className="text-xs px-2 py-1 rounded bg-red-600/15 text-red-700 hover:bg-red-600/25 inline-flex items-center gap-1"
                        >
                          <Trash2 className="w-3 h-3" />
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'admins' && (
          <div className="grid lg:grid-cols-2 gap-8">
            <form onSubmit={handleCreateAdmin} className="bg-card border border-border rounded-xl p-6 space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <UserPlus className="w-5 h-5" />
                Create new admin login
              </h3>
              <p className="text-xs text-muted-foreground">
                Creates a user with ADMIN role and an admin profile row (password chosen here).
              </p>
              <input
                className="w-full p-2 rounded-lg border border-border bg-background"
                placeholder="Full name"
                value={newAdmin.fullName}
                onChange={(e) => setNewAdmin({ ...newAdmin, fullName: e.target.value })}
                required
              />
              <input
                className="w-full p-2 rounded-lg border border-border bg-background"
                type="email"
                placeholder="Email"
                value={newAdmin.email}
                onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })}
                required
              />
              <input
                className="w-full p-2 rounded-lg border border-border bg-background"
                type="password"
                placeholder="Password (min 6)"
                value={newAdmin.password}
                onChange={(e) => setNewAdmin({ ...newAdmin, password: e.target.value })}
                required
                minLength={6}
              />
              <input
                className="w-full p-2 rounded-lg border border-border bg-background"
                placeholder="Display name (optional)"
                value={newAdmin.displayName}
                onChange={(e) => setNewAdmin({ ...newAdmin, displayName: e.target.value })}
              />
              <button type="submit" className="w-full py-2 rounded-lg gradient-hero text-white font-medium">
                Create admin
              </button>
            </form>
            <div className="bg-card border border-border rounded-xl p-6">
              <h3 className="font-semibold mb-4">Administrators ({admins})</h3>
              <ul className="space-y-2 text-sm max-h-96 overflow-y-auto">
                {users
                  .filter((u) => u.role === 'ADMIN')
                  .map((u) => (
                    <li key={u.id} className="flex justify-between border-b border-border pb-2">
                      <span>{u.fullName}</span>
                      <span className="text-muted-foreground">{u.email}</span>
                    </li>
                  ))}
              </ul>
            </div>
          </div>
        )}

        {activeTab === 'categories' && (
          <div className="grid lg:grid-cols-2 gap-8">
            <form onSubmit={handleCreateCategory} className="bg-card border border-border rounded-xl p-6 space-y-4">
              <h3 className="font-semibold">Add category</h3>
              <input
                className="w-full p-2 rounded-lg border border-border bg-background"
                placeholder="Name"
                value={newCategory.name}
                onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                required
              />
              <textarea
                className="w-full p-2 rounded-lg border border-border bg-background min-h-[80px]"
                placeholder="Description"
                value={newCategory.description}
                onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
              />
              <input
                className="w-full p-2 rounded-lg border border-border bg-background"
                placeholder="Icon URL (optional)"
                value={newCategory.iconUrl}
                onChange={(e) => setNewCategory({ ...newCategory, iconUrl: e.target.value })}
              />
              <button type="submit" className="px-4 py-2 rounded-lg bg-blue-600 text-white">
                Save category
              </button>
            </form>
            <div className="bg-card border border-border rounded-xl p-6">
              <h3 className="font-semibold mb-4">Existing ({categories.length})</h3>
              <ul className="space-y-2 text-sm max-h-96 overflow-y-auto">
                {categories.map((c) => (
                  <li key={c.id} className="flex justify-between items-center gap-2 border-b border-border pb-2">
                    <div>
                      <div className="font-medium">{c.name}</div>
                      {c.description && (
                        <div className="text-xs text-muted-foreground line-clamp-1">{c.description}</div>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteCategory(c)}
                      className="text-red-600 text-xs shrink-0"
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {activeTab === 'tasks' && (
          <div className="space-y-3">
            {tasks.map((task) => (
              <div key={task.id} className="bg-card border border-border rounded-xl p-4 flex flex-wrap justify-between gap-2">
                <div>
                  <Link href={`/gig/${task.id}`} className="font-semibold hover:text-blue-600">
                    {task.title}
                  </Link>
                  <p className="text-xs text-muted-foreground mt-1">
                    {task.status} · {formatTaskBudget(task)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'proposals' && (
          <div className="space-y-3 max-h-[70vh] overflow-y-auto">
            {proposals.map((p) => (
              <div key={p.id} className="bg-card border border-border rounded-xl p-4 text-sm">
                <div className="flex justify-between">
                  <span className="font-medium">Proposal #{p.id}</span>
                  <span className="text-muted-foreground">{p.status}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{p.message}</p>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="space-y-3">
            {reviews.map((r) => (
              <div
                key={r.id}
                className="bg-card border border-border rounded-xl p-4 flex flex-wrap items-start justify-between gap-2"
              >
                <div className="text-sm">
                  <div className="font-medium">
                    {r.rating}★ · Task {r.taskId ?? '—'}
                  </div>
                  <p className="text-muted-foreground text-xs mt-1 line-clamp-2">{r.comment}</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleDeleteReview(r)}
                  className="text-xs text-red-600 shrink-0"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'contact' && (
          <div className="space-y-3 max-h-[70vh] overflow-y-auto">
            {queries.map((q) => (
              <div key={q.id} className="bg-card border border-border rounded-xl p-4 text-sm">
                <div className="flex justify-between gap-2">
                  <div>
                    <span className="font-medium">{q.name}</span>
                    <span className="text-muted-foreground mx-2">{q.email}</span>
                  </div>
                  <span className="text-xs bg-muted px-2 py-0.5 rounded">{q.status}</span>
                </div>
                <p className="mt-2 text-muted-foreground whitespace-pre-wrap">{q.message}</p>
                {q.adminResponse && (
                  <p className="mt-2 text-xs border-t border-border pt-2">
                    <strong>Response:</strong> {q.adminResponse}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        {activeTab === 'system' && (
          <div className="bg-card border border-border rounded-xl p-6 space-y-4 text-sm">
            <p>
              Use these for deeper inspection (local development). Authentication for actuator/metrics is not wired in
              this repo.
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <a href="http://localhost:8761" target="_blank" rel="noreferrer" className="text-blue-600">
                  Eureka registry
                </a>
              </li>
              <li>
                API gateway:{' '}
                <code className="bg-muted px-1 rounded">{process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9090'}</code>
              </li>
              <li>Service ports: user 8081, tasks 8082, categories 8083, proposals 8084, reviews 8085, contact 8086, admin 8087, chat 8088</li>
            </ul>
            <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
              <ShieldCheck className="w-4 h-4" />
              Admin JWT headers are injected by the gateway for downstream authorization.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
