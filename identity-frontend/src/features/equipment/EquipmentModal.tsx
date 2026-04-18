import { useState, useEffect } from 'react';
import { equipmentApi } from '@/api/equipmentApi';
import { departmentApi } from '@/api';
import { Equipment, Department, EquipmentCategory, EquipmentModel } from '@/types';
import { Button, Input, Modal, Badge } from '@/components/ui';
import { 
  Loader2, Plus, Trash2, ChevronDown, ChevronUp, 
  FileText, History as HistoryIcon, Activity, Settings, 
  AlertTriangle, CheckCircle2, ShieldAlert, Package, 
  Layout, Book, ClipboardList, Clock, Archive, Edit2
} from 'lucide-react';
import DocumentModal from './DocumentModal';
import HistoryModal from './HistoryModal';

interface EquipmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  equipment: Equipment | null;
  initialMode?: 'edit' | 'view';
}

type TabType = 'general' | 'documents' | 'history' | 'counters';

export default function EquipmentModal({ isOpen, onClose, onSuccess, equipment, initialMode = 'edit' }: EquipmentModalProps) {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('general');
  const [isEditMode, setIsEditMode] = useState(initialMode === 'edit' || !equipment);
  const [thresholdsOpen, setThresholdsOpen] = useState(false);
  
  const [departments, setDepartments] = useState<Department[]>([]);
  const [categories, setCategories] = useState<EquipmentCategory[]>([]);
  const [models, setModels] = useState<EquipmentModel[]>([]);
  const [thresholds, setThresholds] = useState<{ value: number; label: string }[]>([]);
  
  const [formData, setFormData] = useState({
    assetCode: '',
    name: '',
    serialNumber: '',
    status: 'OPERATIONAL',
    location: '',
    departmentId: 0,
    categoryId: 0,
    modelId: 0,
    criticality: 'MEDIUM',
    classification: 'BIOMEDICAL',
    meterUnit: '',
    startMeterValue: 0
  });

  useEffect(() => {
    if (isOpen) {
      departmentApi.getAll().then(setDepartments).catch(() => setDepartments([]));
      equipmentApi.getCategories().then(setCategories).catch(() => setCategories([]));
      equipmentApi.getModels().then(setModels).catch(() => setModels([]));
      setActiveTab('general');
      setIsEditMode(initialMode === 'edit' || !equipment);
    }
  }, [isOpen, equipment, initialMode]);

  useEffect(() => {
    if (equipment) {
      setFormData({
        assetCode: equipment.assetCode || '',
        name: equipment.name,
        serialNumber: equipment.serialNumber,
        status: equipment.status,
        location: equipment.location,
        departmentId: equipment.departmentId,
        categoryId: equipment.categoryId || 0,
        modelId: equipment.modelId || 0,
        criticality: equipment.criticality || 'MEDIUM',
        classification: equipment.classification || 'BIOMEDICAL',
        meterUnit: equipment.meterUnit || '',
        startMeterValue: equipment.startMeterValue || 0
      });
      setThresholds((equipment.thresholds as any[])?.map(t => ({ 
        value: typeof t === 'number' ? t : t.value, 
        label: typeof t === 'number' ? '' : t.label 
      })) || []);
      setThresholdsOpen(!!equipment.meterUnit);
    } else {
      setFormData({
        assetCode: '',
        name: '',
        serialNumber: '',
        status: 'OPERATIONAL',
        location: '',
        departmentId: 0,
        categoryId: 0,
        modelId: 0,
        criticality: 'MEDIUM',
        classification: 'BIOMEDICAL',
        meterUnit: '',
        startMeterValue: 0
      });
      setThresholds([]);
      setThresholdsOpen(false);
    }
  }, [equipment, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.assetCode) return alert('Asset Code is required');
    if (!formData.name) return alert('Name is required');
    if (formData.departmentId === 0) return alert('Please select a department');
    
    try {
      setLoading(true);
      const payload = {
        ...formData,
        departmentId: Number(formData.departmentId),
        categoryId: formData.categoryId ? Number(formData.categoryId) : null,
        modelId: formData.modelId ? Number(formData.modelId) : null,
        thresholds
      };
      
      if (equipment) {
        await equipmentApi.update(equipment.equipmentId, payload);
      } else {
        await equipmentApi.create(payload);
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to save equipment');
    } finally {
      setLoading(false);
    }
  };

  const isCreate = !equipment;

  const renderGeneralTab = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Identity Section */}
        <div className="space-y-4 col-span-2">
           <div className="flex items-center gap-2 text-slate-900 border-b border-slate-100 pb-2 mb-2">
             <Layout className="w-4 h-4 text-blue-500" />
             <span className="font-bold uppercase tracking-widest text-[10px] text-slate-500">Asset Identity</span>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5 flex-1">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-tight">Asset Code / ID (Required)</label>
                <Input 
                  disabled={!isEditMode}
                  required 
                  value={formData.assetCode} 
                  onChange={(e) => setFormData({...formData, assetCode: e.target.value})}
                  placeholder="e.g., EQ-BIO-123"
                  className="bg-slate-50 focus:bg-white h-10 border-slate-200"
                />
              </div>
              <div className="space-y-1.5 flex-1">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-tight">Equipment Name (Required)</label>
                <Input 
                  disabled={!isEditMode}
                  required 
                  value={formData.name} 
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Official asset name..."
                  className="bg-slate-50 focus:bg-white h-10 border-slate-200"
                />
              </div>
           </div>
        </div>

        {/* Technical Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-slate-900 border-b border-slate-100 pb-2 mb-2">
            <Settings className="w-4 h-4 text-blue-500" />
            <span className="font-bold uppercase tracking-widest text-[10px] text-slate-500">Technical Data</span>
          </div>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-tight">Serial Number</label>
              <Input 
                disabled={!isEditMode}
                value={formData.serialNumber} 
                onChange={(e) => setFormData({...formData, serialNumber: e.target.value})}
                className="bg-slate-50 focus:bg-white h-10 font-mono text-xs border-slate-200"
              />
            </div>
            {!isCreate && (
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-tight">Current Status</label>
                <select 
                  disabled={!isEditMode}
                  className="w-full h-10 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700"
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                >
                  <option value="OPERATIONAL">OPERATIONAL</option>
                  <option value="OUT_OF_SERVICE">OUT OF SERVICE</option>
                  <option value="REFORMED">REFORMED</option>
                  <option value="UNDER_REPAIR">UNDER REPAIR</option>
                </select>
              </div>
            )}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-tight">Classification</label>
              <select 
                disabled={!isEditMode}
                className="w-full h-10 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700"
                value={formData.classification}
                onChange={(e) => setFormData({...formData, classification: e.target.value})}
              >
                <option value="BIOMEDICAL">BIOMEDICAL</option>
                <option value="TECHNICAL">TECHNICAL</option>
                <option value="IT">IT</option>
              </select>
            </div>
          </div>
        </div>

        {/* Assignment Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-slate-900 border-b border-slate-100 pb-2 mb-2">
            <ClipboardList className="w-4 h-4 text-blue-500" />
            <span className="font-bold uppercase tracking-widest text-[10px] text-slate-500">Assignment & Service</span>
          </div>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-tight">Department / Service</label>
              <select 
                disabled={!isEditMode}
                className="w-full h-10 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700"
                value={formData.departmentId}
                onChange={(e) => setFormData({...formData, departmentId: Number(e.target.value)})}
              >
                <option value={0}>Select department...</option>
                {departments.map((d) => (
                  <option key={d.departmentId} value={d.departmentId}>{d.departmentName}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-tight">Location / Ward</label>
              <Input 
                disabled={!isEditMode}
                value={formData.location} 
                onChange={(e) => setFormData({...formData, location: e.target.value})}
                placeholder="Specific room or ward..."
                className="bg-slate-50 focus:bg-white h-10 border-slate-200"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-tight">Criticality Level</label>
              <select 
                disabled={!isEditMode}
                className="w-full h-10 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700"
                value={formData.criticality}
                onChange={(e) => setFormData({...formData, criticality: e.target.value})}
              >
                <option value="LOW">LOW</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="HIGH">HIGH</option>
                <option value="CRITICAL">CRITICAL</option>
              </select>
            </div>
          </div>
        </div>

        {/* Meter Section */}
        <div className="col-span-2 bg-slate-50 p-6 rounded-2xl border border-slate-100 space-y-4">
          <div className="flex items-center justify-between cursor-pointer" onClick={() => setThresholdsOpen(!thresholdsOpen)}>
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-emerald-600" />
              <h4 className="font-bold text-slate-900 tracking-tight">Maintenance Meter & Thresholds</h4>
            </div>
            {thresholdsOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </div>
          
          {thresholdsOpen && (
            <div className="pt-4 grid grid-cols-1 md:grid-cols-2 gap-6 animate-in slide-in-from-top-4 duration-300">
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-tight">Meter Unit</label>
                  <Input 
                    disabled={!isEditMode}
                    value={formData.meterUnit}
                    onChange={(e) => setFormData({...formData, meterUnit: e.target.value})}
                    placeholder="e.g., hours, cycles, acts, km"
                    className="h-10 bg-white border-slate-200 shadow-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-tight">Start Value</label>
                  <Input 
                    disabled={!isEditMode}
                    type="number"
                    value={formData.startMeterValue}
                    onChange={(e) => setFormData({...formData, startMeterValue: Number(e.target.value)})}
                    className="h-10 bg-white border-slate-200 shadow-sm"
                  />
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-tight">Threshold Targets</label>
                  {isEditMode && (
                    <Button type="button" variant="outline" size="sm" onClick={() => setThresholds([...thresholds, { value: 0, label: '' }])} className="h-7 text-[10px] font-black">
                      <Plus className="w-3 h-3 mr-1" /> ADD TARGET
                    </Button>
                  )}
                </div>
                <div className="space-y-2 max-h-[160px] overflow-y-auto pr-2">
                  {thresholds.length === 0 ? (
                    <div className="text-center py-4 bg-white/50 border border-dashed rounded-lg text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                      No thresholds defined
                    </div>
                  ) : (
                    thresholds.map((t, idx) => (
                      <div key={idx} className="flex flex-col gap-2 p-2 bg-white rounded-lg border border-slate-200 shadow-sm relative group">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 space-y-1">
                            <label className="text-[8px] font-bold text-slate-400 uppercase">Label / Name</label>
                            <Input 
                              disabled={!isEditMode}
                              value={t.label}
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                const next = [...thresholds];
                                next[idx] = { ...next[idx], label: e.target.value };
                                setThresholds(next);
                              }}
                              placeholder="e.g., Major Overhaul"
                              className="h-8 text-xs bg-slate-50"
                            />
                          </div>
                          <div className="w-24 space-y-1">
                            <label className="text-[8px] font-bold text-slate-400 uppercase">Value</label>
                            <Input 
                              disabled={!isEditMode}
                              type="number"
                              value={t.value}
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                const next = [...thresholds];
                                next[idx] = { ...next[idx], value: Number(e.target.value) };
                                setThresholds(next);
                              }}
                              className="h-8 text-xs bg-slate-50"
                            />
                          </div>
                          {isEditMode && (
                            <Button 
                              type="button" 
                              variant="ghost" 
                              size="icon" 
                              className="self-end w-8 h-8 text-rose-500 hover:bg-rose-50"
                              onClick={() => setThresholds(thresholds.filter((_, i) => i !== idx))}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={isCreate ? "Register New Asset" : isEditMode ? "Modify Equipment Record" : equipment?.name || 'Equipment View'}
      className={`max-w-4xl p-0 ${isCreate ? 'overflow-hidden rounded-3xl' : ''}`}
    >
      <div className="flex flex-col h-[90vh] md:h-auto max-h-[90vh]">
        {/* Navigation Tabs (Only if not creating) */}
        {!isCreate && (
          <div className="flex items-center gap-1 p-2 bg-slate-50 border-b border-slate-200">
            {[
              { id: 'general', icon: Layout, label: 'General Info' },
              { id: 'documents', icon: FileText, label: 'Documents' },
              { id: 'history', icon: HistoryIcon, label: 'History' },
              { id: 'counters', icon: Activity, label: 'Counter Log' }
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id as TabType)}
                className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all ${
                  activeTab === t.id 
                    ? 'bg-white text-blue-600 shadow-sm border border-slate-200' 
                    : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
                }`}
              >
                <t.icon className={`w-3.5 h-3.5 ${activeTab === t.id ? 'text-blue-500' : ''}`} />
                {t.label}
              </button>
            ))}
          </div>
        )}

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8">
          {activeTab === 'general' && renderGeneralTab()}
          
          {activeTab === 'documents' && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <DocumentModal isOpen={true} onClose={() => {}} equipmentId={equipment!.equipmentId} />
            </div>
          )}
          
          {activeTab === 'history' && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <HistoryModal isOpen={true} onClose={() => {}} equipmentId={equipment!.equipmentId} />
            </div>
          )}
          
          {activeTab === 'counters' && (
             <div className="flex flex-col items-center justify-center p-20 text-slate-300 italic">
               <Activity className="w-12 h-12 mb-4 opacity-20" />
               <p className="font-bold uppercase tracking-widest text-[10px]">Counter summary module coming soon</p>
             </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 md:p-6 bg-slate-50 border-t border-slate-200 flex items-center justify-between rounded-b-3xl">
           <div>
             {!isCreate && isEditMode && (
               <Button variant="ghost" className="text-rose-500 hover:bg-rose-100/50 font-bold text-xs" onClick={() => {/* Archive logic handled outside */}}>
                 <Archive className="w-4 h-4 mr-2" /> Archive Asset
               </Button>
             )}
           </div>
           
           <div className="flex items-center gap-3">
             <Button variant="ghost" className="font-bold text-slate-500 h-10 px-6" onClick={onClose}>
               {isEditMode ? 'Cancel' : 'Close'}
             </Button>
             {(isCreate || isEditMode) ? (
               <Button onClick={handleSubmit} disabled={loading} className="font-bold h-10 px-8 bg-blue-600 hover:bg-blue-700 text-white border-none shadow-lg shadow-blue-500/20">
                 {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : isCreate ? 'Register Asset' : 'Save Changes'}
               </Button>
             ) : (
               <Button onClick={() => setIsEditMode(true)} className="font-bold h-10 px-8 bg-slate-900 hover:bg-black text-white border-none">
                 <Edit2 className="w-4 h-4 mr-2" /> Edit Record
               </Button>
             )}
           </div>
        </div>
      </div>
    </Modal>
  );
}
