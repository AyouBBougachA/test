import { useEffect, useState } from 'react';
import { Modal, Button, Input } from '@/components/ui';
import { equipmentApi } from '@/api/equipmentApi';
import { EquipmentModel } from '@/types';
import { Loader2, Trash2 } from 'lucide-react';

interface ModelManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onChange: () => void;
}

export default function ModelManagerModal({ isOpen, onClose, onChange }: ModelManagerModalProps) {
  const [models, setModels] = useState<EquipmentModel[]>([]);
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadModels = async () => {
    try {
      setLoading(true);
      const data = await equipmentApi.getModels();
      setModels(data);
    } catch (err) {
      console.error('Failed to load models', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadModels();
    }
  }, [isOpen]);

  const handleAdd = async () => {
    if (!name.trim()) return;
    try {
      setSaving(true);
      await equipmentApi.createModel(name.trim());
      setName('');
      await loadModels();
      onChange();
    } catch (err: any) {
      alert(err.response?.data?.error || err.response?.data?.message || 'Failed to create model');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this model?')) return;
    try {
      await equipmentApi.deleteModel(id);
      await loadModels();
      onChange();
    } catch (err: any) {
      alert(err.response?.data?.error || err.response?.data?.message || 'Failed to delete model');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Manage Models" className="max-w-lg">
      <div className="space-y-5">
        <div className="flex gap-3">
          <Input
            placeholder="Add new model"
            value={name}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
          />
          <Button onClick={handleAdd} disabled={saving} className="min-w-[120px]">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Add'}
          </Button>
        </div>

        <div className="max-h-72 overflow-y-auto border border-border/60 rounded-lg">
          {loading ? (
            <div className="p-6 flex items-center justify-center">
              <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
            </div>
          ) : models.length === 0 ? (
            <div className="p-6 text-sm text-muted-foreground text-center">No models yet.</div>
          ) : (
            <ul className="divide-y divide-border/40">
              {models.map((model) => (
                <li key={model.modelId} className="flex items-center justify-between px-4 py-3">
                  <span className="text-sm font-semibold text-foreground">{model.name}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:bg-destructive/10"
                    onClick={() => handleDelete(model.modelId)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </Modal>
  );
}
