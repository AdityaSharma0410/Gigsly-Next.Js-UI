'use client';

import { useAuth } from '@/hooks/useAuth';
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  useMotionTemplate,
  useMotionValue,
  useInView,
  AnimatePresence,
} from 'framer-motion';
import Link from 'next/link';
import {
  ArrowDown,
  Sparkles,
  Shield,
  Zap,
  Target,
  MessageCircle,
  CreditCard,
  Radio,
  Share2,
  Mail,
  Calendar,
  Cpu,
  Users,
  Rocket,
  Compass,
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ParallaxFloat } from '@/components/motion/ParallaxFloat';

const sectionClass =
  'relative min-h-screen flex flex-col justify-center py-24 md:py-32 px-4 snap-start snap-always overflow-hidden';

function useSnapScroll() {
  useEffect(() => {
    const prev = document.documentElement.style.scrollSnapType;
    document.documentElement.style.scrollSnapType = 'y mandatory';
    return () => {
      document.documentElement.style.scrollSnapType = prev;
    };
  }, []);
}

function AnimatedCounter({
  value,
  suffix = '',
  prefix = '',
  decimals = 0,
}: {
  value: number;
  suffix?: string;
  prefix?: string;
  decimals?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-12%' });
  const [n, setN] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let start: number | null = null;
    const dur = 2200;
    const tick = (t: number) => {
      if (start === null) start = t;
      const p = Math.min(1, (t - start) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      setN(eased * value);
      if (p < 1) requestAnimationFrame(tick);
    };
    const id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(id);
  }, [inView, value]);

  const text =
    decimals > 0
      ? n.toFixed(decimals)
      : Math.round(n).toLocaleString();

  return (
    <span ref={ref} className="tabular-nums">
      {prefix}
      {text}
      {suffix}
    </span>
  );
}

function MouseGlowCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);
  const smoothX = useSpring(mx, { stiffness: 120, damping: 28 });
  const smoothY = useSpring(my, { stiffness: 120, damping: 28 });
  const bg = useMotionTemplate`radial-gradient(420px circle at ${smoothX}% ${smoothY}%, hsl(var(--primary) / 0.18), transparent 55%)`;

  const onMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const el = ref.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      mx.set(((e.clientX - r.left) / r.width) * 100);
      my.set(((e.clientY - r.top) / r.height) * 100);
    },
    [mx, my]
  );

  const onLeave = useCallback(() => {
    mx.set(50);
    my.set(50);
  }, [mx, my]);

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className={`relative overflow-hidden rounded-2xl border border-border/60 ${className}`}
    >
      <motion.div className="pointer-events-none absolute inset-0 opacity-90" style={{ background: bg }} />
      <div className="relative z-[1]">{children}</div>
    </div>
  );
}

const timeline = [
  {
    year: '2023',
    title: 'Idea Spark',
    text: 'The first idea emerged: a smarter, more transparent way for businesses and freelancers to connect.',
    icon: Sparkles,
  },
  {
    year: '2024',
    title: 'First Prototype',
    text: 'The first prototype launched with core gig posting, messaging, and profile features.',
    icon: Cpu,
  },
  {
    year: '2024',
    title: 'First 1,000 Users',
    text: 'The platform crossed its first thousand users and began growing through word of mouth.',
    icon: Users,
  },
  {
    year: '2025',
    title: 'Expansion',
    text: 'New categories, advanced search, payments, reviews, and project tracking were added.',
    icon: Rocket,
  },
  {
    year: '2026+',
    title: 'The Future',
    text: 'The next chapter includes AI-powered matching, global expansion, and deeper collaboration tools.',
    icon: Compass,
  },
];

const values = [
  {
    title: 'Transparency',
    desc: 'Clear pricing, honest communication, and no hidden surprises.',
    icon: Target,
  },
  {
    title: 'Trust',
    desc: 'A safe ecosystem where businesses and freelancers can collaborate confidently.',
    icon: Shield,
  },
  {
    title: 'Speed',
    desc: 'Projects move quickly, from discovery to delivery.',
    icon: Zap,
  },
  {
    title: 'Opportunity',
    desc: 'We create a stage where great talent can be discovered.',
    icon: Sparkles,
  },
];

const team = [
  {
    name: 'Bhavdeep',
    role: 'CEO & Founder',
    desc: 'Visionary behind the platform, focused on building the future of the gig economy.',
    initial: 'B',
  },
  {
    name: 'Aditya',
    role: 'CTO',
    desc: 'Architect of the platform’s technology, crafting fast, scalable, and elegant systems.',
    initial: 'A',
  },
  {
    name: 'Shlaisha',
    role: 'Head of Operations',
    desc: 'Ensures every part of the platform runs smoothly, efficiently, and seamlessly.',
    initial: 'S',
  },
];

const features = [
  {
    title: 'Smart Matching',
    desc: 'AI-assisted recommendations connect the right talent with the right project.',
    icon: Sparkles,
  },
  {
    title: 'Secure Payments',
    desc: 'Protected transactions and milestone-based payouts.',
    icon: CreditCard,
  },
  {
    title: 'Real-Time Collaboration',
    desc: 'Messaging, file sharing, and project tracking in one place.',
    icon: Radio,
  },
];

export default function AboutClient() {
  useSnapScroll();
  const { isAuthenticated } = useAuth();
  const reg = (path: string) => `/register?next=${encodeURIComponent(path)}`;
  const exploreHref = isAuthenticated ? '/browse' : reg('/browse');
  const hireHref = isAuthenticated ? '/create-gig' : reg('/create-gig');
  const workHref = isAuthenticated ? '/find-work' : reg('/find-work');

  const [bootDone, setBootDone] = useState(false);
  useEffect(() => {
    const t = window.setTimeout(() => setBootDone(true), 1100);
    return () => window.clearTimeout(t);
  }, []);

  const { scrollY } = useScroll();
  const heroScale = useTransform(scrollY, [0, 320], [1, 0.9]);
  const heroY = useTransform(scrollY, [0, 320], [0, -48]);

  const timelineRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: tlProgress } = useScroll({
    target: timelineRef,
    offset: ['start 75%', 'end 25%'],
  });
  const lineScale = useSpring(tlProgress, { stiffness: 80, damping: 35 });

  return (
    <div className="relative">
      <AnimatePresence>
        {!bootDone && (
          <motion.div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-background/95"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } }}
          >
            <div className="relative flex flex-col items-center gap-6">
              <motion.div
                className="relative h-16 w-40"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4 }}
              >
                {[0, 1, 2, 3].map((i) => (
                  <motion.div
                    key={i}
                    className="absolute left-0 right-0 h-px rounded-full bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-80"
                    style={{ top: `${22 + i * 14}px` }}
                    initial={{ scaleX: 0, opacity: 0.2 }}
                    animate={{ scaleX: 1, opacity: 1 }}
                    transition={{ delay: 0.05 + i * 0.12, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                  />
                ))}
                <motion.span
                  className="absolute inset-0 flex items-center justify-center text-3xl font-bold text-gradient pt-2"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.55, duration: 0.45 }}
                >
                  Gigsly
                </motion.span>
              </motion.div>
              <motion.div
                className="h-1 w-32 rounded-full bg-muted overflow-hidden"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <motion.div
                  className="h-full w-1/2 rounded-full gradient-hero"
                  initial={{ x: '-120%' }}
                  animate={{ x: '220%' }}
                  transition={{ repeat: Infinity, duration: 1.1, ease: 'linear' }}
                />
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Ambient noise (about page only) */}
      <div
        className="pointer-events-none fixed inset-0 z-0 opacity-[0.035] dark:opacity-[0.05] mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Section 1 — Hero */}
      <section id="about-hero" className={sectionClass}>
        <div className="absolute inset-0 -z-10">
          <ParallaxFloat
            distance={112}
            distanceX={-12}
            scrollRange={[0, 520]}
            className="absolute -top-24 left-[8%] h-40 w-56 rounded-2xl border border-border/50 bg-card/40 backdrop-blur-xl shadow-xl"
          />
          <ParallaxFloat
            distance={156}
            distanceX={16}
            scrollRange={[0, 520]}
            className="absolute top-32 right-[6%] h-36 w-48 rounded-2xl border border-border/50 bg-card/35 backdrop-blur-xl shadow-lg"
          />
          <ParallaxFloat
            distance={88}
            scrollRange={[0, 520]}
            className="absolute bottom-24 left-[18%] h-32 w-64 rounded-2xl border border-border/50 bg-gradient-to-br from-blue-600/15 to-purple-600/10 backdrop-blur-md"
          />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_90%_60%_at_50%_20%,hsl(var(--primary)/0.12),transparent_60%)]" />
        </div>

        <div className="container mx-auto max-w-5xl">
          <motion.div style={{ scale: heroScale, y: heroY }} className="will-change-transform origin-top">
            <div className="text-center space-y-8">
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-card/50 px-4 py-1.5 text-sm font-medium backdrop-blur-md shadow-sm"
              >
                <Calendar className="h-4 w-4 text-primary" />
                Our story
              </motion.div>
              <motion.h1
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.75, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
                className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.08]"
              >
                Building the Future of Work,{' '}
                <span className="text-gradient">One Gig at a Time</span>
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.65, delay: 0.12 }}
                className="mx-auto max-w-2xl text-lg text-muted-foreground"
              >
                This marketplace was created to make hiring and freelancing simpler, faster, and more transparent—so
                projects move with clarity from first message to final delivery.
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.55, delay: 0.18 }}
                className="flex flex-col sm:flex-row items-center justify-center gap-3"
              >
                <Link
                  href={exploreHref}
                  className="inline-flex items-center justify-center rounded-xl px-8 py-3.5 text-sm font-semibold text-white gradient-hero shadow-lg shadow-blue-600/20 transition hover:opacity-95 hover:shadow-xl"
                >
                  Explore the Platform
                </Link>
                <a
                  href="#team"
                  className="inline-flex items-center justify-center rounded-xl border border-border bg-card/60 px-8 py-3.5 text-sm font-semibold backdrop-blur-md transition hover:bg-muted/80"
                >
                  Meet the Team
                </a>
              </motion.div>
            </div>
          </motion.div>
        </div>

        <motion.div
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-muted-foreground"
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
        >
          <span className="text-xs uppercase tracking-[0.2em]">Scroll</span>
          <ArrowDown className="h-5 w-5" />
        </motion.div>
      </section>

      {/* Section 2 — Mission */}
      <section id="mission" className={`${sectionClass} border-t border-border/40`}>
        <div className="container mx-auto max-w-6xl grid lg:grid-cols-2 gap-14 lg:gap-20 items-center">
          <motion.div
            initial={{ opacity: 0, x: -28 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-10%' }}
            transition={{ duration: 0.7 }}
            className="space-y-4"
          >
            <p className="text-sm font-semibold uppercase tracking-widest text-primary">Our mission</p>
            <h2 className="text-3xl md:text-4xl font-bold leading-tight">
              We believe talent should move at the speed of ideas.
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Our platform exists to connect ambitious people with meaningful opportunities, without the friction,
              confusion, and noise of traditional marketplaces.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 28 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-10%' }}
            transition={{ duration: 0.7 }}
            className="relative min-h-[280px]"
          >
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-blue-600/20 via-purple-600/10 to-transparent blur-3xl" />
            <MouseGlowCard className="h-full min-h-[280px] rounded-3xl border border-white/10 bg-card/45 p-8 backdrop-blur-xl shadow-2xl">
              <div className="flex h-full flex-col justify-between gap-8">
                <div className="flex items-center justify-between gap-4">
                  <div className="rounded-2xl border border-border/60 bg-background/50 p-4 shadow-sm">
                    <p className="text-xs text-muted-foreground mb-1">Hiring request</p>
                    <div className="h-2 w-32 rounded bg-muted mb-2" />
                    <div className="h-2 w-24 rounded bg-muted/70" />
                  </div>
                  <motion.div
                    animate={{ scale: [1, 1.04, 1] }}
                    transition={{ duration: 3.2, repeat: Infinity }}
                    className="rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-xs font-medium text-primary"
                  >
                    Matched
                  </motion.div>
                </div>
                <div className="flex items-center justify-center gap-3">
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
                  <MessageCircle className="h-6 w-6 text-primary" />
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
                </div>
                <div className="rounded-2xl border border-border/60 bg-background/50 p-4 shadow-sm">
                  <p className="text-xs text-muted-foreground mb-1">Freelancer profile</p>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600" />
                    <div className="space-y-1.5 flex-1">
                      <div className="h-2.5 w-28 rounded bg-muted" />
                      <div className="h-2 w-20 rounded bg-muted/70" />
                    </div>
                  </div>
                </div>
              </div>
            </MouseGlowCard>
          </motion.div>
        </div>

        <div className="container mx-auto max-w-6xl mt-16 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'gigs completed', value: 10000, suffix: '+' },
            { label: 'freelancers', value: 5000, suffix: '+' },
            { label: 'businesses', value: 1200, suffix: '+' },
            { label: 'satisfaction rate', value: 98, suffix: '%', raw: true },
          ].map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.5 }}
              className="rounded-2xl border border-border/60 bg-card/40 p-5 text-center backdrop-blur-md shadow-sm"
            >
              <div className="text-2xl md:text-3xl font-bold text-foreground">
                {item.raw ? (
                  <AnimatedCounter value={98} suffix="%" />
                ) : (
                  <AnimatedCounter value={item.value} suffix={item.suffix} />
                )}
              </div>
              <p className="mt-1 text-xs md:text-sm text-muted-foreground capitalize">{item.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Section 3 — Timeline */}
      <section ref={timelineRef} id="timeline" className={`${sectionClass} border-t border-border/40`}>
        <div className="container mx-auto max-w-4xl relative">
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center text-3xl md:text-4xl font-bold mb-4"
          >
            The journey
          </motion.h2>
          <p className="text-center text-muted-foreground max-w-xl mx-auto mb-16">
            A vertical thread of milestones—lighting up as you move through the story.
          </p>

          <div className="relative">
            <div className="absolute left-1/2 top-0 bottom-0 w-px -translate-x-1/2 bg-border/60 overflow-hidden">
              <motion.div
                className="absolute top-0 left-0 w-full origin-top bg-gradient-to-b from-blue-500 via-purple-500 to-primary"
                style={{ scaleY: lineScale, height: '100%' }}
              />
            </div>

            <div className="space-y-14 md:space-y-20">
              {timeline.map((m, i) => {
                const left = i % 2 === 0;
                const Icon = m.icon;
                const card = (
                  <motion.div
                    whileHover={{ y: -4, scale: 1.01 }}
                    transition={{ type: 'spring', stiffness: 260, damping: 22 }}
                    className={`rounded-2xl border border-border/60 bg-card/45 p-6 backdrop-blur-xl shadow-xl hover:shadow-[0_0_40px_hsl(var(--primary)/0.12)] max-w-md ${
                      left ? 'md:ml-auto md:mr-0' : 'md:mr-auto md:ml-0'
                    }`}
                  >
                    <div className="flex md:hidden items-center gap-2 mb-3 text-primary">
                      <Icon className="h-5 w-5" />
                      <span className="text-sm font-semibold">{m.year}</span>
                    </div>
                    <p className="text-sm font-semibold text-primary mb-1">{m.year}</p>
                    <h3 className="text-xl font-bold mb-2">{m.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">{m.text}</p>
                  </motion.div>
                );
                return (
                  <motion.div
                    key={m.title}
                    initial={{ opacity: 0, y: 36, filter: 'blur(8px)' }}
                    whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                    viewport={{ once: true, margin: '-12%' }}
                    transition={{ duration: 0.65, delay: (i % 3) * 0.06 }}
                    className="relative grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-0 items-center"
                  >
                    <div className="pointer-events-none absolute left-1/2 top-1/2 z-10 hidden md:flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-primary/40 bg-card/90 shadow-[0_0_24px_hsl(var(--primary)/0.35)] backdrop-blur-md">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    {left ? (
                      <>
                        <div className="md:pr-10 md:text-right">{card}</div>
                        <div className="hidden md:block" aria-hidden />
                      </>
                    ) : (
                      <>
                        <div className="hidden md:block" aria-hidden />
                        <div className="md:pl-10 md:text-left">{card}</div>
                      </>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Section 4 — Values */}
      <section id="values" className={`${sectionClass} border-t border-border/40`}>
        <div className="container mx-auto max-w-6xl">
          <motion.h2
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center text-3xl md:text-4xl font-bold mb-12"
          >
            Core values
          </motion.h2>
          <div className="grid sm:grid-cols-2 gap-6">
            {values.map((v, i) => (
              <motion.div
                key={v.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06, duration: 0.55 }}
                whileHover={{ rotateX: 2, rotateY: -2, scale: 1.01 }}
                style={{ transformStyle: 'preserve-3d' }}
                className="group rounded-2xl border border-border/60 bg-card/40 p-8 backdrop-blur-xl shadow-lg hover:shadow-[0_0_48px_hsl(var(--primary)/0.14)] transition-shadow"
              >
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-primary/30 bg-primary/10 text-primary shadow-[0_0_24px_hsl(var(--primary)/0.25)]">
                  <v.icon className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{v.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{v.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 5 — Team */}
      <section id="team" className={`${sectionClass} border-t border-border/40`}>
        <div className="container mx-auto max-w-6xl">
          <motion.h2
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center text-3xl md:text-4xl font-bold mb-4"
          >
            Meet the team
          </motion.h2>
          <p className="text-center text-muted-foreground max-w-lg mx-auto mb-14">
            The people shaping the platform—focused on clarity, craft, and care.
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            {team.map((member, i) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 32 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                whileHover={{ y: -6, scale: 1.02 }}
                className="rounded-3xl border border-border/60 bg-card/45 p-8 text-center backdrop-blur-xl shadow-xl hover:shadow-[0_0_40px_hsl(var(--primary)/0.18)]"
              >
                <div className="mx-auto mb-5 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-purple-600 text-3xl font-bold text-white shadow-lg ring-4 ring-border/50">
                  {member.initial}
                </div>
                <h3 className="text-xl font-bold">{member.name}</h3>
                <p className="text-sm font-medium text-primary mt-1">{member.role}</p>
                <p className="mt-4 text-sm text-muted-foreground leading-relaxed">{member.desc}</p>
                <div className="mt-6 flex items-center justify-center gap-3 text-muted-foreground">
                  <Link
                    href="/contact"
                    className="rounded-full border border-border/70 p-2 hover:bg-muted/80 hover:text-foreground transition"
                    aria-label="Contact"
                  >
                    <Mail className="h-4 w-4" />
                  </Link>
                  <Link
                    href="/contact"
                    className="rounded-full border border-border/70 p-2 hover:bg-muted/80 hover:text-foreground transition"
                    aria-label="Social"
                  >
                    <Share2 className="h-4 w-4" />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-16 rounded-3xl border border-border/50 bg-gradient-to-br from-card/80 via-card/50 to-transparent p-10 text-center backdrop-blur-xl shadow-[0_0_60px_hsl(var(--primary)/0.12)]"
          >
            <p className="text-lg md:text-xl font-medium leading-relaxed max-w-3xl mx-auto">
              “Great platforms are not built by code alone. They are built by people who believe work can be better.”
            </p>
          </motion.div>
        </div>
      </section>

      {/* Section 6 — Different */}
      <section id="different" className={`${sectionClass} border-t border-border/40`}>
        <div className="container mx-auto max-w-6xl">
          <motion.h2
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center text-3xl md:text-4xl font-bold mb-12"
          >
            Why we&apos;re different
          </motion.h2>
          <div className="grid md:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <MouseGlowCard
                key={f.title}
                className="group rounded-3xl border border-border/60 bg-card/40 p-8 backdrop-blur-xl shadow-lg min-h-[200px]"
              >
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className="h-full flex flex-col"
                >
                  <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl border border-border bg-background/60 text-primary">
                    <f.icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed flex-1">{f.desc}</p>
                  <div className="mt-6 h-px w-full bg-gradient-to-r from-transparent via-primary/40 to-transparent opacity-70 group-hover:opacity-100" />
                </motion.div>
              </MouseGlowCard>
            ))}
          </div>
        </div>
      </section>

      {/* Section 7 — CTA */}
      <section id="cta" className={`${sectionClass} border-t border-border/40 pb-32`}>
        <div className="container mx-auto max-w-4xl text-center relative">
          <div className="absolute inset-0 -z-10 blur-3xl opacity-70">
            <div className="absolute left-1/2 top-1/2 h-64 w-[120%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-r from-blue-600/30 via-purple-600/25 to-primary/20" />
          </div>
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="space-y-8"
          >
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight">
              Ready to Build Something <span className="text-gradient">Extraordinary?</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Whether you&apos;re hiring talent or looking for your next project, Gigsly is built to help you move faster
              with confidence.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href={hireHref}
                className="inline-flex min-w-[200px] justify-center rounded-2xl px-10 py-4 text-base font-semibold text-white gradient-hero shadow-[0_0_40px_hsl(217_91%_60%/0.35)] transition hover:opacity-95"
              >
                Start Hiring
              </Link>
              <Link
                href={workHref}
                className="inline-flex min-w-[200px] justify-center rounded-2xl border border-border bg-card/60 px-10 py-4 text-base font-semibold backdrop-blur-md transition hover:bg-muted/80"
              >
                Find Work
              </Link>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mt-20 h-24 bg-gradient-to-t from-background via-transparent to-transparent"
          />
        </div>
      </section>
    </div>
  );
}
