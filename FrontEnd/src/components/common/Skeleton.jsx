import { motion } from 'framer-motion';

export const Skeleton = ({ className = '', height = '1rem', width = '100%', borderRadius = '0.5rem' }) => {
  return (
    <div 
      className={`relative overflow-hidden bg-surface-container-low ${className}`}
      style={{ height, width, borderRadius }}
    >
      <div className="absolute inset-0 shimmer" />
    </div>
  );
};

export const CardSkeleton = () => {
  return (
    <div className="bg-surface-container-lowest/70 backdrop-blur-3xl rounded-[2.5rem] p-5 shadow-sm border border-white/40 h-full flex flex-col">
      <Skeleton height="14rem" borderRadius="1.5rem" className="mb-6" />
      <div className="space-y-4 px-1">
        <div className="flex justify-between items-start">
          <div className="space-y-2 flex-grow">
            <Skeleton height="1.75rem" width="70%" />
            <Skeleton height="1rem" width="40%" />
          </div>
        </div>
        <div className="space-y-2 mt-4">
          <Skeleton height="0.875rem" width="100%" />
          <Skeleton height="0.875rem" width="90%" />
        </div>
        <div className="flex items-center justify-between pt-6 border-t border-outline-variant/10 mt-auto">
          <div className="space-y-2">
            <Skeleton height="0.75rem" width="3rem" />
            <Skeleton height="1.5rem" width="5rem" />
          </div>
          <Skeleton height="3rem" width="3rem" borderRadius="1rem" />
        </div>
      </div>
    </div>
  );
};

export default Skeleton;
