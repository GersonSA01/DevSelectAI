export default function PreguntasVacanteSkeleton() {
  return (
    <div className="min-h-screen bg-[#0b1120] text-white px-4 py-8">
      <div className="rounded-lg shadow-lg p-12 animate-pulse space-y-6">
        
        <div className="space-y-2">
          <div className="h-8 bg-gray-700 rounded w-1/3"></div>
          <div className="h-5 bg-gray-800 rounded w-1/4"></div>
          <div className="h-4 bg-gray-800 rounded w-1/6"></div>
        </div>

        
        <div className="space-y-2">
          <div className="h-4 bg-gray-700 rounded w-1/6"></div>
          <div className="flex gap-2">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="h-6 w-16 bg-gray-700 rounded"
              ></div>
            ))}
          </div>
        </div>

        
        <div className="flex justify-end items-center mb-6 gap-4 flex-wrap">
          <div className="h-8 w-48 bg-gray-700 rounded"></div>
          <div className="h-8 w-32 bg-gray-700 rounded"></div>
          <div className="h-8 w-40 bg-gray-700 rounded"></div>
        </div>

        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(4)].map((_, idx) => (
            <div
              key={idx}
              className="border border-gray-700 bg-[#111827] rounded-lg px-4 py-4 space-y-3"
            >
              <div className="h-5 bg-gray-700 rounded w-2/3"></div>
              <div className="space-y-1">
                <div className="h-4 bg-gray-800 rounded w-1/4"></div>
                <div className="h-4 bg-gray-800 rounded w-full"></div>
                <div className="h-4 bg-gray-800 rounded w-5/6"></div>
              </div>
              <div className="flex justify-end gap-2">
                <div className="h-6 w-12 bg-gray-700 rounded"></div>
                <div className="h-6 w-12 bg-gray-700 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
