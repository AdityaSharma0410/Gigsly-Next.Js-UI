'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { userApi, reviewApi, type User, type Review } from '@/lib/api';
import { Loader2, AlertCircle, Star, ArrowLeft } from 'lucide-react';

export default function PublicProfilePage() {
  const params = useParams();
  const id = Number(params.id);
  const [user, setUser] = useState<User | null>(null);
  const [rating, setRating] = useState<{ average: number; total: number } | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id || Number.isNaN(id)) {
      setError('Invalid profile');
      setLoading(false);
      return;
    }
    (async () => {
      try {
        const [u, avg, page] = await Promise.all([
          userApi.getProfile(id),
          reviewApi.getAverageRating(id).catch(() => null),
          reviewApi.getByUser(id, { page: 0, size: 10 }).catch(() => null),
        ]);
        setUser(u);
        if (avg) setRating({ average: avg.averageRating, total: avg.totalReviews });
        if (page) setReviews(page.content);
      } catch {
        setError('Could not load profile');
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground mb-4">{error || 'User not found'}</p>
          <Link href="/browse" className="text-blue-600 hover:underline">
            Browse gigs
          </Link>
        </div>
      </div>
    );
  }

  const skills = user.skills
    ? user.skills.split(',').map((s) => s.trim()).filter(Boolean)
    : [];

  return (
    <div className="min-h-screen py-20">
      <div className="container mx-auto px-4 max-w-3xl">
        <Link
          href="/browse"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Link>

        <div className="bg-card border border-border rounded-xl p-8 mb-8">
          <div className="flex flex-col sm:flex-row gap-6 items-start">
            <div className="w-24 h-24 rounded-full bg-blue-600 flex items-center justify-center text-white text-3xl font-bold shrink-0">
              {user.fullName[0]?.toUpperCase()}
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-1">{user.fullName}</h1>
              <p className="text-sm text-muted-foreground mb-2">{user.role}</p>
              {user.location && (
                <p className="text-sm text-muted-foreground mb-2">{user.location}</p>
              )}
              {rating && rating.total > 0 && (
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < Math.round(rating.average)
                            ? 'fill-orange-500 text-orange-500'
                            : 'text-muted-foreground/30'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {rating.average.toFixed(1)} ({rating.total} reviews)
                  </span>
                </div>
              )}
              {user.bio && <p className="text-muted-foreground whitespace-pre-wrap">{user.bio}</p>}
            </div>
          </div>

          {skills.length > 0 && (
            <div className="mt-6 pt-6 border-t border-border">
              <p className="text-sm font-medium mb-2">Skills</p>
              <div className="flex flex-wrap gap-2">
                {skills.map((s) => (
                  <span key={s} className="text-xs px-3 py-1 rounded-full border border-border">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {reviews.length > 0 && (
          <div className="bg-card border border-border rounded-xl p-8">
            <h2 className="text-xl font-bold mb-4">Reviews</h2>
            <div className="space-y-4">
              {reviews.map((r) => (
                <div key={r.id} className="border-b border-border pb-4 last:border-0">
                  <div className="flex gap-1 mb-2">
                    {Array.from({ length: r.rating }).map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-orange-500 text-orange-500" />
                    ))}
                  </div>
                  {r.comment && <p className="text-sm">{r.comment}</p>}
                  <p className="text-xs text-muted-foreground mt-2">
                    {new Date(r.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
