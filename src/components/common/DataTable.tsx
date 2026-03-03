import React from 'react';

interface Column<T> {
  key: string;
  header: string;
  render?: (row: T) => React.ReactNode;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  onRowClick?: (row: T) => void;
}

function DataTable<T extends Record<string, any>>({ data, columns, onRowClick }: DataTableProps<T>) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full">
        <thead>
          <tr className="border-b border-gray-100">
            {columns.map((column) => (
              <th
                key={column.key}
                className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wide"
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white">
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-6 py-12 text-center text-gray-400 text-sm">
                No data available
              </td>
            </tr>
          ) : (
            data.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                onClick={() => onRowClick?.(row)}
                className={`border-b border-gray-50 ${onRowClick ? 'hover:bg-gray-50 cursor-pointer transition-colors duration-150' : ''}`}
              >
                {columns.map((column) => (
                  <td key={column.key} className="px-6 py-4 text-sm text-[#2F2E41]">
                    {column.render ? column.render(row) : row[column.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default DataTable;