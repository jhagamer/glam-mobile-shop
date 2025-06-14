
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Layout from '@/components/Layout';
import { Crown } from 'lucide-react';
import { Navigate } from 'react-router-dom';
import { useAdminData } from '@/hooks/useAdminData';
import { OrdersTab } from '@/components/admin/OrdersTab';

const Admin = () => {
  const { user, userRole, loading } = useAuth();
  const {
    orders,
    updateOrderStatus
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
            Admin Panel - Incoming Orders
          </h1>
        </div>

        <OrdersTab
          orders={orders}
          onUpdateOrderStatus={updateOrderStatus}
        />
      </div>
    </Layout>
  );
};

export default Admin;
