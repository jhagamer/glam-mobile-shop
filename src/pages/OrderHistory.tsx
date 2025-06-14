
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Package, Clock, CheckCircle, Truck, XCircle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { formatPrice, getStatusColor } from '@/utils/admin';

const OrderHistory = () => {
  const { user } = useAuth();

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['user-orders', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-5 w-5" />;
      case 'confirmed': return <CheckCircle className="h-5 w-5" />;
      case 'on_road': return <Truck className="h-5 w-5" />;
      case 'delivered': return <Package className="h-5 w-5" />;
      case 'cancelled': return <XCircle className="h-5 w-5" />;
      default: return <Clock className="h-5 w-5" />;
    }
  };

  const currentOrders = orders.filter(order => 
    order.status !== 'delivered' && order.status !== 'cancelled'
  );

  const pastOrders = orders.filter(order => 
    order.status === 'delivered' || order.status === 'cancelled'
  );

  if (isLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-500"></div>
        </div>
      </Layout>
    );
  }

  const OrderCard = ({ order }: { order: any }) => (
    <Card key={order.id}>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">Order #{order.id.slice(-8)}</CardTitle>
            <p className="text-sm text-gray-500 mt-1">
              Placed on {new Date(order.created_at).toLocaleDateString()}
            </p>
          </div>
          <p className="font-bold text-rose-600 text-xl">
            {formatPrice(order.total_amount)}
          </p>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {getStatusIcon(order.status)}
            <div>
              <Badge className={getStatusColor(order.status)}>
                {order.status === 'on_road' ? 'On Road' : 
                 order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </Badge>
              <p className="text-sm text-gray-500 mt-1">
                Phone: {order.phone_number}
              </p>
            </div>
          </div>
          
          {order.status === 'delivered' && (
            <div className="text-right">
              <p className="text-sm text-green-600 font-medium">Delivered</p>
              <p className="text-xs text-gray-500">
                {new Date(order.updated_at).toLocaleDateString()}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <Layout>
      <div className="space-y-8">
        <div className="flex items-center space-x-3">
          <Package className="h-8 w-8 text-rose-600" />
          <h1 className="text-3xl font-bold bg-gradient-to-r from-rose-600 to-purple-600 bg-clip-text text-transparent">
            Order History
          </h1>
        </div>

        <Tabs defaultValue="current" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="current" className="flex items-center space-x-2">
              <Truck className="h-4 w-4" />
              <span>Current Orders ({currentOrders.length})</span>
            </TabsTrigger>
            <TabsTrigger value="past" className="flex items-center space-x-2">
              <Package className="h-4 w-4" />
              <span>Past Orders ({pastOrders.length})</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="current" className="space-y-4">
            {currentOrders.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Truck className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-500">No current orders</p>
                </CardContent>
              </Card>
            ) : (
              currentOrders.map(order => <OrderCard key={order.id} order={order} />)
            )}
          </TabsContent>

          <TabsContent value="past" className="space-y-4">
            {pastOrders.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Package className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-500">No past orders</p>
                </CardContent>
              </Card>
            ) : (
              pastOrders.map(order => <OrderCard key={order.id} order={order} />)
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default OrderHistory;
