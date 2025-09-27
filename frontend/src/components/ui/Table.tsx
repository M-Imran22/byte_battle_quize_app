import React from 'react';

interface TableProps {
  children: React.ReactNode;
  className?: string;
}

interface TableHeaderProps {
  children: React.ReactNode;
  className?: string;
}

interface TableBodyProps {
  children: React.ReactNode;
  className?: string;
}

interface TableRowProps {
  children: React.ReactNode;
  className?: string;
}

interface TableCellProps {
  children: React.ReactNode;
  className?: string;
}

export const Table: React.FC<TableProps> = ({ children, className = "" }) => {
  return (
    <div className="overflow-x-auto">
      <table className={`min-w-full bg-white border border-gray-200 rounded-lg shadow-sm ${className}`}>
        {children}
      </table>
    </div>
  );
};

export const TableHeader: React.FC<TableHeaderProps> = ({ children, className = "" }) => {
  return (
    <thead className={`bg-gradient-to-r from-gold-50 to-gold-100 ${className}`}>
      {children}
    </thead>
  );
};

export const TableBody: React.FC<TableBodyProps> = ({ children, className = "" }) => {
  return (
    <tbody className={`divide-y divide-gray-200 ${className}`}>
      {children}
    </tbody>
  );
};

export const TableRow: React.FC<TableRowProps> = ({ children, className = "" }) => {
  return (
    <tr className={`hover:bg-gray-50 transition-colors ${className}`}>
      {children}
    </tr>
  );
};

export const TableCell: React.FC<TableCellProps> = ({ children, className = "" }) => {
  return (
    <td className={`px-6 py-4 whitespace-nowrap text-sm text-gray-900 ${className}`}>
      {children}
    </td>
  );
};

export const TableHeaderCell: React.FC<TableCellProps> = ({ children, className = "" }) => {
  return (
    <th className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${className}`}>
      {children}
    </th>
  );
};

export default Table;