
import React from 'react';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ value, onChange }) => {
  return (
    <div className="relative max-w-md mx-auto">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
      <Input
        type="text"
        placeholder="Search for products..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pl-10 pr-4 py-2 w-full rounded-full border-rose-200 focus:border-rose-500 focus:ring-rose-500 bg-white/80 backdrop-blur-sm"
      />
    </div>
  );
};

export default SearchBar;
