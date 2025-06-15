
import React from 'react';
import Layout from '@/components/Layout';
import SearchBar from '@/components/SearchBar';
import HeroSection from '@/components/home/HeroSection';
import CategoryControls from '@/components/home/CategoryControls';
import ProductsGrid from '@/components/home/ProductsGrid';
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
    handleAddToCart
  } = useHomeData();

  return (
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
        <ProductsGrid
          products={products}
          loading={loading}
          searchQuery={searchQuery}
          selectedCategory={selectedCategory}
          onAddToCart={handleAddToCart}
        />
      </div>
    </Layout>
  );
};

export default Home;
