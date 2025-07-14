export default function SkeletonSidebar({ isCollapsed }) {
  return (
    <div className={`h-screen bg-[#0f172a] text-white fixed top-16 left-0 z-40 ${isCollapsed ? 'w-16' : 'w-64'} border-r border-neutral-700 transition-all`}>
      <div className="p-4 flex items-center justify-between">
        {!isCollapsed && (
          <div className="space-y-1">
            <div className="h-4 bg-gray-700 rounded w-32" />
            <div className="h-3 bg-cyan-400 rounded w-16" />
          </div>
        )}
        <div className="ml-auto">
          <div className="w-5 h-5 bg-gray-600 rounded-full" />
        </div>
      </div>

      <nav className="px-2 space-y-3 mt-2">
        
        <div className="flex items-center gap-2 px-3">
          <div className="w-4 h-4 bg-gray-600 rounded-full" />
          {!isCollapsed && <div className="h-4 w-20 bg-gray-700 rounded" />}
        </div>
        {!isCollapsed && (
          <div className="ml-7 space-y-2">
            <div className="h-3 bg-gray-700 rounded w-48" />
            <div className="h-3 bg-gray-700 rounded w-40" />
          </div>
        )}

        
        <div className="flex items-center gap-2 px-3">
          <div className="w-4 h-4 bg-gray-600 rounded-full" />
          {!isCollapsed && <div className="h-4 w-24 bg-gray-700 rounded" />}
        </div>

        
        <div className="flex items-center gap-2 px-3">
          <div className="w-4 h-4 bg-gray-600 rounded-full" />
          {!isCollapsed && <div className="h-4 w-28 bg-gray-700 rounded" />}
        </div>

        
        <div className="flex items-center gap-2 px-3 mt-6">
          <div className="w-4 h-4 bg-red-700 rounded-full" />
          {!isCollapsed && <div className="h-4 w-32 bg-red-800 rounded" />}
        </div>
      </nav>
    </div>
  );
}
