
import React from 'react';
import { Button } from '@/components/ui/button';
import { ProductForm as ProductFormType, Product, Category } from '@/types/admin';
import { ProductFormFields } from './ProductFormFields';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface ProductFormProps {
  productForm: ProductFormType;
  setProductForm: React.Dispatch<React.SetStateAction<ProductFormType>>;
  product: Product | null;
  categories: Category[];
  onSuccess: () => void;
  onClose: () => void;
  onCategoryCreated: (category: Category) => void;
}

export const ProductForm: React.FC<ProductFormProps> = ({
  productForm,
  setProductForm,
  product,
  categories,
  onSuccess,
  onClose,
  onCategoryCreated
}) => {
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const productData = {
        name: productForm.name,
        description: productForm.description,
        price: parseFloat(productForm.price),
        category_id: productForm.category_id,
        image_url: productForm.image_url,
        stock: parseInt(productForm.stock)
      };

      if (product) {
        const { error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', product.id);

        if (error) {
          console.error('Update error:', error);
          throw error;
        }
        toast({ title: "Success", description: "Product updated successfully" });
      } else {
        const { error } = await supabase
          .from('products')
          .insert([productData]);

        if (error) {
          console.error('Insert error:', error);
          throw error;
        }
        toast({ title: "Success", description: "Product created successfully" });
      }

      onClose();
      onSuccess();
    } catch (error: any) {
      console.error('Error saving product:', error);
      toast({
        title: "Error",
        description: `Failed to ${product ? 'update' : 'create'} product: ${error.message}`,
        variant: "destructive"
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <ProductFormFields
        productForm={productForm}
        setProductForm={setProductForm}
        categories={categories}
        onCategoryCreated={onCategoryCreated}
      />
      <Button type="submit" className="w-full">
        {product ? 'Update Product' : 'Create Product'}
      </Button>
    </form>
  );
};
