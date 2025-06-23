export default function SkeletonLoader() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Skeleton del encabezado */}
      <div className="sticky top-20 bg-[#0A0A23] py-4 z-10 border-b border-[#3BDCF6] shadow-md rounded-md px-4">
        <div className="flex justify-between items-center">
          <div>
            <div className="h-6 bg-gray-700 rounded w-32 mb-2"></div>
            <div className="h-4 bg-gray-700 rounded w-48"></div>
          </div>
          <div className="bg-[#1D1E33] px-6 py-4 rounded-lg shadow">
            <div className="h-4 bg-gray-700 rounded w-24 mb-2"></div>
            <div className="h-8 bg-gray-500 rounded w-20"></div>
          </div>
        </div>
      </div>

      {/* Skeleton del primer módulo */}
      <div className="bg-[#1D1E33] rounded-lg p-6 space-y-4">
        <div className="h-5 bg-gray-600 rounded w-56" />
        <div className="space-y-2">
          <div className="h-4 bg-gray-700 rounded w-3/4" />
          <div className="h-4 bg-gray-800 rounded w-1/2" />
        </div>
        <div className="space-y-2">
          <div className="h-4 bg-gray-700 rounded w-4/5" />
          <div className="h-4 bg-gray-800 rounded w-2/3" />
        </div>
        <div className="space-y-2">
          <div className="h-4 bg-gray-700 rounded w-3/4" />
          <div className="h-4 bg-gray-800 rounded w-1/2" />
        </div>
        <div className="h-4 bg-gray-600 rounded w-1/3 mt-4" />
        <div className="h-4 bg-gray-700 rounded w-full" />
        <div className="h-4 bg-gray-700 rounded w-5/6" />
      </div>
    </div>
  );
}
