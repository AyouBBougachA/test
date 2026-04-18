import React, { useState, useEffect, useCallback } from 'react';
import { equipmentApi } from '@/api/equipmentApi';
import { departmentApi } from '@/api';
import { useAuthStore } from '@/store/authStore';
import { Equipment, Department } from '@/types';
import { Card, Button, Badge } from '@/components/ui';
import { 
  Plus, Edit2, History, Archive, Loader2, Package, MapPin, 
  Hash, FileText, RotateCcw, MoreVertical, Eye, 
  AlertTriangle, ShieldAlert, CheckCircle2, Clock, Activity
} from 'lucide-react';
import EquipmentModal from './EquipmentModal';
import EquipmentKpiCards from './components/EquipmentKpiCards';
import EquipmentFilters from './components/EquipmentFilters';

export default function EquipmentPage() {
  const { user } = useAuthStore();
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [stats, setStats] = useState({
    totalEquipment: 0,
    criticalEquipment: 0,
    outOfService: 0,
    dueForMaintenance: 0
  });
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  
  // Search and Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [departmentFilter, setDepartmentFilter] = useState<number | ''>('');
  const [classFilter, setClassFilter] = useState<string>('');
  const [critFilter, setCritFilter] = useState<string>('');
  const [departments, setDepartments] = useState<Department[]>([]);
  
  // Modals
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
  const [viewMode, setViewMode] = useState<'edit' | 'view'>('edit');
  const [optionsVersion, setOptionsVersion] = useState(0);

  const fetchStats = async () => {
    try {
      setStatsLoading(true);
      const data = await equipmentApi.getKpis();
      setStats(data as any);
    } catch (err) {
      console.error('Failed to fetch stats', err);
    } finally {
      setStatsLoading(false);
    }
  };

  const fetchEquipment = useCallback(async () => {
    try {
      setLoading(true);
      const data = await equipmentApi.search(
          departmentFilter === '' ? undefined : departmentFilter,
          statusFilter === '' ? undefined : statusFilter,
          searchQuery === '' ? undefined : searchQuery,
          classFilter === '' ? undefined : classFilter,
          critFilter === '' ? undefined : critFilter
      );
      setEquipment(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, statusFilter, departmentFilter, classFilter, critFilter]);

  useEffect(() => {
    departmentApi.getAll().then(setDepartments).catch(() => setDepartments([]));
    fetchStats();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchEquipment();
    }, 400);
    return () => clearTimeout(timer);
  }, [fetchEquipment]);

  const handleArchive = async (id: number) => {
    if (!window.confirm("Are you sure you want to archive this equipment?")) return;
    try {
      await equipmentApi.archive(id);
      fetchEquipment();
      fetchStats();
    } catch (err) {
      alert('Failed to archive equipment');
    }
  };

  const handleRestore = async (id: number) => {
    if (!window.confirm("Restore this equipment to Operational status?")) return;
    try {
      await equipmentApi.updateStatus(id, 'OPERATIONAL');
      fetchEquipment();
      fetchStats();
    } catch (err) {
      alert('Failed to restore equipment');
    }
  };

  const openCreate = () => {
    setSelectedEquipment(null);
    setViewMode('edit');
    setModalOpen(true);
  };

  const openEdit = (e: Equipment) => {
    setSelectedEquipment(e);
    setViewMode('edit');
    setModalOpen(true);
  };

  const openView = (e: Equipment) => {
    setSelectedEquipment(e);
    setViewMode('view');
    setModalOpen(true);
  };

  const getStatusBadge = (status: string) => {
    const s = status.toUpperCase();
    switch (s) {
      case 'OPERATIONAL': 
        return <Badge variant="success" className="bg-emerald-50 text-emerald-700 border-emerald-200">Operational</Badge>;
      case 'OUT_OF_SERVICE': 
        return <Badge variant="destructive" className="bg-rose-50 text-rose-700 border-rose-200">Out of Service</Badge>;
      case 'REFORMED': 
        return <Badge variant="secondary" className="bg-slate-100 text-slate-600 border-slate-200">Reformed</Badge>;
      case 'UNDER_REPAIR': 
        return <Badge variant="default" className="bg-blue-50 text-blue-700 border-blue-200">Under Repair</Badge>;
      case 'ARCHIVED': 
        return <Badge variant="outline" className="text-slate-400 border-slate-200">Archived</Badge>;
      default: 
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getCriticalityBadge = (crit: string | undefined | null) => {
    const c = (crit || 'MEDIUM').toUpperCase();
    switch (c) {
      case 'CRITICAL': 
        return <div className="flex items-center gap-1.5 text-rose-600 font-bold text-xs"><ShieldAlert className="w-3.5 h-3.5" /> CRITICAL</div>;
      case 'HIGH': 
        return <div className="flex items-center gap-1.5 text-amber-600 font-bold text-xs"><AlertTriangle className="w-3.5 h-3.5" /> HIGH</div>;
      case 'MEDIUM': 
        return <div className="flex items-center gap-1.5 text-blue-600 font-bold text-xs"><Activity className="w-3.5 h-3.5" /> MEDIUM</div>;
      default: 
        return <div className="flex items-center gap-1.5 text-slate-500 font-bold text-xs"><CheckCircle2 className="w-3.5 h-3.5" /> LOW</div>;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">Equipment Referential</h2>
          <p className="text-slate-500 mt-1 text-sm font-medium">Centralized asset management for clinical and technical excellence.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => { fetchEquipment(); fetchStats(); }} className="h-11 px-4 text-slate-500 border-slate-200">
            <RotateCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
          {(user?.roleName === 'ADMIN' || user?.roleName === 'MANAGER') && (
            <Button onClick={openCreate} className="shadow-lg shadow-blue-500/20 bg-blue-600 hover:bg-blue-700 text-white border-none h-11 px-6">
              <Plus className="w-5 h-5 mr-2" />
              New Equipment
            </Button>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <EquipmentKpiCards stats={stats} loading={statsLoading} />

      {/* Filters */}
      <EquipmentFilters 
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        deptFilter={departmentFilter}
        setDeptFilter={setDepartmentFilter}
        classFilter={classFilter}
        setClassFilter={setClassFilter}
        critFilter={critFilter}
        setCritFilter={setCritFilter}
        departments={departments}
        onClear={() => {
          setSearchQuery('');
          setStatusFilter('');
          setDepartmentFilter('');
          setClassFilter('');
          setCritFilter('');
        }}
      />

      {/* Main Inventory Table */}
      <Card className="shadow-xl shadow-slate-200/50 border-slate-200 bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200">
                <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-widest text-[10px]">Asset / Identity</th>
                <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-widest text-[10px]">Location & Service</th>
                <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-widest text-[10px]">Type & Priority</th>
                <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-widest text-[10px]">Status</th>
                <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-widest text-[10px]">Last Maintenance</th>
                <th className="px-6 py-4 text-right font-bold text-slate-500 uppercase tracking-widest text-[10px]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading && equipment.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-24 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <Loader2 className="w-10 h-10 animate-spin text-blue-500 opacity-40" />
                      <p className="mt-4 text-slate-400 font-medium italic">Synchronizing assets...</p>
                    </div>
                  </td>
                </tr>
              ) : equipment.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-24 text-center">
                    <div className="flex flex-col items-center justify-center max-w-sm mx-auto">
                      <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mb-6">
                        <Package className="w-8 h-8 text-slate-300" />
                      </div>
                      <h4 className="text-lg font-bold text-slate-900">No assets found</h4>
                      <p className="text-slate-500 mt-2">Adjust your filters or add a new piece of equipment to the referential base.</p>
                      <Button variant="outline" className="mt-6 font-bold" onClick={() => setSearchQuery('')}>Reset Filters</Button>
                    </div>
                  </td>
                </tr>
              ) : (
                equipment.map((e) => (
                  <tr 
                    key={e.equipmentId} 
                    className="hover:bg-blue-50/30 transition-all cursor-pointer group"
                    onClick={() => openView(e)}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                          <Package className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 group-hover:text-blue-700 transition-colors uppercase tracking-tight">{e.name}</div>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] font-black bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded border border-slate-200 font-mono">{e.assetCode || 'NO-CODE'}</span>
                            <span className="text-slate-400 text-xs flex items-center gap-1">
                              <Hash className="w-3 h-3 opacity-60" /> {e.serialNumber}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2 text-slate-700 font-semibold text-xs">
                          <MapPin className="w-3.5 h-3.5 text-rose-500" />
                          {e.location}
                        </div>
                        <div className="text-[10px] text-slate-400 uppercase font-black pl-5 tracking-tighter">
                          {e.departmentName || 'Central Storage'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-2">
                        <div className="text-[10px] font-bold text-slate-400 border border-slate-200 px-2 py-0.5 rounded bg-slate-50 inline-block uppercase tracking-widest leading-none">
                          {e.classification || 'BIOMEDICAL'}
                        </div>
                        <div>{getCriticalityBadge(e.criticality)}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(e.status)}
                    </td>
                    <td className="px-6 py-4">
                      {e.lastMaintenanceDate ? (
                        <div className="flex flex-col">
                          <span className="text-slate-700 font-bold flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-emerald-500" />
                            {new Date(e.lastMaintenanceDate).toLocaleDateString()}
                          </span>
                          <span className="text-[10px] text-slate-400 font-medium">
                            {new Date(e.lastMaintenanceDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-400 text-xs italic tracking-tighter">No record</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1 opacity-1 sm:opacity-0 group-hover:opacity-100 transition-all duration-200">
                        <Button variant="ghost" size="icon" className="w-8 h-8 text-slate-400 hover:text-blue-600 hover:bg-blue-50" onClick={() => openView(e)}>
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="w-8 h-8 text-slate-400 hover:text-blue-600 hover:bg-blue-50" onClick={() => openEdit(e)}>
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="w-8 h-8 text-slate-400 hover:text-rose-600 hover:bg-rose-50" onClick={() => handleArchive(e.equipmentId)}>
                          <Archive className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Redesigned Modal */}
      <EquipmentModal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        onSuccess={() => {
          fetchEquipment();
          fetchStats();
        }} 
        equipment={selectedEquipment} 
        initialMode={viewMode}
      />
    </div>
  );
}
