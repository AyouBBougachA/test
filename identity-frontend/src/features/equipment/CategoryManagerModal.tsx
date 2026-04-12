import { useEffect, useState } from 'react';
import { Modal, Button, Input } from '@/components/ui';
import { equipmentApi } from '@/api/equipmentApi';
import { EquipmentCategory } from '@/types';
import { Loader2, Trash2 } from 'lucide-react';

interface CategoryManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onChange: () => void;
}

export default function CategoryManagerModal({ isOpen, onClose, onChange }: CategoryManagerModalProps) {
  const [categories, setCategories] = useState<EquipmentCategory[]>([]);
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const data = await equipmentApi.getCategories();
      setCategories(data);
    } catch (err) {
      console.error('Failed to load categories', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadCategories();
    }
  }, [isOpen]);

  const handleAdd = async () => {
    if (!name.trim()) return;
    try {
      setSaving(true);
      await equipmentApi.createCategory(name.trim());
      setName('');
      await loadCategories();
      onChange();
    } catch (err: any) {
      alert(err.response?.data?.error || err.response?.data?.message || 'Failed to create category');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this category?')) return;
    try {
      await equipmentApi.deleteCategory(id);
      await loadCategories();
      onChange();
    } catch (err: any) {
      alert(err.response?.data?.error || err.response?.data?.message || 'Failed to delete category');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Manage Categories" className="max-w-lg">
      <div className="space-y-5">
        <div className="flex gap-3">
          <Input
            placeholder="Add new category"
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
          ) : categories.length === 0 ? (
            <div className="p-6 text-sm text-muted-foreground text-center">No categories yet.</div>
          ) : (
            <ul className="divide-y divide-border/40">
              {categories.map((category) => (
                <li key={category.categoryId} className="flex items-center justify-between px-4 py-3">
                  <span className="text-sm font-semibold text-foreground">{category.name}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:bg-destructive/10"
                    onClick={() => handleDelete(category.categoryId)}
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
