import { cn } from "@/lib/cn";

export interface Column<T> {
  header: string;
  cell: (row: T) => React.ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  selectedKey?: string;
  onRowClick?: (row: T) => void;
  empty?: string;
  className?: string;
}

export function DataTable<T>({ columns, rows, rowKey, selectedKey, onRowClick, empty = "Nothing to show", className }: DataTableProps<T>) {
  return (
    <div className={cn("min-h-0 overflow-auto", className)}>
      <table className="w-full border-collapse text-[13px]">
        <thead>
          <tr>
            {columns.map((c) => (
              <th key={c.header} className="sticky top-0 bg-head px-2 py-2 text-left text-xs font-medium whitespace-nowrap text-muted">
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const key = rowKey(row);
            return (
              <tr
                key={key}
                tabIndex={onRowClick ? 0 : undefined}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                onKeyDown={onRowClick ? (e) => e.key === "Enter" && onRowClick(row) : undefined}
                className={cn(
                  onRowClick && "cursor-pointer hover:[&>td]:bg-hover focus-visible:outline-2 focus-visible:outline-brand",
                  key === selectedKey && "[&>td]:bg-canvas"
                )}
              >
                {columns.map((c) => (
                  <td key={c.header} className={cn("border-b border-line px-2 py-2 align-middle", c.className)}>
                    {c.cell(row)}
                  </td>
                ))}
              </tr>
            );
          })}
          {rows.length === 0 && (
            <tr>
              <td colSpan={columns.length} className="px-2 py-6 text-center text-muted">
                {empty}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

/** Two-line table cell: bold-ish primary text with a muted second line. */
export function CellStack({ primary, secondary }: { primary: React.ReactNode; secondary?: React.ReactNode }) {
  return (
    <>
      <span className="block">{primary}</span>
      {secondary && <small className="block text-xs text-muted">{secondary}</small>}
    </>
  );
}
