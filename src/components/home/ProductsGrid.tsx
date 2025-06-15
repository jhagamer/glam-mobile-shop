
import React from 'react';
import ProductCard from '@/components/ProductCard';
import { ProductCardSkeleton } from '@/components/ui/loading-skeleton';
import { ErrorFallback } from '@/components/ui/error-boundary';
import { ProductPagination } from '@/components/ui/product-pagination';

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
  error?: string;
  onRetry?: () => void;
  // New pagination props
  currentPage: number;
  totalPages: number;
  totalCount: number;
  onPageChange: (page: number) => void;
}

const ProductsGrid: React.FC<ProductsGridProps> = ({
  products,
  loading,
  searchQuery,
  selectedCategory,
  onAddToCart,
  error,
  onRetry,
  currentPage,
  totalPages,
  totalCount,
  onPageChange,
}) => {
  if (error) {
    return <ErrorFallback error={error} onRetry={onRetry} />;
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 12 }).map((_, index) => (
          <ProductCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🔍</div>
        <h3 className="text-xl font-semibold text-gray-700 mb-2">No products found</h3>
        <p className="text-gray-500">
          {searchQuery || selectedCategory !== 'all' 
            ? 'Try adjusting your search criteria or browse different categories' 
            : 'No products are currently available'
          }
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Results summary */}
      <div className="text-sm text-gray-600">
        Showing {products.length} of {totalCount} products
      </div>

      {/* Products grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onAddToCart={() => onAddToCart(product.id)}
          />
        ))}
      </div>

      {/* Pagination */}
      <ProductPagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={onPageChange}
      />
    </div>
  );
};

export default ProductsGrid;
