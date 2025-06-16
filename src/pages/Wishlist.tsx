
import React from 'react';
import Layout from '@/components/Layout';
import { useWishlist } from '@/hooks/useWishlist';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import ProductCard from '@/components/ProductCard';
import { ProductCardSkeleton } from '@/components/ui/loading-skeleton';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { Heart, ShoppingBag } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  category_id: string;
  stock: number;
}

const WishlistPage: React.FC = () => {
  const { user } = useAuth();
  const { wishlistItems, loading: wishlistLoading } = useWishlist();

  const { data: products = [], isLoading: productsLoading } = useQuery({
    queryKey: ['wishlist-products', wishlistItems],
    queryFn: async () => {
      if (!wishlistItems.length) return [];
      
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .in('id', wishlistItems);

      if (error) throw error;
      return data as Product[];
    },
    enabled: wishlistItems.length > 0,
  });

  const handleAddToCart = async (productId: string) => {
    if (!user) return;

    try {
      // First, check if the item already exists in the cart
      const { data: existingItem, error: checkError } = await supabase
        .from('cart_items')
        .select('id, quantity')
        .eq('user_id', user.id)
        .eq('product_id', productId)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        // PGRST116 is "not found" error, which is expected if item doesn't exist
        throw checkError;
      }

      if (existingItem) {
        // Item exists, update quantity
        const { error: updateError } = await supabase
          .from('cart_items')
          .update({ quantity: existingItem.quantity + 1 })
          .eq('id', existingItem.id);

        if (updateError) throw updateError;
      } else {
        // Item doesn't exist, insert new item
        const { error: insertError } = await supabase
          .from('cart_items')
          .insert([{ user_id: user.id, product_id: productId, quantity: 1 }]);

        if (insertError) throw insertError;
      }

      toast({
        title: "Added to Cart",
        description: "Item has been added to your cart",
      });
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast({
        title: "Error",
        description: "Failed to add item to cart",
        variant: "destructive"
      });
    }
  };

  const isLoading = wishlistLoading || productsLoading;

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-rose-400 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <Heart className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-rose-600 to-purple-600 bg-clip-text text-transparent">
              My Wishlist
            </h1>
          </div>
          <p className="text-gray-600">
            {wishlistItems.length === 0 
              ? "Your wishlist is empty" 
              : `${wishlistItems.length} item${wishlistItems.length === 1 ? '' : 's'} in your wishlist`
            }
          </p>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, index) => (
              <ProductCardSkeleton key={index} />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && wishlistItems.length === 0 && (
          <div className="text-center py-16 space-y-6">
            <div className="w-24 h-24 bg-gradient-to-br from-rose-100 to-purple-100 rounded-full flex items-center justify-center mx-auto">
              <Heart className="h-12 w-12 text-rose-400" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-semibold text-gray-700">Your wishlist is empty</h3>
              <p className="text-gray-500 max-w-md mx-auto">
                Start adding products to your wishlist by clicking the heart icon on products you love
              </p>
            </div>
            <div className="flex items-center justify-center space-x-2 text-rose-600">
              <ShoppingBag className="h-5 w-5" />
              <span className="text-sm font-medium">Browse our collection to find items you'll love</span>
            </div>
          </div>
        )}

        {/* Products Grid */}
        {!isLoading && products.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={() => handleAddToCart(product.id)}
              />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default WishlistPage;
