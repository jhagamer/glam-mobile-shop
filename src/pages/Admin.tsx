
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Layout from '@/components/Layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, ShoppingCart, Crown } from 'lucide-react';
import { Navigate } from 'react-router-dom';
import { useAdminData } from '@/hooks/useAdminData';
import { OrdersTab } from '@/components/admin/OrdersTab';
import { UsersTab } from '@/components/admin/UsersTab';
import { CategoriesTab } from '@/components/admin/CategoriesTab';

const Admin = () => {
  const { user, userRole, loading } = useAuth();
  const {
    categories,
    orders,
    users,
    fetchCategories,
    updateOrderStatus,
    promoteToAdmin
  } = useAdminData(userRole);

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
          <Crown className="h-8 w-8 text-rose-600" />
          <h1 className="text-3xl font-bold bg-gradient-to-r from-rose-600 to-purple-600 bg-clip-text text-transparent">
            Admin Panel
          </h1>
        </div>

        <Tabs defaultValue="orders" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="orders" className="flex items-center space-x-2">
              <ShoppingCart className="h-4 w-4" />
              <span>Incoming Orders</span>
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span>Users</span>
            </TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
          </TabsList>

          <TabsContent value="orders">
            <OrdersTab
              orders={orders}
              onUpdateOrderStatus={updateOrderStatus}
            />
          </TabsContent>

          <TabsContent value="users">
            <UsersTab
              users={users}
              onPromoteToAdmin={promoteToAdmin}
            />
          </TabsContent>

          <TabsContent value="categories">
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

export default Admin;
