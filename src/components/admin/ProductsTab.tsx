
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, Plus, Loader2 } from 'lucide-react';
import { Product, Category } from '@/types/admin';
import { ProductDialog } from './ProductDialog';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { formatPrice } from '@/utils/currency';

interface ProductsTabProps {
  products: Product[];
  categories: Category[];
  onRefreshProducts: () => void;
  isLoading?: boolean;
}

export const ProductsTab: React.FC<ProductsTabProps> = ({
  products,
  categories,
  onRefreshProducts,
  isLoading = false
}) => {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
  const [deleteProductId, setDeleteProductId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteProduct = async (productId: string) => {
    try {
      setIsDeleting(true);
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);

      if (error) throw error;
      toast({ title: "Success", description: "Product deleted successfully" });
      onRefreshProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      toast({
        title: "Error",
        description: "Failed to delete product",
        variant: "destructive"
      });
    } finally {
      setIsDeleting(false);
      setDeleteProductId(null);
    }
  };

  const openProductDialog = (product?: Product) => {
    setSelectedProduct(product || null);
    setIsProductDialogOpen(true);
  };

  const handleDialogClose = () => {
    setIsProductDialogOpen(false);
    setSelectedProduct(null);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-rose-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Products Management</h2>
        <Button onClick={() => openProductDialog()}>
          <Plus className="h-4 w-4 mr-2" />
          Add Product
        </Button>
      </div>

      {products.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No products found</h3>
            <p className="text-gray-500 mb-4">Start building your inventory by adding your first product</p>
            <Button onClick={() => openProductDialog()}>
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Product
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <Card key={product.id} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="aspect-square bg-gradient-to-br from-rose-100 to-purple-100 rounded-lg mb-4 flex items-center justify-center overflow-hidden">
                  {product.image_url ? (
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-full h-full object-cover rounded-lg"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '';
                        target.style.display = 'none';
                        const parent = target.parentElement as HTMLElement;
                        if (parent) {
                          parent.innerHTML = '<span className="text-4xl">📦</span>';
                        }
                      }}
                    />
                  ) : (
                    <span className="text-4xl">📦</span>
                  )}
                </div>
                
                <h3 className="font-semibold mb-2 line-clamp-1" title={product.name}>
                  {product.name}
                </h3>
                <p className="text-sm text-gray-600 mb-3 line-clamp-2" title={product.description}>
                  {product.description}
                </p>
                
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-rose-600">{formatPrice(product.price)}</span>
                    <Badge variant={product.is_active ? "default" : "secondary"}>
                      {product.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Stock:</span>
                    <Badge variant={product.stock > 0 ? "default" : "destructive"}>
                      {product.stock || 0} units
                    </Badge>
                  </div>
                  {product.categories && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Category:</span>
                      <span className="text-sm font-medium">{product.categories.name}</span>
                    </div>
                  )}
                </div>
                
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openProductDialog(product)}
                    className="flex-1"
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setDeleteProductId(product.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    disabled={isDeleting}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <ProductDialog
        isOpen={isProductDialogOpen}
        onClose={handleDialogClose}
        product={selectedProduct}
        categories={categories}
        onSuccess={onRefreshProducts}
      />

      <ConfirmationDialog
        isOpen={deleteProductId !== null}
        onClose={() => setDeleteProductId(null)}
        onConfirm={() => deleteProductId && handleDeleteProduct(deleteProductId)}
        title="Delete Product"
        description="Are you sure you want to delete this product? This action cannot be undone and will remove the product from all customer carts."
        confirmText="Delete Product"
        cancelText="Cancel"
        variant="destructive"
      />
    </div>
  );
};
