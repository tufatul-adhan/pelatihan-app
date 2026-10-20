import React from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';

export type SortDirection = 'asc' | 'desc' | null;

export interface Column<T extends object> {
  key: keyof T;
  label: string;
  render?: (value: T[keyof T], row: T) => React.ReactNode;
  width?: string;
  sortable?: boolean;
}

interface TableProps<T extends object> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (row: T, index: number) => string | number;
  onSort?: (key: keyof T, direction: SortDirection) => void;
  sortKey?: keyof T;
  sortDirection?: SortDirection;
  isLoading?: boolean;
  isEmpty?: boolean;
  emptyMessage?: string;
  onRowClick?: (row: T) => void;
  rowClassName?: (row: T) => string;
}

type TableComponent = <T extends object>(
  props: TableProps<T> & React.RefAttributes<HTMLTableElement>
) => React.ReactElement | null;

const TableInner = <T extends object>(
  {
    columns,
    data,
    keyExtractor,
    onSort,
    sortKey,
    sortDirection,
    isEmpty = false,
    emptyMessage = 'Tidak ada data',
    onRowClick,
    rowClassName,
  }: TableProps<T>,
  ref: React.ForwardedRef<HTMLTableElement>
) => {
    const handleSort = (key: keyof T) => {
      if (!onSort) return;

      let newDirection: SortDirection = 'asc';
      if (sortKey === key) {
        if (sortDirection === 'asc') newDirection = 'desc';
        else if (sortDirection === 'desc') newDirection = null;
      }

      onSort(key, newDirection);
    };

    const SortIcon = ({ columnKey }: { columnKey: keyof T }) => {
      if (sortKey !== columnKey) {
        return <span className="theme-sort-icon-slot" />;
      }

      return sortDirection === 'asc' ? (
        <ChevronUp size={16} />
      ) : (
        <ChevronDown size={16} />
      );
    };

    if (isEmpty) {
      return (
        <div className="surface-card text-center py-5">
          <p className="text-muted fw-medium">{emptyMessage}</p>
        </div>
      );
    }

    return (
      <div className="table-responsive rounded-3 border border-light overflow-hidden">
        <table ref={ref} className="table table-hover mb-0">
          <thead className="table-light">
            <tr>
              {columns.map((column) => (
                <th
                  key={`${String(column.key)}-${column.label}`}
                  className={`px-3 py-3 text-uppercase small fw-semibold ${
                    column.sortable ? 'cursor-pointer user-select-none' : ''
                  }`}
                  onClick={() => column.sortable && handleSort(column.key)}
                  style={{ width: column.width }}
                >
                  <div className="d-flex align-items-center gap-2">
                    <span>{column.label}</span>
                    {column.sortable && <SortIcon columnKey={column.key} />}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="table-group-divider">
            {data.map((row, index) => (
              <tr
                key={keyExtractor(row, index)}
                onClick={() => onRowClick?.(row)}
                className={`${
                  onRowClick ? 'theme-row-clickable' : ''
                } ${rowClassName?.(row) || ''}`}
              >
                {columns.map((column) => (
                  <td
                    key={String(column.key)}
                    className="px-3 py-3 small"
                  >
                    {column.render
                      ? column.render(row[column.key], row)
                      : String(row[column.key] ?? '-')}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
};

const ForwardedTable = React.forwardRef(TableInner);
ForwardedTable.displayName = 'Table';

export const Table = ForwardedTable as TableComponent;
