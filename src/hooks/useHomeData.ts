
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  category_id: string;
  stock: number;
}

interface Category {
  id: string;
  name: string;
}

export const useHomeData = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [cartItemCount, setCartItemCount] = useState(0);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categoriesError, setCategoriesError] = useState(false);
  
  // New pagination and filtering state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [filters, setFilters] = useState({
    minPrice: 0,
    maxPrice: 10000,
    stockStatus: 'all' as 'all' | 'in_stock' | 'low_stock' | 'out_of_stock',
    sortBy: 'newest' as 'name' | 'price_asc' | 'price_desc' | 'newest'
  });

  const ITEMS_PER_PAGE = 12;

  const fetchCategories = async () => {
    try {
      setCategoriesLoading(true);
      setCategoriesError(false);
      
      console.log('Fetching categories...');
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (error) {
        console.error('Categories error:', error);
        throw error;
      }
      
      console.log('Categories loaded successfully:', data?.length || 0);
      setCategories(data || []);
    } catch (error: any) {
      console.error('Error fetching categories:', error);
      setCategoriesError(true);
      toast({
        title: "Error Loading Categories",
        description: `Failed to load categories: ${error.message || 'Unknown error'}`,
        variant: "destructive"
      });
    } finally {
      setCategoriesLoading(false);
    }
  };

  const fetchProducts = async (page = 1) => {
    try {
      setLoading(true);
      console.log('Fetching products...');
      
      let query = supabase
        .from('products')
        .select('*', { count: 'exact' })
        .eq('is_active', true);

      // Apply category filter
      if (selectedCategory !== 'all') {
        query = query.eq('category_id', selectedCategory);
      }

      // Apply search filter
      if (searchQuery.trim()) {
        query = query.or(`name.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
      }

      // Apply price filters
      query = query.gte('price', filters.minPrice).lte('price', filters.maxPrice);

      // Apply stock status filter
      switch (filters.stockStatus) {
        case 'in_stock':
          query = query.gt('stock', 5);
          break;
        case 'low_stock':
          query = query.gt('stock', 0).lte('stock', 5);
          break;
        case 'out_of_stock':
          query = query.eq('stock', 0);
          break;
      }

      // Apply sorting
      switch (filters.sortBy) {
        case 'name':
          query = query.order('name');
          break;
        case 'price_asc':
          query = query.order('price', { ascending: true });
          break;
        case 'price_desc':
          query = query.order('price', { ascending: false });
          break;
        case 'newest':
        default:
          query = query.order('created_at', { ascending: false });
          break;
      }

      // Apply pagination
      const from = (page - 1) * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) {
        console.error('Products error:', error);
        throw error;
      }
      
      console.log('Products loaded successfully:', data?.length || 0);
      setProducts(data || []);
      setTotalCount(count || 0);
      setTotalPages(Math.ceil((count || 0) / ITEMS_PER_PAGE));
      setCurrentPage(page);
    } catch (error: any) {
      console.error('Error fetching products:', error);
      setProducts([]);
      toast({
        title: "Error Loading Products",
        description: `Failed to load products: ${error.message || 'Unknown error'}`,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchCartItemCount = async () => {
    if (!user) {
      setCartItemCount(0);
      return;
    }

    try {
      console.log('Fetching cart count for user:', user.email);
      const { data, error } = await supabase
        .from('cart_items')
        .select('quantity')
        .eq('user_id', user.id);

      if (error) {
        console.error('Error fetching cart count:', error);
        throw error;
      }

      const totalCount = data?.reduce((sum, item) => sum + item.quantity, 0) || 0;
      console.log('Cart count fetched successfully:', totalCount);
      setCartItemCount(totalCount);
    } catch (error: any) {
      console.error('Error fetching cart count:', error);
      setCartItemCount(0);
    }
  };

  const handleAddToCart = async (productId: string) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to add items to cart",
        variant: "destructive"
      });
      return;
    }

    try {
      // Check if item already exists in cart
      const { data: existingItem } = await supabase
        .from('cart_items')
        .select('*')
        .eq('user_id', user.id)
        .eq('product_id', productId)
        .single();

      if (existingItem) {
        // Update quantity
        const { error } = await supabase
          .from('cart_items')
          .update({ quantity: existingItem.quantity + 1 })
          .eq('id', existingItem.id);

        if (error) throw error;
      } else {
        // Insert new item
        const { error } = await supabase
          .from('cart_items')
          .insert([{
            user_id: user.id,
            product_id: productId,
            quantity: 1
          }]);

        if (error) throw error;
      }

      await fetchCartItemCount();
      toast({
        title: "Success",
        description: "Item added to cart",
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

  const handlePageChange = (page: number) => {
    fetchProducts(page);
  };

  const handleFiltersChange = (newFilters: typeof filters) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters({
      minPrice: 0,
      maxPrice: 10000,
      stockStatus: 'all',
      sortBy: 'newest'
    });
    setCurrentPage(1);
  };

  // Separate initialization effect
  useEffect(() => {
    const initializeData = async () => {
      console.log('Initializing data...');
      // Always load categories first
      await fetchCategories();
      // Then load products
      await fetchProducts();
    };
    
    initializeData();
  }, []); // Only run on mount

  // Separate effect for cart count when user changes
  useEffect(() => {
    if (user) {
      console.log('User changed, fetching cart count...');
      fetchCartItemCount();
    } else {
      setCartItemCount(0);
    }
  }, [user]);

  // Separate effect for products when filters change
  useEffect(() => {
    console.log('Filters changed, fetching products...');
    fetchProducts(1);
  }, [selectedCategory, searchQuery, filters]);

  return {
    products,
    categories,
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
    loading,
    cartItemCount,
    categoriesLoading,
    categoriesError,
    fetchCategories,
    handleAddToCart,
    fetchProducts,
    // New pagination and filtering returns
    currentPage,
    totalPages,
    totalCount,
    handlePageChange,
    filters,
    handleFiltersChange,
    clearFilters,
  };
};
