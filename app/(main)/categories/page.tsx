'use client';

import { useState, useEffect } from 'react';
import { categoryApi, type Category } from '@/lib/api';
import Link from 'next/link';
import { Loader2, FolderOpen } from 'lucide-react';
import { motion } from 'framer-motion';
import { CategoryIconTile } from '@/lib/categoryVisuals';

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const data = await categoryApi.getAll();
      setCategories(data);
    } catch (error) {
      console.error('Failed to load categories', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen py-20">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold mb-4">Browse Categories</h1>
        <p className="text-muted-foreground mb-8">
          Explore services across all categories
        </p>

        {categories.length === 0 ? (
          <div className="text-center py-20">
            <FolderOpen className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">No categories available</h3>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {categories.map((category, i) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Link
                  href={`/browse?category=${encodeURIComponent(category.name)}`}
                  className="block p-8 rounded-xl border border-border bg-card hover-lift text-center group"
                >
                  <CategoryIconTile name={category.name} size="lg" />
                  <h3 className="font-semibold mb-2 group-hover:text-blue-600 transition-colors">
                    {category.name}
                  </h3>
                  {category.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {category.description}
                    </p>
                  )}
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
