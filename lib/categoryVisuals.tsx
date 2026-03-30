import type { LucideIcon } from 'lucide-react';
import {
  BarChart3,
  Briefcase,
  Clapperboard,
  Code2,
  LayoutTemplate,
  Megaphone,
  Palette,
  PenLine,
  Smartphone,
} from 'lucide-react';

export type CategoryVisual = {
  Icon: LucideIcon;
  iconClass: string;
  bgClass: string;
};

const DEFAULT: CategoryVisual = {
  Icon: Briefcase,
  iconClass: 'text-slate-600 dark:text-slate-400',
  bgClass: 'bg-muted',
};

/** Exact names from the product catalog (case-insensitive). */
const EXACT: Record<string, CategoryVisual> = {
  'web development': {
    Icon: Code2,
    iconClass: 'text-blue-600 dark:text-blue-400',
    bgClass: 'bg-blue-500/15 dark:bg-blue-500/10',
  },
  'mobile app development': {
    Icon: Smartphone,
    iconClass: 'text-indigo-600 dark:text-indigo-400',
    bgClass: 'bg-indigo-500/15 dark:bg-indigo-500/10',
  },
  'graphic design': {
    Icon: Palette,
    iconClass: 'text-pink-600 dark:text-pink-400',
    bgClass: 'bg-pink-500/15 dark:bg-pink-500/10',
  },
  'ui/ux design': {
    Icon: LayoutTemplate,
    iconClass: 'text-violet-600 dark:text-violet-400',
    bgClass: 'bg-violet-500/15 dark:bg-violet-500/10',
  },
  'content writing': {
    Icon: PenLine,
    iconClass: 'text-amber-600 dark:text-amber-400',
    bgClass: 'bg-amber-500/15 dark:bg-amber-500/10',
  },
  'video editing': {
    Icon: Clapperboard,
    iconClass: 'text-rose-600 dark:text-rose-400',
    bgClass: 'bg-rose-500/15 dark:bg-rose-500/10',
  },
  'digital marketing': {
    Icon: Megaphone,
    iconClass: 'text-orange-600 dark:text-orange-400',
    bgClass: 'bg-orange-500/15 dark:bg-orange-500/10',
  },
  'data science': {
    Icon: BarChart3,
    iconClass: 'text-emerald-600 dark:text-emerald-400',
    bgClass: 'bg-emerald-500/15 dark:bg-emerald-500/10',
  },
};

/**
 * Icon + colors for a category name. Uses exact catalog matches first, then keyword fallbacks.
 */
export function getCategoryVisual(name: string): CategoryVisual {
  const key = name.toLowerCase().trim();
  if (EXACT[key]) return EXACT[key];

  const n = key;

  if (/ui\s*\/?\s*ux|user\s*experience|interface|figma|wireframe/.test(n)) {
    return EXACT['ui/ux design']!;
  }
  if (/mobile|ios|android|flutter|kotlin|swift/.test(n)) {
    return EXACT['mobile app development']!;
  }
  if (/web|website|frontend|backend|full[\s-]?stack|devops/.test(n)) {
    return EXACT['web development']!;
  }
  if (/graphic|logo|illustration|branding/.test(n)) {
    return EXACT['graphic design']!;
  }
  if (/content|writing|copy|blog|article/.test(n)) {
    return EXACT['content writing']!;
  }
  if (/video|motion|animation|premiere|after\s*effects/.test(n)) {
    return EXACT['video editing']!;
  }
  if (/marketing|seo|social\s*media|growth|campaign|ads/.test(n)) {
    return EXACT['digital marketing']!;
  }
  if (/data\s*science|analytics|machine\s*learning|\bml\b|deep\s*learning|statistic/.test(n)) {
    return EXACT['data science']!;
  }

  return DEFAULT;
}

/** Distinct icon + soft tinted tile for category cards (landing, categories page, etc.). */
export function CategoryIconTile({
  name,
  size = 'md',
  className = '',
}: {
  name: string;
  size?: 'md' | 'lg';
  className?: string;
}) {
  const { Icon, iconClass, bgClass } = getCategoryVisual(name);
  const wrap =
    size === 'lg'
      ? 'w-16 h-16 rounded-2xl mb-4'
      : 'w-14 h-14 rounded-2xl mb-3';
  const iconSz = size === 'lg' ? 'w-9 h-9' : 'w-8 h-8';
  return (
    <span
      className={`inline-flex items-center justify-center ${wrap} ${bgClass} mx-auto ${className}`}
      aria-hidden
    >
      <Icon className={`${iconSz} ${iconClass}`} strokeWidth={1.65} />
    </span>
  );
}
