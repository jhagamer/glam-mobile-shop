import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Product, Category, Order, User } from '@/types/admin';
import { toast } from '@/hooks/use-toast';

export const useAdminData = (userRole: string) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);

  const fetchProducts = async () => {
    try {
      setIsLoadingProducts(true);
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          categories (name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast({
        title: "Error",
        description: "Failed to load products",
        variant: "destructive"
      });
    } finally {
      setIsLoadingProducts(false);
    }
  };

  const fetchCategories = async () => {
    try {
      setIsLoadingCategories(true);
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast({
        title: "Error",
        description: "Failed to load categories",
        variant: "destructive"
      });
    } finally {
      setIsLoadingCategories(false);
    }
  };

  const createCategory = async (name: string) => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .insert([{ name: name.trim() }])
        .select()
        .single();

      if (error) throw error;
      
      toast({ title: "Success", description: "Category created successfully" });
      await fetchCategories();
      return data;
    } catch (error: any) {
      console.error('Error creating category:', error);
      toast({
        title: "Error",
        description: error?.message || "Failed to create category",
        variant: "destructive"
      });
      throw error;
    }
  };

  const fetchOrders = async () => {
    try {
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (ordersError) throw ordersError;

      // Optimize: Fetch all profiles at once instead of one by one
      const userIds = [...new Set((ordersData || []).map(order => order.user_id))];
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id, email')
        .in('id', userIds);

      const profileMap = new Map(profilesData?.map(profile => [profile.id, profile.email]) || []);

      const ordersWithEmails = (ordersData || []).map(order => ({
        ...order,
        user_email: profileMap.get(order.user_id) || 'Unknown'
      }));

      setOrders(ordersWithEmails);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      // Optimize: Fetch all user roles at once
      const userIds = (profilesData || []).map(profile => profile.id);
      const { data: rolesData } = await supabase
        .from('user_roles')
        .select('user_id, role')
        .in('user_id', userIds);

      const rolesMap = new Map<string, string[]>();
      rolesData?.forEach(roleData => {
        if (!rolesMap.has(roleData.user_id)) {
          rolesMap.set(roleData.user_id, []);
        }
        rolesMap.get(roleData.user_id)?.push(roleData.role);
      });

      const usersWithRoles = (profilesData || []).map(profile => ({
        id: profile.id,
        email: profile.email || 'No email',
        created_at: profile.created_at,
        roles: rolesMap.get(profile.id) || []
      }));

      setUsers(usersWithRoles);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', orderId);

      if (error) throw error;
      toast({ title: "Success", description: "Order status updated" });
      fetchOrders();
    } catch (error) {
      console.error('Error updating order:', error);
      toast({
        title: "Error",
        description: "Failed to update order status",
        variant: "destructive"
      });
    }
  };

  const promoteToAdmin = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('user_roles')
        .insert([{ user_id: userId, role: 'admin' }]);

      if (error) throw error;
      toast({ title: "Success", description: "User promoted to admin" });
      fetchUsers();
    } catch (error) {
      console.error('Error promoting user:', error);
      toast({
        title: "Error",
        description: "Failed to promote user",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    if (userRole === 'admin') {
      fetchOrders();
      fetchUsers();
    }
  }, [userRole]);

  return {
    products,
    categories,
    orders,
    users,
    isLoadingProducts,
    isLoadingCategories,
    fetchProducts,
    fetchCategories,
    fetchOrders,
    fetchUsers,
    updateOrderStatus,
    promoteToAdmin,
    createCategory
  };
};
