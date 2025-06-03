
import React from 'react';
import { Button } from '@/components/ui/button';

interface Category {
  id: string;
  name: string;
}

interface CategoryTabsProps {
  categories: Category[];
  selectedCategory: string;
  onSelectCategory: (categoryId: string) => void;
}

const CategoryTabs: React.FC<CategoryTabsProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
}) => {
  return (
    <div className="flex flex-wrap justify-center gap-2">
      <Button
        variant={selectedCategory === 'all' ? 'default' : 'outline'}
        onClick={() => onSelectCategory('all')}
        className={selectedCategory === 'all' 
          ? 'bg-gradient-to-r from-rose-500 to-purple-600 text-white border-0' 
          : 'border-rose-200 text-rose-600 hover:bg-rose-50'
        }
      >
        All Products
      </Button>
      
      {categories.map((category) => (
        <Button
          key={category.id}
          variant={selectedCategory === category.id ? 'default' : 'outline'}
          onClick={() => onSelectCategory(category.id)}
          className={selectedCategory === category.id 
            ? 'bg-gradient-to-r from-rose-500 to-purple-600 text-white border-0' 
            : 'border-rose-200 text-rose-600 hover:bg-rose-50'
          }
        >
          {category.name}
        </Button>
      ))}
    </div>
  );
};

export default CategoryTabs;
