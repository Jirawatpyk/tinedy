import React from 'react';

// --- COMPOUND COMPONENT DEFINITIONS ---

interface TableRootProps {
  children: React.ReactNode;
  className?: string;
  ['aria-label']: string;
}
const TableRoot: React.FC<TableRootProps> = ({ children, className = '', ...props }) => (
  <div role="table" className={`w-full ${className}`} {...props}>
    {children}
  </div>
);


interface TableHeaderProps {
  children: React.ReactNode;
  className?: string;
  isSticky?: boolean;
}
const TableHeader: React.FC<TableHeaderProps> = ({ children, className = '', isSticky = false }) => (
  <div
    role="rowgroup"
    className={isSticky
      ? 'sticky top-0 z-10 bg-slate-50/80 dark:bg-slate-900/80 backdrop-blur-sm border-b border-slate-200 dark:border-slate-800'
      : 'border-b border-slate-200 dark:border-slate-800'
    }
  >
    <div role="row" className={`flex items-center px-4 ${className}`}>
      {children}
    </div>
  </div>
);


// FIX: Allow spreading props like onClick to the underlying div element.
// FIX: Made children optional to allow for spacer cells.
interface TableHeaderCellProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
}
export const TableHeaderCell: React.FC<TableHeaderCellProps> = ({ children, className = '', ...props }) => (
  <div role="columnheader" className={`flex-1 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 tracking-wider ${className}`} {...props}>
    {children}
  </div>
);


interface TableBodyProps {
  children: React.ReactNode;
  className?: string;
}
const TableBody: React.FC<TableBodyProps> = ({ children, className = '' }) => (
  <div role="rowgroup" className={`divide-y divide-slate-100 dark:divide-slate-800 ${className}`}>
    {children}
  </div>
);


// FIX: Allow spreading props to the underlying div element for consistency.
interface TableRowProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}
export const TableRow: React.FC<TableRowProps> = ({ children, className = '', ...props }) => (
  <div role="row" className={`flex items-center px-4 transition-colors duration-150 hover:bg-slate-50 dark:hover:bg-slate-800/50 ${className}`} {...props}>
    {children}
  </div>
);


interface TableCellProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  colSpan?: number;
}
export const TableCell: React.FC<TableCellProps> = ({ children, className = '', colSpan, ...props }) => (
  <div
    role="cell"
    className={`${colSpan ? 'w-full' : 'flex-1'} py-3 flex ${colSpan ? 'flex-col' : 'items-center'} ${className}`}
    {...props}
  >
    {children}
  </div>
);


interface TableEmptyStateProps {
    title: string;
    message: string;
    icon?: React.ElementType;
    action?: React.ReactNode;
}
const TableEmptyState: React.FC<TableEmptyStateProps> = ({ title, message, icon: Icon, action }) => (
    <div className="text-center py-16 px-4">
        {Icon && <Icon className="mx-auto h-12 w-12 text-slate-300 dark:text-slate-600" aria-hidden="true" />}
        <p className="mt-4 text-slate-600 dark:text-slate-300 font-semibold">{title}</p>
        <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">{message}</p>
        {action && <div className="mt-6">{action}</div>}
    </div>
);


// --- EXPORT COMPOUND COMPONENT ---

export const Table = Object.assign(TableRoot, {
  Header: TableHeader,
  HeaderCell: TableHeaderCell,
  Body: TableBody,
  Row: TableRow,
  Cell: TableCell,
  EmptyState: TableEmptyState,
});
