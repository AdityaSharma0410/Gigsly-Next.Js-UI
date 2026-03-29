'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Search, ArrowRight, Star, Users, Briefcase, Shield } from 'lucide-react';
import type { Category, Task } from '@/lib/api/types';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.1 } } };
const fadeUp = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6 } } };

interface LandingClientProps {
  categories: Category[];
  featuredGigs: Task[];
}

export default function LandingClient({ categories, featuredGigs }: LandingClientProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  const handleSearch = () => {
    if (searchQuery.trim()) {
      router.push(`/browse?keyword=${encodeURIComponent(searchQuery)}`);
    } else {
      router.push('/browse');
    }
  };

  const reviews = [
    { id: 1, rating: 5, text: 'Amazing experience! Found the perfect developer for my project.', user: 'Raj Kumar', service: 'Web Development', avatar: 'RK' },
    { id: 2, rating: 5, text: 'Quick turnaround and excellent quality. Highly recommended!', user: 'Priya Singh', service: 'Graphic Design', avatar: 'PS' },
    { id: 3, rating: 4, text: 'Professional service and great communication throughout.', user: 'Amit Sharma', service: 'Content Writing', avatar: 'AS' },
    { id: 4, rating: 5, text: 'Best platform for freelancing. Made my first hire within hours!', user: 'Neha Patel', service: 'Digital Marketing', avatar: 'NP' },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden">
        <div className="absolute inset-0 gradient-hero opacity-5" />
        <div className="absolute top-20 right-10 w-72 h-72 bg-blue-600/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '1.5s' }} />

        <div className="container mx-auto relative z-10">
          <motion.div initial="hidden" animate="visible" variants={stagger} className="max-w-3xl mx-auto text-center">
            <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-600/10 text-blue-600 text-sm font-medium mb-6">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse-soft" />
              India&apos;s #1 Gig Marketplace
            </motion.div>
            <motion.h1 variants={fadeUp} className="text-4xl md:text-6xl font-extrabold leading-tight mb-6">
              Find the perfect{' '}
              <span className="text-gradient">freelance</span>{' '}
              services for your business
            </motion.h1>
            <motion.p variants={fadeUp} className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
              Connect with top-tier freelancers. Get quality work done fast, from web development to creative design.
            </motion.p>
            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-center gap-3 max-w-lg mx-auto">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  placeholder='Try "website design"...'
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/30 transition-all"
                />
              </div>
              <button
                onClick={handleSearch}
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl gradient-hero text-white font-semibold text-sm hover:opacity-90 transition-opacity text-center"
              >
                Search
              </button>
            </motion.div>
            <motion.div variants={fadeUp} className="flex flex-wrap items-center justify-center gap-2 mt-6">
              <span className="text-xs text-muted-foreground">Popular:</span>
              {['Web Dev', 'Logo Design', 'Video Editing', 'SEO'].map((t) => (
                <Link
                  key={t}
                  href={`/browse?keyword=${encodeURIComponent(t)}`}
                  className="text-xs px-3 py-1 rounded-full border border-border text-muted-foreground hover:border-blue-600 hover:text-blue-600 transition-colors"
                >
                  {t}
                </Link>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 border-y border-border bg-card/50">
        <div className="container mx-auto px-4">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: Users, label: 'Active Freelancers', value: '12,000+' },
              { icon: Briefcase, label: 'Projects Completed', value: '120K+' },
              { icon: Star, label: 'Average Rating', value: '4.8/5' },
              { icon: Shield, label: 'Satisfaction Rate', value: '98%' },
            ].map((s) => (
              <motion.div key={s.label} variants={fadeUp} className="text-center">
                <s.icon className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                <div className="text-2xl font-bold">{s.value}</div>
                <div className="text-sm text-muted-foreground">{s.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
            <motion.div variants={fadeUp} className="flex items-end justify-between mb-10">
              <div>
                <h2 className="text-3xl font-bold mb-2">Popular Categories</h2>
                <p className="text-muted-foreground">Browse services by category</p>
              </div>
              <Link href="/categories" className="hidden md:flex items-center gap-1 text-sm text-blue-600 font-medium hover:underline">
                View All <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {categories.slice(0, 8).map((cat) => (
                <motion.div key={cat.id} variants={fadeUp}>
                  <Link
                    href={`/category/${cat.id}`}
                    className="block p-6 rounded-xl border border-border bg-card hover-lift text-center group"
                  >
                    <span className="text-4xl block mb-3">💼</span>
                    <h3 className="font-semibold group-hover:text-blue-600 transition-colors">{cat.name}</h3>
                    <p className="text-sm text-muted-foreground mt-1">View services</p>
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 bg-card/50 border-y border-border">
        <div className="container mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="text-center mb-12">
            <motion.h2 variants={fadeUp} className="text-3xl font-bold mb-2">How Gigsly Works</motion.h2>
            <motion.p variants={fadeUp} className="text-muted-foreground">Simple steps to get started</motion.p>
          </motion.div>
          <div className="grid md:grid-cols-2 gap-12 max-w-4xl mx-auto">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
              <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-blue-600/10 text-blue-600 flex items-center justify-center text-sm font-bold">B</span>
                For Buyers
              </h3>
              {['Browse services that match your needs', 'Compare sellers, ratings & portfolios', 'Hire the best fit and collaborate'].map((step, i) => (
                <motion.div key={i} variants={fadeUp} className="flex items-start gap-4 mb-6">
                  <span className="w-8 h-8 rounded-full gradient-hero text-white flex items-center justify-center text-sm font-bold shrink-0">{i + 1}</span>
                  <div>
                    <p className="font-medium">{step}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
              <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-orange-500/10 text-orange-500 flex items-center justify-center text-sm font-bold">S</span>
                For Sellers
              </h3>
              {['Create your profile and showcase skills', 'Publish a gig with pricing & details', 'Get hired and start earning'].map((step, i) => (
                <motion.div key={i} variants={fadeUp} className="flex items-start gap-4 mb-6">
                  <span className="w-8 h-8 rounded-full gradient-accent text-white flex items-center justify-center text-sm font-bold shrink-0">{i + 1}</span>
                  <div>
                    <p className="font-medium">{step}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Featured Gigs */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
            <motion.div variants={fadeUp} className="flex items-end justify-between mb-10">
              <div>
                <h2 className="text-3xl font-bold mb-2">Trending Services</h2>
                <p className="text-muted-foreground">Top-rated gigs you&apos;ll love</p>
              </div>
              <Link href="/browse" className="hidden md:flex items-center gap-1 text-sm text-blue-600 font-medium hover:underline">
                See All <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredGigs.map((gig, i) => (
              <motion.div
                key={gig.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Link href={`/gig/${gig.id}`} className="block border border-border rounded-xl overflow-hidden hover-lift bg-card">
                  <div className="h-40 bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                    <Briefcase className="w-12 h-12 text-blue-600" />
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold mb-2 line-clamp-2">{gig.title}</h3>
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{gig.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Starting at</span>
                      <span className="text-lg font-bold text-blue-600">₹{gig.budget}</span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Reviews */}
      <section className="py-20 px-4 bg-card/50 border-y border-border">
        <div className="container mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="text-center mb-12">
            <motion.h2 variants={fadeUp} className="text-3xl font-bold mb-2">What Our Users Say</motion.h2>
            <motion.p variants={fadeUp} className="text-muted-foreground">Real reviews from real people</motion.p>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {reviews.map((r, i) => (
              <motion.div
                key={r.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-6 rounded-xl border border-border bg-card"
              >
                <div className="flex items-center gap-1 mb-3">
                  {Array.from({ length: r.rating }).map((_, j) => (
                    <Star key={j} className="w-4 h-4 fill-orange-500 text-orange-500" />
                  ))}
                </div>
                <p className="text-sm leading-relaxed mb-4">&quot;{r.text}&quot;</p>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-semibold">{r.avatar}</div>
                  <div>
                    <p className="text-sm font-medium">{r.user}</p>
                    <p className="text-xs text-muted-foreground">{r.service}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="rounded-2xl gradient-hero p-12 md:p-16 text-center relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 relative z-10">
              Ready to get started?
            </h2>
            <p className="text-white/80 mb-8 max-w-md mx-auto relative z-10">
              Join thousands of freelancers and businesses on Gigsly today.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 relative z-10">
              <Link href="/browse" className="px-8 py-3.5 rounded-xl bg-white text-gray-900 font-semibold text-sm hover:bg-white/90 transition-colors">
                Hire Talent
              </Link>
              <Link href="/create-gig" className="px-8 py-3.5 rounded-xl border-2 border-white/30 text-white font-semibold text-sm hover:bg-white/10 transition-colors">
                Create a Gig
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
