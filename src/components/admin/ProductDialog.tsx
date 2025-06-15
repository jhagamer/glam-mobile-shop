
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Product, Category, ProductForm } from '@/types/admin';
import { ProductForm as ProductFormComponent } from './ProductForm';

interface ProductDialogProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  categories: Category[];
  onSuccess: () => void;
}

export const ProductDialog: React.FC<ProductDialogProps> = ({
  isOpen,
  onClose,
  product,
  categories,
  onSuccess
}) => {
  const [productForm, setProductForm] = useState<ProductForm>({
    name: '',
    description: '',
    price: '',
    category_id: '',
    image_url: '',
    stock: ''
  });
  const [localCategories, setLocalCategories] = useState<Category[]>(categories);

  useEffect(() => {
    setLocalCategories(categories);
  }, [categories]);

  useEffect(() => {
    if (product) {
      setProductForm({
        name: product.name,
        description: product.description || '',
        price: product.price.toString(),
        category_id: product.category_id || '',
        image_url: product.image_url || '',
        stock: product.stock?.toString() || '0'
      });
    } else {
      setProductForm({
        name: '',
        description: '',
        price: '',
        category_id: '',
        image_url: '',
        stock: ''
      });
    }
  }, [product]);

  const handleCategoryCreated = (newCategory: Category) => {
    setLocalCategories(prev => [...prev, newCategory]);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {product ? 'Edit Product' : 'Add New Product'}
          </DialogTitle>
        </DialogHeader>
        <ProductFormComponent
          productForm={productForm}
          setProductForm={setProductForm}
          product={product}
          categories={localCategories}
          onSuccess={onSuccess}
          onClose={onClose}
          onCategoryCreated={handleCategoryCreated}
        />
      </DialogContent>
    </Dialog>
  );
};
