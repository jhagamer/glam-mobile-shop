
import React, { useState } from 'react';
import Layout from '@/components/Layout';
import SearchBar from '@/components/SearchBar';
import HeroSection from '@/components/home/HeroSection';
import CategoryControls from '@/components/home/CategoryControls';
import ProductsGrid from '@/components/home/ProductsGrid';
import SearchFilters from '@/components/SearchFilters';
import { ErrorBoundary } from '@/components/ui/error-boundary';
import { useHomeData } from '@/hooks/useHomeData';

const Home = () => {
  const {
    products,
    categories,
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
    loading,
    cartItemCount,
    categoriesLoading,
    categoriesError,
    fetchCategories,
    handleAddToCart,
    fetchProducts,
    currentPage,
    totalPages,
    totalCount,
    handlePageChange,
    filters,
    handleFiltersChange,
    clearFilters,
  } = useHomeData();

  const [filtersOpen, setFiltersOpen] = useState(false);

  return (
    <ErrorBoundary>
      <Layout cartItemCount={cartItemCount}>
        <div className="space-y-8">
          <HeroSection />
          <SearchBar value={searchQuery} onChange={setSearchQuery} />
          <CategoryControls
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            categoriesLoading={categoriesLoading}
            categoriesError={categoriesError}
            onRetryCategories={fetchCategories}
          />
          <SearchFilters
            filters={filters}
            onFiltersChange={handleFiltersChange}
            onClearFilters={clearFilters}
            isOpen={filtersOpen}
            onToggle={() => setFiltersOpen(!filtersOpen)}
          />
          <ProductsGrid
            products={products}
            loading={loading}
            searchQuery={searchQuery}
            selectedCategory={selectedCategory}
            onAddToCart={handleAddToCart}
            onRetry={fetchProducts}
            currentPage={currentPage}
            totalPages={totalPages}
            totalCount={totalCount}
            onPageChange={handlePageChange}
          />
        </div>
      </Layout>
    </ErrorBoundary>
  );
};

export default Home;
