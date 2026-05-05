"use client";

interface ComparisonTableProps {
  rows: {
    label: string;
    base: string;
    alternative: string;
    better?: "base" | "alternative";
  }[];
}

export function ComparisonTable({ rows }: ComparisonTableProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-50 text-left">
            <th className="px-4 py-3 font-semibold text-gray-600 w-1/3">Metric</th>
            <th className="px-4 py-3 font-semibold text-gray-600">Your Plan</th>
            <th className="px-4 py-3 font-semibold text-gray-600">Alternative</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-t border-gray-100">
              <td className="px-4 py-3 text-gray-700 font-medium">{row.label}</td>
              <td className={`px-4 py-3 ${row.better === "alternative" ? "text-gray-500" : "text-gray-900 font-semibold"}`}>
                {row.base}
              </td>
              <td className={`px-4 py-3 ${row.better === "alternative" ? "text-green-600 font-semibold" : "text-gray-900"}`}>
                {row.alternative}
                {row.better === "alternative" && (
                  <span className="ml-2 text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded">Better</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
