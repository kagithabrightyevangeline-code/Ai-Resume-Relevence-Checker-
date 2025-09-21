import React from 'react';
import { DocumentIcon } from './icons/DocumentIcon';

export const Header: React.FC = () => {
  return (
    <header className="bg-gray-800/30 backdrop-blur-sm border-b border-gray-700 sticky top-0 z-10">
      <div className="container mx-auto px-4 py-4 flex items-center">
        <DocumentIcon className="h-8 w-8 text-indigo-400" />
        <h1 className="ml-3 text-2xl font-bold text-white tracking-tight">
          AI Resume Relevance Checker
        </h1>
        <span className="ml-4 bg-indigo-500/20 text-indigo-300 text-xs font-semibold px-2.5 py-0.5 rounded-full">
          Powered by Gemini
        </span>
      </div>
    </header>
  );
};
