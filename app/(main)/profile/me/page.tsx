'use client';

import { useEffect, useMemo, useState } from 'react';
import { useAuth, useRequireAuth } from '@/hooks/useAuth';
import { userApi } from '@/lib/api';
import { useNotification } from '@/lib/contexts/NotificationContext';
import { Loader2, Save } from 'lucide-react';

export default function MyProfilePage() {
  useRequireAuth();
  const { user } = useAuth();
  const { addNotification } = useNotification();

  const [saving, setSaving] = useState(false);
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
  const [profilePictureUrl, setProfilePictureUrl] = useState('');

  // Professional-only fields (sent only when role is PROFESSIONAL)
  const [primaryCategory, setPrimaryCategory] = useState('');
  const [skills, setSkills] = useState('');
  const [hourlyRate, setHourlyRate] = useState<string>('');

  const isProfessional = user?.role === 'PROFESSIONAL';
  const title = useMemo(() => (isProfessional ? 'Professional Profile' : 'Profile'), [isProfessional]);

  useEffect(() => {
    if (!user) return;
    setBio(user.bio ?? '');
    setLocation(user.location ?? '');
    setProfilePictureUrl(user.profilePictureUrl ?? '');
    setPrimaryCategory(user.primaryCategory ?? '');
    setSkills(user.skills ?? '');
    setHourlyRate(user.hourlyRate != null ? String(user.hourlyRate) : '');
  }, [user]);

  const onSave = async () => {
    try {
      setSaving(true);
      await userApi.updateProfessionalProfile({
        bio: bio.trim() || undefined,
        location: location.trim() || undefined,
        profilePictureUrl: profilePictureUrl.trim() || undefined,
        ...(isProfessional
          ? {
              primaryCategory: primaryCategory.trim() || undefined,
              skills: skills.trim() || undefined,
              hourlyRate: hourlyRate.trim() ? Number(hourlyRate) : undefined,
            }
          : {}),
      });
      addNotification('success', 'Profile updated successfully');
    } catch {
      addNotification('error', 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen py-20">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="flex items-start justify-between gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">{title}</h1>
            <p className="text-muted-foreground">
              Update your details so others can find and trust you.
            </p>
          </div>
          <button
            type="button"
            disabled={saving}
            onClick={onSave}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl gradient-hero text-white font-semibold hover:opacity-90 disabled:opacity-60"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save
          </button>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6 space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Full name</label>
              <input
                value={user.fullName}
                disabled
                className="w-full px-4 py-3 rounded-xl border border-border bg-muted/40"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <input
                value={user.email}
                disabled
                className="w-full px-4 py-3 rounded-xl border border-border bg-muted/40"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Location</label>
              <input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Bengaluru, IN"
                className="w-full px-4 py-3 rounded-xl border border-border bg-background"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Profile picture URL</label>
              <input
                value={profilePictureUrl}
                onChange={(e) => setProfilePictureUrl(e.target.value)}
                placeholder="https://…"
                className="w-full px-4 py-3 rounded-xl border border-border bg-background"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Bio</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell people what you do, what you’ve built, and what you’re looking for."
              rows={5}
              className="w-full px-4 py-3 rounded-xl border border-border bg-background resize-none"
            />
          </div>

          {isProfessional && (
            <div className="pt-2 border-t border-border space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Primary category</label>
                  <input
                    value={primaryCategory}
                    onChange={(e) => setPrimaryCategory(e.target.value)}
                    placeholder="e.g. Web Development"
                    className="w-full px-4 py-3 rounded-xl border border-border bg-background"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Hourly rate (₹)</label>
                  <input
                    value={hourlyRate}
                    onChange={(e) => setHourlyRate(e.target.value)}
                    placeholder="e.g. 500"
                    inputMode="numeric"
                    className="w-full px-4 py-3 rounded-xl border border-border bg-background"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Skills (comma-separated)</label>
                <input
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                  placeholder="React, Next.js, Spring Boot"
                  className="w-full px-4 py-3 rounded-xl border border-border bg-background"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

