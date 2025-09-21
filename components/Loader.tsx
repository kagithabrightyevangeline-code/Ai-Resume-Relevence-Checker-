
import React from 'react';

export const Loader: React.FC = () => {
  return (
    <div className="relative h-24 w-24">
      <div className="absolute inset-0 border-4 border-indigo-500/30 rounded-full"></div>
      <div className="absolute inset-0 border-t-4 border-indigo-500 rounded-full animate-spin"></div>
    </div>
  );
};
