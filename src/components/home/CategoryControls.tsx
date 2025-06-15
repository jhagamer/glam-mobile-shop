
import React from 'react';
import CategoryTabs from '@/components/CategoryTabs';
import { CategoryTabsSkeleton } from '@/components/ui/loading-skeleton';
import { ErrorFallback } from '@/components/ui/error-boundary';

interface Category {
  id: string;
  name: string;
}

interface CategoryControlsProps {
  categories: Category[];
  selectedCategory: string;
  onSelectCategory: (categoryId: string) => void;
  categoriesLoading: boolean;
  categoriesError: boolean;
  onRetryCategories: () => void;
}

const CategoryControls: React.FC<CategoryControlsProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
  categoriesLoading,
  categoriesError,
  onRetryCategories
}) => {
  if (categoriesLoading) {
    return <CategoryTabsSkeleton />;
  }

  if (categoriesError) {
    return (
      <ErrorFallback 
        error="Failed to load categories" 
        onRetry={onRetryCategories}
      />
    );
  }

  return (
    <CategoryTabs
      categories={categories}
      selectedCategory={selectedCategory}
      onSelectCategory={onSelectCategory}
    />
  );
};

export default CategoryControls;
