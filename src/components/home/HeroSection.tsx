
import React from 'react';

const HeroSection: React.FC = () => {
  return (
    <div className="text-center space-y-4">
      <h1 className="text-4xl font-bold bg-gradient-to-r from-rose-600 to-purple-600 bg-clip-text text-transparent">
        Discover Your Perfect Beauty
      </h1>
      <p className="text-lg text-gray-600 max-w-2xl mx-auto">
        Explore our curated collection of premium cosmetics and luxury beauty products
      </p>
    </div>
  );
};

export default HeroSection;
