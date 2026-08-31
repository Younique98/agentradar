export const SkeletonLoader = () => {
  return (
    <div
      data-testid="skeleton-loader"
      className="animate-pulse border rounded-md p-4 shadow-md bg-gray-200 w-full mx-auto"
    >
      <div className="h-6 bg-gray-300 rounded min-w-[300px] w-1/3 mb-2 md:w-[600px]"></div>
      <div className="h-4 bg-gray-300 rounded min-w-[300px] w-2/3 mb-2 md:w-[600px]"></div>
      <div className="h-4 bg-gray-300 rounded min-w-[300px] w-1/2 md:w-[600px]"></div>
    </div>
  );
};
