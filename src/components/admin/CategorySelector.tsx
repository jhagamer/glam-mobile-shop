
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus } from 'lucide-react';
import { ProductForm, Category } from '@/types/admin';
import { InlineCategoryForm } from './InlineCategoryForm';

interface CategorySelectorProps {
  productForm: ProductForm;
  setProductForm: React.Dispatch<React.SetStateAction<ProductForm>>;
  categories: Category[];
  onCategoryCreated: (category: Category) => void;
}

export const CategorySelector: React.FC<CategorySelectorProps> = ({
  productForm,
  setProductForm,
  categories,
  onCategoryCreated
}) => {
  const [showCategoryForm, setShowCategoryForm] = useState(false);

  const handleCategoryCreated = (newCategory: Category) => {
    onCategoryCreated(newCategory);
    setProductForm(prev => ({ ...prev, category_id: newCategory.id }));
    setShowCategoryForm(false);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <Label htmlFor="category">Category *</Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setShowCategoryForm(!showCategoryForm)}
        >
          <Plus className="h-4 w-4 mr-1" />
          Add Category
        </Button>
      </div>
      
      {showCategoryForm && (
        <div className="mb-3">
          <InlineCategoryForm
            onCategoryCreated={handleCategoryCreated}
            onCancel={() => setShowCategoryForm(false)}
          />
        </div>
      )}
      
      <Select 
        value={productForm.category_id} 
        onValueChange={(value) => setProductForm({ ...productForm, category_id: value })} 
        required
      >
        <SelectTrigger>
          <SelectValue placeholder="Select category" />
        </SelectTrigger>
        <SelectContent>
          {categories.map((category) => (
            <SelectItem key={category.id} value={category.id}>
              {category.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
