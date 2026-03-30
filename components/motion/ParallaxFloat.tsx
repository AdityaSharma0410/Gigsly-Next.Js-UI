'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import type { ReactNode } from 'react';

type Props = {
  children?: ReactNode;
  className?: string;
  /** Vertical travel in px over scrollRange (creates depth vs content) */
  distance?: number;
  /** Optional horizontal drift for extra depth */
  distanceX?: number;
  scrollRange?: [number, number];
};

/**
 * Decorative panels that move slower/faster than page scroll for parallax depth.
 */
export function ParallaxFloat({
  children,
  className,
  distance = 72,
  distanceX = 0,
  scrollRange = [0, 480],
}: Props) {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, scrollRange, [0, distance]);
  const x = useTransform(scrollY, scrollRange, [0, distanceX]);

  return (
    <motion.div style={{ y, x }} className={className}>
      {children}
    </motion.div>
  );
}
