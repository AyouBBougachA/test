import React from 'react';
import { Search, Filter, X } from 'lucide-react';
import { Input, Button } from '@/components/ui';
import { Department } from '@/types';

interface EquipmentFiltersProps {
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  statusFilter: string;
  setStatusFilter: (val: string) => void;
  deptFilter: number | '';
  setDeptFilter: (val: number | '') => void;
  classFilter: string;
  setClassFilter: (val: string) => void;
  critFilter: string;
  setCritFilter: (val: string) => void;
  departments: Department[];
  onClear: () => void;
}

export default function EquipmentFilters({
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
  deptFilter,
  setDeptFilter,
  classFilter,
  setClassFilter,
  critFilter,
  setCritFilter,
  departments,
  onClear
}: EquipmentFiltersProps) {
  const hasActiveFilters = searchQuery !== '' || statusFilter !== '' || deptFilter !== '' || classFilter !== '' || critFilter !== '';

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-4">
      <div className="flex flex-col md:flex-row gap-4">
        {/* Search Bar */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Search by Code, Name, SN, or Location..."
            className="pl-10 h-10 border-slate-200 focus:ring-blue-500"
            value={searchQuery}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Clear Button */}
        {hasActiveFilters && (
          <Button variant="ghost" onClick={onClear} className="text-slate-500 hover:text-rose-600 px-3 h-10">
            <X className="w-4 h-4 mr-2" />
            Clear Filters
          </Button>
        )}
      </div>

      {/* Filter Row */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest mr-2">
          <Filter className="w-3.5 h-3.5" />
          Filters:
        </div>

        {/* Status */}
        <select
          className="h-9 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          value={statusFilter}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setStatusFilter(e.target.value)}
        >
          <option value="">All Statuses</option>
          <option value="OPERATIONAL">Operational</option>
          <option value="OUT_OF_SERVICE">Out of Service</option>
          <option value="REFORMED">Reformed</option>
          <option value="UNDER_REPAIR">Under Repair</option>
        </select>

        {/* Department */}
        <select
          className="h-9 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          value={deptFilter === '' ? '' : deptFilter}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setDeptFilter(e.target.value === '' ? '' : Number(e.target.value))}
        >
          <option value="">All Departments</option>
          {departments.map((d) => (
            <option key={d.departmentId} value={d.departmentId}>
              {d.departmentName}
            </option>
          ))}
        </select>

        {/* Classification */}
        <select
          className="h-9 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          value={classFilter}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setClassFilter(e.target.value)}
        >
          <option value="">All Classifications</option>
          <option value="BIOMEDICAL">Biomedical</option>
          <option value="TECHNICAL">Technical</option>
          <option value="IT">IT</option>
        </select>

        {/* Criticality */}
        <select
          className="h-9 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          value={critFilter}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setCritFilter(e.target.value)}
        >
          <option value="">All Criticality</option>
          <option value="LOW">Low</option>
          <option value="MEDIUM">Medium</option>
          <option value="HIGH">High</option>
          <option value="CRITICAL">Critical</option>
        </select>
      </div>
    </div>
  );
}
