'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { taskApi, userApi, reviewApi, proposalApi, categoryApi, type Task, type User, type Review, type Category } from '@/lib/api';
import { formatTaskBudget } from '@/lib/taskDisplay';
import { useAuth } from '@/lib/contexts/AuthContext';
import { Briefcase, User as UserIcon, Star, Calendar, DollarSign, Clock, Send, Loader2, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function GigDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [task, setTask] = useState<Task | null>(null);
  const [category, setCategory] = useState<Category | null>(null);
  const [seller, setSeller] = useState<User | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [proposalText, setProposalText] = useState('');
  const [proposalAmount, setProposalAmount] = useState('');
  const [proposalDuration, setProposalDuration] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadGigData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  const loadGigData = async () => {
    try {
      const gigData = await taskApi.getTask(Number(params.id));
      setTask(gigData);

      const [sellerData, catData] = await Promise.all([
        userApi.getProfile(gigData.clientId),
        categoryApi.getById(gigData.categoryId).catch(() => null),
      ]);
      setSeller(sellerData);
      setCategory(catData);

      const reviewsData = await reviewApi.getByTask(gigData.id);
      setReviews(reviewsData);
    } catch (error) {
      console.error('Failed to load gig', error);
      setError('Failed to load gig details');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitProposal = async () => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (!proposalText || !proposalAmount || !proposalDuration) {
      setError('Please fill all fields');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      await proposalApi.create({
        taskId: Number(params.id),
        message: proposalText,
        proposedAmount: Number(proposalAmount),
        estimatedDuration: String(proposalDuration),
      });
      alert('Proposal submitted successfully!');
      setProposalText('');
      setProposalAmount('');
      setProposalDuration('');
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to submit proposal');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!task) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 mx-auto mb-4 text-red-600" />
          <h2 className="text-2xl font-bold mb-2">Gig Not Found</h2>
          <Link href="/browse" className="text-blue-600 hover:underline">
            Browse other gigs
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-20">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs px-2 py-1 rounded-full bg-blue-600/10 text-blue-600">
                    {category?.name ?? `Category #${task.categoryId}`}
                  </span>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    task.status === 'OPEN' ? 'bg-green-600/10 text-green-600' :
                    task.status === 'IN_PROGRESS' ? 'bg-yellow-600/10 text-yellow-600' :
                    'bg-gray-600/10 text-gray-600'
                  }`}>
                    {task.status}
                  </span>
                  {task.priority === 'URGENT' && (
                    <span className="text-xs px-2 py-1 rounded-full bg-red-600/10 text-red-600">
                      Urgent
                    </span>
                  )}
                </div>
                <h1 className="text-3xl font-bold mb-4">{task.title}</h1>
              </div>

              <div className="h-64 bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl flex items-center justify-center mb-6">
                <Briefcase className="w-24 h-24 text-blue-600" />
              </div>

              <div className="bg-card border border-border rounded-xl p-6 mb-6">
                <h2 className="text-xl font-bold mb-4">About This Gig</h2>
                <p className="whitespace-pre-wrap">{task.description}</p>
              </div>

              <div className="bg-card border border-border rounded-xl p-6 mb-6">
                <h2 className="text-xl font-bold mb-4">Gig Details</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <DollarSign className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="text-sm text-muted-foreground">Budget</p>
                      <p className="font-semibold">{formatTaskBudget(task)}</p>
                    </div>
                  </div>
                  {task.deadline && (
                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="text-sm text-muted-foreground">Deadline</p>
                        <p className="font-semibold">{new Date(task.deadline).toLocaleDateString()}</p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="text-sm text-muted-foreground">Posted</p>
                      <p className="font-semibold">{new Date(task.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
                {task.requiredSkills && (
                  <div className="mt-4">
                    <p className="text-sm text-muted-foreground mb-2">Skills Required</p>
                    <div className="flex flex-wrap gap-2">
                      {task.requiredSkills.split(',').map((s) => s.trim()).filter(Boolean).map((tag, i) => (
                        <span key={i} className="text-xs px-3 py-1 rounded-full border border-border">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {reviews.length > 0 && (
                <div className="bg-card border border-border rounded-xl p-6">
                  <h2 className="text-xl font-bold mb-4">Reviews</h2>
                  <div className="space-y-4">
                    {reviews.map((review) => (
                      <div key={review.id} className="border-b border-border pb-4 last:border-0">
                        <div className="flex items-center gap-1 mb-2">
                          {Array.from({ length: review.rating }).map((_, i) => (
                            <Star key={i} className="w-4 h-4 fill-orange-500 text-orange-500" />
                          ))}
                        </div>
                        <p className="text-sm mb-2">{review.comment}</p>
                        <p className="text-xs text-muted-foreground">
                          {review.reviewerName ? `${review.reviewerName} · ` : ''}
                          {new Date(review.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </div>

          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-20 space-y-6">
              {seller && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-card border border-border rounded-xl p-6"
                >
                  <h3 className="font-bold mb-4">About the Client</h3>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
                      {seller.fullName[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold">{seller.fullName}</p>
                      <p className="text-sm text-muted-foreground">{seller.role}</p>
                    </div>
                  </div>
                  {seller.bio && <p className="text-sm text-muted-foreground mb-4">{seller.bio}</p>}
                  <Link
                    href={`/profile/${seller.id}`}
                    className="block text-center py-2 px-4 rounded-lg border border-border hover:bg-muted"
                  >
                    View Profile
                  </Link>
                </motion.div>
              )}

              {isAuthenticated && user?.role === 'PROFESSIONAL' && task.status === 'OPEN' && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-card border border-border rounded-xl p-6"
                >
                  <h3 className="font-bold mb-4">Submit a Proposal</h3>
                  {error && (
                    <div className="mb-4 p-3 rounded-lg bg-red-600/10 text-red-600 text-sm">
                      {error}
                    </div>
                  )}
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Cover Letter</label>
                      <textarea
                        value={proposalText}
                        onChange={(e) => setProposalText(e.target.value)}
                        placeholder="Explain why you're the best fit..."
                        rows={4}
                        className="w-full p-3 rounded-lg border border-border bg-background"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Your Bid (₹)</label>
                      <input
                        type="number"
                        value={proposalAmount}
                        onChange={(e) => setProposalAmount(e.target.value)}
                        placeholder="Enter amount"
                        className="w-full p-3 rounded-lg border border-border bg-background"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Duration (days)</label>
                      <input
                        type="number"
                        value={proposalDuration}
                        onChange={(e) => setProposalDuration(e.target.value)}
                        placeholder="Estimated days"
                        className="w-full p-3 rounded-lg border border-border bg-background"
                      />
                    </div>
                    <button
                      onClick={handleSubmitProposal}
                      disabled={submitting}
                      className="w-full py-3 rounded-lg gradient-hero text-white font-semibold hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          Send Proposal
                        </>
                      )}
                    </button>
                  </div>
                </motion.div>
              )}

              {!isAuthenticated && (
                <div className="bg-card border border-border rounded-xl p-6 text-center">
                  <UserIcon className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground mb-4">
                    Sign in to submit a proposal
                  </p>
                  <Link
                    href="/login"
                    className="block py-2 px-4 rounded-lg gradient-hero text-white font-semibold hover:opacity-90"
                  >
                    Sign In
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
