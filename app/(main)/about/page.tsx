import type { Metadata } from 'next';
import AboutClient from './AboutClient';

export const metadata: Metadata = {
  title: 'About Us | Gigsly',
  description:
    'The story behind Gigsly—mission, milestones, values, and the team building the future of work.',
};

export default function AboutPage() {
  return <AboutClient />;
}
