
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Layout from '@/components/Layout';
import { Navigate } from 'react-router-dom';
import { Package, Tag } from 'lucide-react';
import { useAdminData } from '@/hooks/useAdminData';
import { ProductsTab } from '@/components/admin/ProductsTab';
import { CategoriesTab } from '@/components/admin/CategoriesTab';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const ProductManagement = () => {
  const { userRole, loading } = useAuth();
  const { products, categories, fetchProducts, fetchCategories } = useAdminData(userRole);

  // Redirect if not admin
  if (!loading && userRole !== 'admin') {
    return <Navigate to="/" replace />;
  }

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-500"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-8">
        <div className="flex items-center space-x-3">
          <Package className="h-8 w-8 text-rose-600" />
          <h1 className="text-3xl font-bold bg-gradient-to-r from-rose-600 to-purple-600 bg-clip-text text-transparent">
            Product Management
          </h1>
        </div>

        <Tabs defaultValue="products" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="products" className="flex items-center space-x-2">
              <Package className="h-4 w-4" />
              <span>Products</span>
            </TabsTrigger>
            <TabsTrigger value="categories" className="flex items-center space-x-2">
              <Tag className="h-4 w-4" />
              <span>Categories</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="products" className="mt-6">
            <ProductsTab
              products={products}
              categories={categories}
              onRefreshProducts={fetchProducts}
            />
          </TabsContent>
          
          <TabsContent value="categories" className="mt-6">
            <CategoriesTab
              categories={categories}
              onRefreshCategories={fetchCategories}
            />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default ProductManagement;
