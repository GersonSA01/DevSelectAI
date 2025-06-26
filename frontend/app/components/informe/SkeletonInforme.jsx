export default function SkeletonInforme() {
  return (
    <div className="space-y-6 animate-pulse px-4 sm:px-6 md:px-8 py-6">
      <div className="h-10 w-32 bg-gray-700 rounded" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="h-24 bg-gray-700 rounded" />
        <div className="h-24 bg-gray-700 rounded" />
        <div className="h-24 bg-gray-700 rounded" />
      </div>
      <div className="h-6 w-40 bg-gray-700 rounded" />
      <div className="h-64 bg-gray-700 rounded" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="h-32 bg-gray-700 rounded" />
        <div className="h-32 bg-gray-700 rounded" />
      </div>
      <div className="h-24 bg-gray-700 rounded" />
    </div>
  );
}
