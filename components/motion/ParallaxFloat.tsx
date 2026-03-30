'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export type ParallaxGlassTint = 'sky' | 'violet' | 'rose' | 'emerald' | 'amber' | 'indigo';

type Props = {
  children?: ReactNode;
  className?: string;
  distance?: number;
  distanceX?: number;
  scrollRange?: [number, number];
  /** Frosted glass + mild hue. No borders. */
  glassTint?: ParallaxGlassTint;
};

/** Shared “frosted panel” shell — no border; blur + soft lift + subtle top highlight */
const GLASS_BASE =
  'relative isolate overflow-hidden rounded-2xl border-0 shadow-2xl shadow-slate-900/12 ring-0 outline-none dark:shadow-black/50 ' +
  'backdrop-blur-[36px] backdrop-saturate-[1.9] [box-shadow:inset_0_1px_0_0_rgba(255,255,255,0.65),0_24px_56px_-22px_rgba(15,23,42,0.18)] ' +
  'dark:[box-shadow:inset_0_1px_0_0_rgba(255,255,255,0.14),0_28px_64px_-24px_rgba(0,0,0,0.65)]';

const TINT_GRADIENT: Record<ParallaxGlassTint, string> = {
  sky: [
    'bg-gradient-to-br from-sky-200/55 via-white/50 to-cyan-100/40',
    'dark:from-sky-500/28 dark:via-white/[0.1] dark:to-cyan-950/30',
  ].join(' '),
  violet: [
    'bg-gradient-to-br from-violet-200/50 via-white/48 to-fuchsia-100/38',
    'dark:from-violet-500/26 dark:via-white/[0.09] dark:to-fuchsia-950/28',
  ].join(' '),
  rose: [
    'bg-gradient-to-br from-rose-200/48 via-white/46 to-orange-50/35',
    'dark:from-rose-500/22 dark:via-white/[0.09] dark:to-orange-950/25',
  ].join(' '),
  emerald: [
    'bg-gradient-to-br from-emerald-200/50 via-white/48 to-teal-100/38',
    'dark:from-emerald-500/24 dark:via-white/[0.09] dark:to-teal-950/26',
  ].join(' '),
  amber: [
    'bg-gradient-to-br from-amber-100/52 via-white/50 to-yellow-50/36',
    'dark:from-amber-500/22 dark:via-white/[0.09] dark:to-amber-950/22',
  ].join(' '),
  indigo: [
    'bg-gradient-to-br from-indigo-200/50 via-white/48 to-violet-100/38',
    'dark:from-indigo-500/26 dark:via-white/[0.09] dark:to-violet-950/28',
  ].join(' '),
};

export function ParallaxFloat({
  children,
  className,
  distance = 72,
  distanceX = 0,
  scrollRange = [0, 480],
  glassTint,
}: Props) {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, scrollRange, [0, distance]);
  const x = useTransform(scrollY, scrollRange, [0, distanceX]);

  return (
    <motion.div
      style={{ y, x }}
      className={cn(glassTint && GLASS_BASE, glassTint && TINT_GRADIENT[glassTint], className)}
    >
      {children}
    </motion.div>
  );
}
