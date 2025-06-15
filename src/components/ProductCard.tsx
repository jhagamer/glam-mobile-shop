
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, Heart } from 'lucide-react';
import { formatPrice } from '@/utils/currency';
import { ImageZoom } from '@/components/ui/image-zoom';
import { useWishlist } from '@/hooks/useWishlist';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  stock?: number;
}

interface ProductCardProps {
  product: Product;
  onAddToCart: () => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart }) => {
  const { toggleWishlist, isInWishlist } = useWishlist();
  const isOutOfStock = product.stock !== undefined && product.stock <= 0;
  const isLowStock = product.stock !== undefined && product.stock > 0 && product.stock <= 5;
  const inWishlist = isInWishlist(product.id);

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleWishlist(product.id);
  };

  return (
    <Card className="group overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 bg-white/80 backdrop-blur-sm">
      <div className="relative overflow-hidden">
        <div className="aspect-square bg-gradient-to-br from-rose-100 to-purple-100 flex items-center justify-center">
          {product.image_url ? (
            <ImageZoom
              src={product.image_url}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            />
          ) : (
            <div className="text-6xl">💄</div>
          )}
        </div>
        
        {/* Stock status badge */}
        {isOutOfStock && (
          <div className="absolute top-2 left-2">
            <Badge variant="destructive">Out of Stock</Badge>
          </div>
        )}
        {isLowStock && (
          <div className="absolute top-2 left-2">
            <Badge className="bg-yellow-500 hover:bg-yellow-600">Low Stock</Badge>
          </div>
        )}
        
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 bg-white/80 hover:bg-white"
            onClick={handleWishlistClick}
          >
            <Heart className={`h-4 w-4 ${inWishlist ? 'text-rose-500 fill-rose-500' : 'text-rose-500'}`} />
          </Button>
        </div>
      </div>
      
      <CardContent className="p-4 space-y-3">
        <div>
          <h3 className="font-semibold text-gray-900 group-hover:text-rose-600 transition-colors duration-300">
            {product.name}
          </h3>
          <p className="text-sm text-gray-600 line-clamp-2 mt-1">
            {product.description}
          </p>
        </div>
        
        <div className="flex items-center justify-between">
          <Badge className="bg-gradient-to-r from-rose-500 to-purple-600 text-white border-0">
            {formatPrice(product.price)}
          </Badge>
          
          <Button
            onClick={onAddToCart}
            size="sm"
            disabled={isOutOfStock}
            className="bg-gradient-to-r from-rose-500 to-purple-600 hover:from-rose-600 hover:to-purple-700 text-white border-0 shadow-md hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ShoppingCart className="h-4 w-4 mr-1" />
            {isOutOfStock ? 'Out of Stock' : 'Add'}
          </Button>
        </div>
        
        {/* Stock count for available items */}
        {product.stock !== undefined && product.stock > 0 && (
          <div className="text-xs text-gray-500 text-center">
            {product.stock} in stock
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProductCard;
