import { categoryApi, taskApi, type Category, type Task } from '@/lib/api';
import LandingClient from './LandingClient';

// Use static generation with revalidation instead of force-dynamic
export const revalidate = 60; // Revalidate every 60 seconds

export default async function LandingPage() {
  // Fetch data server-side with fallbacks
  let categories: Category[] = [];
  let featuredGigs: Task[] = [];
  
  try {
    categories = await categoryApi.getAll();
  } catch (error) {
    // Silently fail during development when services aren't running
    if (process.env.NODE_ENV === 'development') {
      categories = []; // Empty array, UI will handle gracefully
    } else {
      console.error('Failed to fetch categories:', error);
    }
  }
  
  try {
    const response = await taskApi.getFeatured({ page: 0, size: 4 });
    featuredGigs = response.content;
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      featuredGigs = [];
    } else {
      console.error('Failed to fetch featured gigs:', error);
    }
  }

  return <LandingClient categories={categories} featuredGigs={featuredGigs} />;
}
