export const SkeletonLoader = () => {
  return (
    <div
      data-testid="skeleton-loader"
      className="animate-pulse rounded-xl border border-line bg-surface p-5 w-full mx-auto"
    >
      <div className="h-5 bg-surface-2 rounded min-w-[200px] w-1/3 mb-3"></div>
      <div className="h-4 bg-surface-2 rounded w-2/3 mb-2"></div>
      <div className="h-4 bg-surface-2 rounded w-1/2"></div>
    </div>
  );
};
