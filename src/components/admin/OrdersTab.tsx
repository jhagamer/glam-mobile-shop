
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Phone, Clock, CheckCircle, Truck, Package } from 'lucide-react';
import { Order } from '@/types/admin';
import { formatPrice, getStatusColor } from '@/utils/admin';

interface OrdersTabProps {
  orders: Order[];
  onUpdateOrderStatus: (orderId: string, status: string) => void;
}

export const OrdersTab: React.FC<OrdersTabProps> = ({
  orders,
  onUpdateOrderStatus
}) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'confirmed': return <CheckCircle className="h-4 w-4" />;
      case 'on_road': return <Truck className="h-4 w-4" />;
      case 'delivered': return <Package className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getNextStatus = (currentStatus: string) => {
    switch (currentStatus) {
      case 'pending': return 'confirmed';
      case 'confirmed': return 'on_road';
      case 'on_road': return 'delivered';
      default: return currentStatus;
    }
  };

  const getStatusAction = (status: string) => {
    switch (status) {
      case 'pending': return 'Confirm Order';
      case 'confirmed': return 'Mark On Road';
      case 'on_road': return 'Mark Delivered';
      default: return '';
    }
  };

  // Filter to show only active orders (not delivered or cancelled)
  const activeOrders = orders.filter(order => 
    order.status !== 'delivered' && order.status !== 'cancelled'
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold">Incoming Orders</h2>
          <p className="text-gray-600">Manage pending and active orders</p>
        </div>
        <Badge variant="outline" className="text-lg px-4 py-2">
          {activeOrders.length} Active Orders
        </Badge>
      </div>
      
      <div className="grid gap-4">
        {activeOrders.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Package className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500">No incoming orders at the moment</p>
            </CardContent>
          </Card>
        ) : (
          activeOrders.map((order) => (
            <Card key={order.id} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">Order #{order.id.slice(-8)}</CardTitle>
                    <div className="flex items-center space-x-2 mt-1">
                      <Phone className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-600 font-medium">{order.phone_number}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">
                      {new Date(order.created_at).toLocaleDateString()}
                    </p>
                    <p className="font-bold text-rose-600 text-lg">
                      {formatPrice(order.total_amount)}
                    </p>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(order.status)}
                    <Badge className={getStatusColor(order.status)}>
                      {order.status === 'on_road' ? 'On Road' : 
                       order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </Badge>
                    <span className="text-sm text-gray-500">
                      {order.user_email}
                    </span>
                  </div>
                  
                  <div className="flex space-x-2">
                    {order.status !== 'delivered' && order.status !== 'cancelled' && (
                      <>
                        {order.status !== 'delivered' && (
                          <Button
                            size="sm"
                            onClick={() => onUpdateOrderStatus(order.id, getNextStatus(order.status))}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            {getStatusAction(order.status)}
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onUpdateOrderStatus(order.id, 'cancelled')}
                          className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
                        >
                          Cancel
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
