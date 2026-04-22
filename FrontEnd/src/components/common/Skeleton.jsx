import React from 'react';

export const Skeleton = ({ className, ...props }) => {
  return (
    <div
      className={`animate-pulse bg-surface-variant/40 rounded-xl ${className}`}
      {...props}
    />
  );
};

export const SkeletonCard = () => {
  return (
    <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-6 shadow-sm w-full flex flex-col sm:flex-row items-center justify-between gap-6 border border-white/40">
      <div className="flex items-center gap-4 w-full">
        <Skeleton className="w-20 h-20 rounded-xl shrink-0" />
        <div className="w-full flex flex-col gap-3">
          <Skeleton className="h-6 w-3/4 max-w-[200px]" />
          <div className="flex gap-2">
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-5 w-16" />
          </div>
        </div>
      </div>
      <Skeleton className="h-12 w-full sm:w-32 rounded-full shrink-0" />
    </div>
  );
};
