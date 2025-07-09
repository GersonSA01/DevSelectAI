export default function SkeletonVacantes() {
  return (
    <div className="min-h-screen bg-[#0b1120] text-white p-6">
      <h1 className="text-3xl font-bold text-center mb-2 animate-pulse">
        {/* Título en carga */}
      </h1>
      <p className="text-center text-gray-400 mb-6 animate-pulse">
        {/* Descripción en carga */}
      </p>

      <div className="flex justify-end mb-4">
        <div className="h-10 w-36 bg-slate-700 rounded animate-pulse"></div>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="h-4 w-40 bg-slate-700 rounded animate-pulse"></div>
        <div className="h-10 w-64 bg-slate-700 rounded animate-pulse"></div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-700">
          <thead className="bg-[#1e293b]">
            <tr>
              {Array.from({ length: 7 }).map((_, idx) => (
                <th
                  key={idx}
                  className="px-4 py-3"
                >
                  <div className="h-4 bg-slate-700 rounded w-full animate-pulse"></div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-[#0f172a] divide-y divide-gray-800">
            {[...Array(3)].map((_, idx) => (
              <tr key={idx} className="animate-pulse">
                {Array.from({ length: 7 }).map((_, tdIdx) => (
                  <td
                    key={tdIdx}
                    className="px-4 py-4"
                  >
                    <div className="h-4 bg-slate-700 rounded w-full"></div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
