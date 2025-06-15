
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  category_id: string;
  is_active: boolean;
  stock: number;
  categories?: { name: string };
}

export interface Category {
  id: string;
  name: string;
}

export interface Order {
  id: string;
  status: string;
  total_amount: number;
  phone_number: string;
  created_at: string;
  user_id: string;
  user_email?: string;
}

export interface User {
  id: string;
  email: string;
  created_at: string;
  roles: string[];
}

export interface ProductForm {
  name: string;
  description: string;
  price: string;
  category_id: string;
  image_url: string;
  stock: string;
}
