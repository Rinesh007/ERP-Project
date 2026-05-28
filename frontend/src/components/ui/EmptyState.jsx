// src/components/ui/EmptyState.jsx — Empty state placeholder
import { Inbox } from 'lucide-react';

const EmptyState = ({ title = 'No records found', description = '', action }) => (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mb-4">
      <Inbox className="h-7 w-7 text-gray-400" />
    </div>
    <p className="text-sm font-medium text-gray-600">{title}</p>
    {description && <p className="text-xs text-gray-400 mt-1 max-w-xs">{description}</p>}
    {action && <div className="mt-4">{action}</div>}
  </div>
);

export default EmptyState;
