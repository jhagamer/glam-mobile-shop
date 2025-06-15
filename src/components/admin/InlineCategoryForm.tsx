
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, X } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface InlineCategoryFormProps {
  onCategoryCreated: (category: { id: string; name: string }) => void;
  onCancel: () => void;
}

export const InlineCategoryForm: React.FC<InlineCategoryFormProps> = ({
  onCategoryCreated,
  onCancel
}) => {
  const [categoryName, setCategoryName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!categoryName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a category name",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      const { supabase } = await import('@/integrations/supabase/client');
      const { data, error } = await supabase
        .from('categories')
        .insert([{ name: categoryName.trim() }])
        .select()
        .single();

      if (error) throw error;
      
      toast({ title: "Success", description: "Category created successfully" });
      onCategoryCreated(data);
      setCategoryName('');
    } catch (error: any) {
      console.error('Error creating category:', error);
      toast({
        title: "Error",
        description: error?.message || "Failed to create category",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 p-3 border rounded-lg bg-gray-50">
      <div className="flex items-center justify-between">
        <Label htmlFor="new-category">Quick Add Category</Label>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onCancel}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      <div className="flex space-x-2">
        <Input
          id="new-category"
          value={categoryName}
          onChange={(e) => setCategoryName(e.target.value)}
          placeholder="Enter category name"
          required
          disabled={isSubmitting}
          className="flex-1"
        />
        <Button type="submit" disabled={isSubmitting} size="sm">
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </form>
  );
};
