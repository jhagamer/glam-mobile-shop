
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, Heart } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
}

interface ProductCardProps {
  product: Product;
  onAddToCart: () => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart }) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  return (
    <Card className="group overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 bg-white/80 backdrop-blur-sm">
      <div className="relative overflow-hidden">
        <div className="aspect-square bg-gradient-to-br from-rose-100 to-purple-100 flex items-center justify-center">
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            />
          ) : (
            <div className="text-6xl">💄</div>
          )}
        </div>
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 bg-white/80 hover:bg-white"
          >
            <Heart className="h-4 w-4 text-rose-500" />
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
            className="bg-gradient-to-r from-rose-500 to-purple-600 hover:from-rose-600 hover:to-purple-700 text-white border-0 shadow-md hover:shadow-lg transition-all duration-300"
          >
            <ShoppingCart className="h-4 w-4 mr-1" />
            Add
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductCard;
