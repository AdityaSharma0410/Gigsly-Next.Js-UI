'use client';

import { useEffect, useMemo, useState } from 'react';
import { userApi, type User } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { Loader2, Search, MapPin, BadgeCheck } from 'lucide-react';

export default function ClientsPage() {
  const { isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [clients, setClients] = useState<User[]>([]);
  const [selected, setSelected] = useState<User | null>(null);
  const [q, setQ] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const list = await userApi.getAllUsers();
        const onlyClients = list.filter((u) => u.role === 'CLIENT');
        setClients(onlyClients);
        setSelected(onlyClients[0] ?? null);
      } catch (e) {
        console.error('Failed to load clients', e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return clients;
    return clients.filter((c) => {
      const hay = `${c.fullName ?? ''} ${c.email ?? ''} ${c.location ?? ''}`.toLowerCase();
      return hay.includes(term) || String(c.id).includes(term);
    });
  }, [clients, q]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen py-20">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Browse Clients</h1>
          <p className="text-muted-foreground">Explore client profiles on the platform.</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 bg-card border border-border rounded-xl overflow-hidden">
            <div className="p-4 border-b border-border">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search by name, email, id..."
                  className="w-full pl-9 pr-3 py-2 rounded-lg border border-border bg-background text-sm"
                />
              </div>
            </div>
            <div className="max-h-[60vh] overflow-y-auto">
              {filtered.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setSelected(c)}
                  className={`w-full text-left p-4 border-b border-border hover:bg-muted transition-colors ${
                    selected?.id === c.id ? 'bg-muted' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold">
                      {c.fullName?.[0]?.toUpperCase() ?? 'U'}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold truncate">{c.fullName || 'Unnamed'}</p>
                        {c.isVerified && <BadgeCheck className="w-4 h-4 text-green-600" />}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">#{c.id}</p>
                    </div>
                  </div>
                </button>
              ))}
              {filtered.length === 0 && <div className="p-6 text-sm text-muted-foreground">No clients found.</div>}
            </div>
          </div>

          <div className="lg:col-span-2 bg-card border border-border rounded-xl p-6">
            {!selected ? (
              <div className="text-muted-foreground text-sm">Select a client to view details.</div>
            ) : (
              <>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-bold">{selected.fullName}</h2>
                    <p className="text-sm text-muted-foreground">User ID: {selected.id}</p>
                    {selected.location && (
                      <p className="text-sm text-muted-foreground inline-flex items-center gap-2 mt-2">
                        <MapPin className="w-4 h-4" /> {selected.location}
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-6 grid md:grid-cols-2 gap-4">
                  <div className="border border-border rounded-lg p-4 md:col-span-2">
                    <p className="text-xs text-muted-foreground mb-1">Email</p>
                    <p className="font-medium whitespace-pre-wrap">{selected.email ?? '—'}</p>
                  </div>
                  <div className="border border-border rounded-lg p-4 md:col-span-2">
                    <p className="text-xs text-muted-foreground mb-1">Bio</p>
                    <p className="font-medium whitespace-pre-wrap">{selected.bio ?? '—'}</p>
                  </div>
                </div>

                {!isAuthenticated && (
                  <p className="mt-6 text-sm text-muted-foreground">Sign in to interact more with profiles.</p>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

