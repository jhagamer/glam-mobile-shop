
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ProductForm, Category } from '@/types/admin';
import { CategorySelector } from './CategorySelector';

interface ProductFormFieldsProps {
  productForm: ProductForm;
  setProductForm: React.Dispatch<React.SetStateAction<ProductForm>>;
  categories: Category[];
  onCategoryCreated: (category: Category) => void;
}

export const ProductFormFields: React.FC<ProductFormFieldsProps> = ({
  productForm,
  setProductForm,
  categories,
  onCategoryCreated
}) => {
  return (
    <>
      <div>
        <Label htmlFor="name">Product Name *</Label>
        <Input
          id="name"
          value={productForm.name}
          onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
          required
        />
      </div>
      <div>
        <Label htmlFor="description">Description *</Label>
        <Textarea
          id="description"
          value={productForm.description}
          onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
          required
        />
      </div>
      <div>
        <Label htmlFor="price">Price (NPR) *</Label>
        <Input
          id="price"
          type="number"
          step="0.01"
          value={productForm.price}
          onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
          required
        />
      </div>
      <div>
        <Label htmlFor="stock">Stock Quantity *</Label>
        <Input
          id="stock"
          type="number"
          min="0"
          value={productForm.stock}
          onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })}
          required
        />
      </div>
      <CategorySelector
        productForm={productForm}
        setProductForm={setProductForm}
        categories={categories}
        onCategoryCreated={onCategoryCreated}
      />
      <div>
        <Label htmlFor="image_url">Image URL *</Label>
        <Input
          id="image_url"
          type="url"
          value={productForm.image_url}
          onChange={(e) => setProductForm({ ...productForm, image_url: e.target.value })}
          placeholder="https://example.com/image.jpg"
          required
        />
        {productForm.image_url && (
          <div className="mt-2">
            <img
              src={productForm.image_url}
              alt="Product preview"
              className="w-full h-32 object-cover rounded-lg"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
              }}
            />
          </div>
        )}
      </div>
    </>
  );
};
