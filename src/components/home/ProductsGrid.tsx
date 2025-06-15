
import React from 'react';
import ProductCard from '@/components/ProductCard';
import { Loader2 } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  category_id: string;
  stock: number;
}

interface ProductsGridProps {
  products: Product[];
  loading: boolean;
  searchQuery: string;
  selectedCategory: string;
  onAddToCart: (productId: string) => void;
}

const ProductsGrid: React.FC<ProductsGridProps> = ({
  products,
  loading,
  searchQuery,
  selectedCategory,
  onAddToCart
}) => {
  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-rose-500" />
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">
          {searchQuery || selectedCategory !== 'all' 
            ? 'No products found for your search criteria' 
            : 'No products available'
          }
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onAddToCart={() => onAddToCart(product.id)}
        />
      ))}
    </div>
  );
};

export default ProductsGrid;
