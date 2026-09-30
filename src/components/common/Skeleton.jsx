import React from 'react';

export const CardSkeleton = () => (
  <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5 space-y-4 animate-pulse">
    <div className="flex justify-between items-center">
      <div className="h-6 w-24 bg-slate-800 rounded-md"></div>
      <div className="h-5 w-16 bg-slate-800 rounded-full"></div>
    </div>
    <div className="h-4 w-3/4 bg-slate-800 rounded-md"></div>
    <div className="flex justify-between items-center border-t border-slate-800 pt-3">
      <div className="h-6 w-20 bg-slate-800 rounded-md"></div>
      <div className="h-8 w-28 bg-slate-800 rounded-xl"></div>
    </div>
  </div>
);

export const TableRowSkeleton = () => (
  <tr className="animate-pulse border-b border-slate-800">
    <td className="p-3.5"><div className="h-4 w-20 bg-slate-800 rounded-md"></div></td>
    <td className="p-3.5"><div className="h-4 w-32 bg-slate-800 rounded-md"></div></td>
    <td className="p-3.5"><div className="h-4 w-16 bg-slate-800 rounded-md"></div></td>
    <td className="p-3.5"><div className="h-4 w-14 bg-slate-800 rounded-md"></div></td>
    <td className="p-3.5"><div className="h-5 w-20 bg-slate-800 rounded-full"></div></td>
  </tr>
);

export const Spinner = ({ size = 'md', className = '' }) => {
  const sizes = {
    sm: 'w-4 h-4 border-2',
    md: 'w-6 h-6 border-2',
    lg: 'w-8 h-8 border-3',
    xl: 'w-12 h-12 border-4'
  };
  return (
    <div className={`inline-block animate-spin rounded-full border-solid border-indigo-500 border-r-transparent ${sizes[size]} ${className}`} role="status">
      <span className="sr-only">Loading...</span>
    </div>
  );
};
