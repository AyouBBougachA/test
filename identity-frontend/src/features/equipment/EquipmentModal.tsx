import { useState, useEffect } from 'react';
import { equipmentApi } from '@/api/equipmentApi';
import { departmentApi } from '@/api';
import { Equipment, Department, EquipmentCategory, EquipmentModel } from '@/types';
import { Button, Input, Modal } from '@/components/ui';
import { Loader2, Plus, Trash2 } from 'lucide-react';

interface EquipmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  equipment: Equipment | null;
  optionsVersion: number;
}

export default function EquipmentModal({ isOpen, onClose, onSuccess, equipment, optionsVersion }: EquipmentModalProps) {
  const [loading, setLoading] = useState(false);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [categories, setCategories] = useState<EquipmentCategory[]>([]);
  const [models, setModels] = useState<EquipmentModel[]>([]);
  const [thresholds, setThresholds] = useState<number[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    serialNumber: '',
    status: 'OPERATIONAL',
    location: '',
    departmentId: 0,
    categoryId: 0,
    modelId: 0,
    criticality: 'MEDIUM',
    meterUnit: '',
    startMeterValue: 0
  });

  // Load departments on mount
  useEffect(() => {
    departmentApi.getAll().then(setDepartments).catch(() => setDepartments([]));
  }, []);

  useEffect(() => {
    if (isOpen) {
      equipmentApi.getCategories().then(setCategories).catch(() => setCategories([]));
      equipmentApi.getModels().then(setModels).catch(() => setModels([]));
    }
  }, [isOpen, optionsVersion]);

  useEffect(() => {
    if (equipment) {
      setFormData({
        name: equipment.name,
        serialNumber: equipment.serialNumber,
        status: equipment.status,
        location: equipment.location,
        departmentId: equipment.departmentId,
        categoryId: equipment.categoryId || 0,
        modelId: equipment.modelId || 0,
        criticality: equipment.criticality || 'MEDIUM',
        meterUnit: equipment.meterUnit || '',
        startMeterValue: equipment.startMeterValue || 0
      });
      setThresholds(equipment.thresholds || []);
    } else {
      setFormData({
        name: '',
        serialNumber: '',
        status: 'OPERATIONAL',
        location: '',
        departmentId: departments.length > 0 ? departments[0].departmentId : 0,
        categoryId: categories.length > 0 ? categories[0].categoryId : 0,
        modelId: models.length > 0 ? models[0].modelId : 0,
        criticality: 'MEDIUM',
        meterUnit: '',
        startMeterValue: 0
      });
      setThresholds([]);
    }
  }, [equipment, isOpen, departments, categories, models]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.departmentId || formData.departmentId === 0) {
      alert('Please select a department.');
      return;
    }
    if (formData.startMeterValue != null && formData.startMeterValue < 0) {
      alert('Start meter value must be non-negative.');
      return;
    }
    if (thresholds.some((value) => value < 0)) {
      alert('Threshold values must be non-negative.');
      return;
    }
    try {
      setLoading(true);
      // Ensure departmentId is always sent as a number
      const payload = {
        ...formData,
        departmentId: Number(formData.departmentId),
        categoryId: formData.categoryId ? Number(formData.categoryId) : null,
        modelId: formData.modelId ? Number(formData.modelId) : null,
        startMeterValue: formData.startMeterValue ?? 0,
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
      if (err.response?.data?.message) {
          alert(`Error: ${err.response.data.message}`);
      } else if (err.response?.data?.error) {
        alert(`Error: ${err.response.data.error}`);
      } else {
          alert('Failed to save equipment. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={equipment ? "Edit Equipment" : "Add Equipment"}
      className="p-8 max-w-lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Equipment Name</label>
            <Input 
                required 
                value={formData.name} 
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, name: e.target.value})}
                placeholder="e.g., Philips Ventilator G500"
                className="h-11"
            />
        </div>

        <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Serial Number</label>
                <Input 
                    required 
                    value={formData.serialNumber} 
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, serialNumber: e.target.value})}
                    placeholder="SN-12345"
                    className="h-11 font-mono text-sm"
                />
            </div>
            <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Status</label>
                <select 
                    className="flex h-11 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 ring-offset-background"
                    value={formData.status}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFormData({...formData, status: e.target.value})}
                >
                    <option value="OPERATIONAL">Operational</option>
                    <option value="UNDER_REPAIR">Under Repair</option>
                    <option value="ARCHIVED">Archived</option>
                </select>
            </div>
        </div>

        <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Department</label>
            <select
                required
                className="flex h-11 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 ring-offset-background"
                value={formData.departmentId}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                    setFormData({ ...formData, departmentId: Number(e.target.value) })
                }
            >
                <option value={0} disabled>Select a department</option>
                {departments.map((d) => (
                    <option key={d.departmentId} value={d.departmentId}>
                        {d.departmentName}
                    </option>
                ))}
            </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Category</label>
            <select
              className="flex h-11 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 ring-offset-background"
              value={formData.categoryId}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                setFormData({ ...formData, categoryId: Number(e.target.value) })
              }
            >
              <option value={0}>Select category</option>
              {categories.map((c) => (
                <option key={c.categoryId} value={c.categoryId}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Model</label>
            <select
              className="flex h-11 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 ring-offset-background"
              value={formData.modelId}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                setFormData({ ...formData, modelId: Number(e.target.value) })
              }
            >
              <option value={0}>Select model</option>
              {models.map((m) => (
                <option key={m.modelId} value={m.modelId}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Criticality</label>
            <select
              className="flex h-11 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 ring-offset-background"
              value={formData.criticality}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                setFormData({ ...formData, criticality: e.target.value })
              }
            >
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="CRITICAL">Critical</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Meter Unit</label>
            <Input
              value={formData.meterUnit}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setFormData({ ...formData, meterUnit: e.target.value })
              }
              placeholder="e.g., hours, km"
              className="h-11"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Start Meter Value</label>
            <Input
              type="number"
              min={0}
              step="0.01"
              value={formData.startMeterValue}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setFormData({ ...formData, startMeterValue: Number(e.target.value) })
              }
              className="h-11"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Thresholds</label>
            <div className="space-y-2">
              {thresholds.map((value, index) => (
                <div key={`${value}-${index}`} className="flex items-center gap-2">
                  <Input
                    type="number"
                    min={0}
                    step="0.01"
                    value={value}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      const next = [...thresholds];
                      next[index] = Number(e.target.value);
                      setThresholds(next);
                    }}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:bg-destructive/10"
                    onClick={() => setThresholds(thresholds.filter((_, i) => i !== index))}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => setThresholds([...thresholds, 0])}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Threshold
              </Button>
            </div>
          </div>
        </div>

        <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Location / Ward</label>
            <Input 
                required 
                value={formData.location} 
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, location: e.target.value})}
                placeholder="e.g., ICU Ward 3, Floor 2"
                className="h-11"
            />
        </div>

        <div className="flex justify-end gap-3 pt-6 border-t border-border/50">
          <Button type="button" variant="ghost" onClick={onClose} className="font-bold">Cancel</Button>
          <Button type="submit" disabled={loading} className="font-bold min-w-[120px]">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Equipment"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
