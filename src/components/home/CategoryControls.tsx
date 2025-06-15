
import React from 'react';
import CategoryTabs from '@/components/CategoryTabs';
import { Loader2 } from 'lucide-react';

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
    return (
      <div className="flex justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-rose-500" />
      </div>
    );
  }

  if (categoriesError) {
    return (
      <div className="text-center py-4">
        <p className="text-gray-500 mb-2">Failed to load categories</p>
        <button 
          onClick={onRetryCategories}
          className="text-rose-600 hover:text-rose-700 underline"
        >
          Try again
        </button>
      </div>
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
