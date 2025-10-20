import React from 'react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { BoltIcon } from '../ui/icons';

interface ReportGeneratorCardProps {
    title: string;
    description: string;
    icon: React.ElementType;
    onGenerate: () => void;
}

const ReportGeneratorCard: React.FC<ReportGeneratorCardProps> = ({ title, description, icon: Icon, onGenerate }) => (
    <Card className="flex flex-col text-center items-center">
        <div className="bg-tinedy-blue/10 p-3 rounded-full mb-4">
            <Icon className="w-8 h-8 text-tinedy-blue" />
        </div>
        <h3 className="text-lg font-bold text-slate-800">{title}</h3>
        <p className="text-sm text-slate-500 mt-2 flex-grow">{description}</p>
        <Button onClick={onGenerate} className="mt-6 w-full font-semibold">
            <BoltIcon className="w-5 h-5 mr-2" />
            Generate Report
        </Button>
    </Card>
);

export default ReportGeneratorCard;