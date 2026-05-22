import * as React from "react";
import { cn } from "../../lib/cn";

export type DataTableColumn<T> = {
  key: string;
  header: string;
  cell: (row: T) => React.ReactNode;
};

export function DataTable<T>({
  columns,
  data,
  emptyMessage = "Nenhum registro encontrado."
}: {
  columns: DataTableColumn<T>[];
  data: T[];
  emptyMessage?: string;
}) {
  return (
    <div className="overflow-x-auto rounded-lg border border-border bg-card">
      <table className="w-full min-w-[680px] border-collapse text-sm">
        <thead className="bg-muted text-muted-foreground">
          <tr>
            {columns.map((column) => (
              <th key={column.key} className="px-4 py-3 text-left font-semibold">
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td className="px-4 py-8 text-center text-muted-foreground" colSpan={columns.length}>
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                className={cn("border-t border-border", rowIndex % 2 === 1 && "bg-muted/35")}
              >
                {columns.map((column) => (
                  <td key={column.key} className="px-4 py-3">
                    {column.cell(row)}
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
