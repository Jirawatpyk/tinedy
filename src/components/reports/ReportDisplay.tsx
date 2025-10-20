import React from 'react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { ArrowDownTrayIcon } from '../ui/icons';
import { exportToCsv } from '../../lib/csvExporter';

interface ReportDisplayProps {
  title: string;
  headers: { key: string; label: string }[];
  data: any[];
}

const ReportDisplay: React.FC<ReportDisplayProps> = ({ title, headers, data }) => {
  const handleExport = () => {
    const filename = `${title.toLowerCase().replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`;
    exportToCsv(filename, headers, data);
  };

  return (
    <Card className="mt-8 animate-fade-in-up">
      <div className="flex justify-between items-center mb-4 pb-4 border-b border-slate-200">
        <h3 className="text-xl font-bold text-slate-800">{title}</h3>
        <Button onClick={handleExport} variant="secondary">
          <ArrowDownTrayIcon className="w-5 h-5 mr-2" />
          Download CSV
        </Button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-slate-600">
          <thead className="text-xs text-slate-500 uppercase bg-slate-50">
            <tr>
              {headers.map((header) => (
                <th key={header.key} scope="col" className="px-6 py-3">
                  {header.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.length > 0 ? (
              data.map((row, index) => (
                <tr key={index} className="bg-white border-b hover:bg-slate-50">
                  {headers.map((header) => (
                    <td key={`${index}-${header.key}`} className="px-6 py-4 font-medium text-slate-800">
                      {row[header.key]}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={headers.length} className="text-center py-10 text-slate-500">
                  No data available for this report.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

export default ReportDisplay;
