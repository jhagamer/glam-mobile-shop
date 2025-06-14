
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ShoppingCart, User, LogOut, Settings, Package, History } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
  cartItemCount?: number;
}

const Layout: React.FC<LayoutProps> = ({ children, cartItemCount = 0 }) => {
  const { user, userRole, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleCartClick = () => {
    navigate('/cart');
  };

  const handleOrderHistoryClick = () => {
    navigate('/orders');
  };

  const handleAdminClick = () => {
    navigate('/admin');
  };

  const handleProductManagementClick = () => {
    navigate('/admin/products');
  };

  const handleLogoClick = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-rose-100 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div 
              className="flex items-center space-x-3 cursor-pointer"
              onClick={handleLogoClick}
            >
              <div className="w-10 h-10 bg-gradient-to-br from-rose-400 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-xl font-bold text-white">💄</span>
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-rose-600 to-purple-600 bg-clip-text text-transparent">
                Luxe Beauty
              </h1>
            </div>

            {/* Navigation */}
            <div className="flex items-center space-x-4">
              {userRole === 'admin' && (
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    onClick={handleAdminClick}
                    className="text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Orders
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={handleProductManagementClick}
                    className="text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                  >
                    <Package className="h-4 w-4 mr-2" />
                    Products
                  </Button>
                </div>
              )}

              <Button
                variant="ghost"
                onClick={handleCartClick}
                className="relative text-rose-600 hover:text-rose-700 hover:bg-rose-50"
              >
                <ShoppingCart className="h-5 w-5" />
                {cartItemCount > 0 && (
                  <Badge 
                    className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 bg-gradient-to-r from-rose-500 to-purple-600 text-white text-xs"
                  >
                    {cartItemCount}
                  </Badge>
                )}
              </Button>

              {/* Profile Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user?.user_metadata?.avatar_url} />
                      <AvatarFallback className="bg-gradient-to-br from-rose-400 to-purple-600 text-white">
                        {user?.email?.charAt(0).toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 bg-white border border-gray-200 shadow-lg" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {user?.email?.split('@')[0] || 'User'}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user?.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  
                  {userRole === 'consumer' && (
                    <>
                      <DropdownMenuItem onClick={handleOrderHistoryClick}>
                        <History className="mr-2 h-4 w-4" />
                        <span>Order History</span>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}
                  
                  {userRole === 'admin' && (
                    <>
                      <DropdownMenuItem onClick={handleAdminClick}>
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Manage Orders</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={handleProductManagementClick}>
                        <Package className="mr-2 h-4 w-4" />
                        <span>Manage Products</span>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}
                  
                  <DropdownMenuItem onClick={signOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
};

export default Layout;
