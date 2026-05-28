// src/components/ui/StatCard.jsx — Dashboard stat card
import Spinner from './Spinner';

const StatCard = ({ title, value, icon: Icon, color = 'indigo', loading = false }) => {
  const colorClasses = {
    indigo: { icon: 'text-indigo-600', bg: 'bg-indigo-50' },
    emerald: { icon: 'text-emerald-600', bg: 'bg-emerald-50' },
    amber: { icon: 'text-amber-600', bg: 'bg-amber-50' },
    blue: { icon: 'text-blue-600', bg: 'bg-blue-50' },
    violet: { icon: 'text-violet-600', bg: 'bg-violet-50' },
  };

  const cls = colorClasses[color] || colorClasses.indigo;

  return (
    <div className="card p-5 flex items-center gap-4">
      <div className={`${cls.bg} p-3 rounded-lg flex-shrink-0`}>
        <Icon className={`h-5 w-5 ${cls.icon}`} />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{title}</p>
        {loading ? (
          <Spinner size="sm" className="mt-1" />
        ) : (
          <p className="text-2xl font-bold text-gray-900 mt-0.5 truncate">{value}</p>
        )}
      </div>
    </div>
  );
};

export default StatCard;
