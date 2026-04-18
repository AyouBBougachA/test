import React from 'react';
import { Card } from '@/components/ui';
import { Package, AlertTriangle, Activity, Settings2 } from 'lucide-react';

interface KpiStats {
  totalEquipment: number;
  criticalEquipment: number;
  outOfService: number;
  dueForMaintenance: number;
}

interface EquipmentKpiCardsProps {
  stats: KpiStats;
  loading: boolean;
}

export default function EquipmentKpiCards({ stats, loading }: EquipmentKpiCardsProps) {
  const cards = [
    {
      title: 'Total Equipment',
      value: stats.totalEquipment,
      icon: Package,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      borderColor: 'border-blue-100'
    },
    {
      title: 'Critical Equipment',
      value: stats.criticalEquipment,
      icon: AlertTriangle,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
      borderColor: 'border-amber-100'
    },
    {
      title: 'Out of Service',
      value: stats.outOfService,
      icon: Activity,
      color: 'text-rose-600',
      bg: 'bg-rose-50',
      borderColor: 'border-rose-100'
    },
    {
      title: 'Due for Maintenance',
      value: stats.dueForMaintenance,
      icon: Settings2,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      borderColor: 'border-emerald-100'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, i) => (
        <Card key={i} className={`p-4 border ${card.borderColor} shadow-sm bg-white overflow-hidden relative group`}>
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-xl ${card.bg} ${card.color} transition-transform group-hover:scale-110 duration-300`}>
              <card.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">{card.title}</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">
                {loading ? (
                  <div className="h-8 w-16 bg-slate-100 animate-pulse rounded" />
                ) : (
                  card.value
                )}
              </h3>
            </div>
          </div>
          <div className={`absolute bottom-0 right-0 w-24 h-24 -mr-8 -mb-8 rounded-full ${card.bg} opacity-20 pointer-events-none`} />
        </Card>
      ))}
    </div>
  );
}
