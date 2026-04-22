import React from 'react';

export interface TableColumn<T> {
  key: string;
  header: string;
  render?: (row: T) => React.ReactNode;
}

export interface TableProps<T extends Record<string, unknown>> {
  columns: TableColumn<T>[];
  data: T[];
  emptyMessage?: string;
  isLoading?: boolean;
}

export function Table<T extends Record<string, unknown>>({
  columns,
  data,
  emptyMessage = 'No records found.',
  isLoading = false,
}: TableProps<T>): JSX.Element {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-neutral-100">
            {columns.map((col) => (
              <th
                key={col.key}
                scope="col"
                className="px-4 py-3 text-left text-sm font-semibold text-neutral-600 uppercase tracking-wide"
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {isLoading ? (
            Array.from({ length: 3 }).map((_, rowIdx) => (
              <tr key={rowIdx} className="border-b border-neutral-200">
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-3">
                    <div className="animate-pulse bg-neutral-200 h-4 rounded-sm" />
                  </td>
                ))}
              </tr>
            ))
          ) : data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-4 py-8 text-center text-neutral-500"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, rowIdx) => (
              <tr
                key={rowIdx}
                className="border-b border-neutral-200 hover:bg-neutral-50 transition-colors duration-100"
              >
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-3 text-base text-neutral-700">
                    {col.render
                      ? col.render(row)
                      : String((row as Record<string, unknown>)[col.key] ?? '')}
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
