import { useState, useEffect } from 'react';
import { equipmentApi } from '@/api/equipmentApi';
import { EquipmentHistory } from '@/types';
import { Modal } from '@/components/ui';
import { Clock, CheckCircle2, History, Loader2 } from 'lucide-react';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  equipmentId: number;
}

export default function HistoryModal({ isOpen, onClose, equipmentId }: HistoryModalProps) {
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState<EquipmentHistory[]>([]);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        const data = await equipmentApi.getHistory(equipmentId);
        setHistory(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (isOpen) {
      fetchHistory();
    }
  }, [isOpen, equipmentId]);

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="Equipment History Log"
      className="max-w-2xl"
    >
      <div className="p-1 max-h-[60vh] overflow-y-auto">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-muted/20 rounded-xl border border-dashed border-border/60">
            <Loader2 className="w-8 h-8 animate-spin text-primary opacity-40 mb-3" />
            <p className="text-sm font-bold text-slate-500 uppercase tracking-widest italic">Retrieving History...</p>
          </div>
        ) : history.length === 0 ? (
          <div className="text-center py-20 bg-muted/10 rounded-xl border border-dashed">
            <Clock className="w-8 h-8 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest italic font-medium italic">No recorded history yet</p>
          </div>
        ) : (
          <div className="relative pl-6 before:absolute before:left-2.5 before:top-4 before:bottom-4 before:w-0.5 before:bg-slate-200">
            {history.map((log, index) => (
              <div key={log.id} className="relative mb-8 last:mb-0">
                <div className="absolute -left-[24px] top-1.5 w-4 h-4 rounded-full bg-blue-500 border-4 border-white shadow-sm ring-2 ring-blue-500/10" />
                <div className="bg-white border border-border shadow-sm rounded-xl p-5 hover:border-primary/30 transition-colors">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2 pt-0.5">
                        <span className="text-sm font-black text-slate-900 border-b-2 border-primary/20 pb-0.5 uppercase tracking-tight">
                            {log.action}
                        </span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-md">
                            <Clock className="w-3 h-3" />
                            {new Date(log.createdAt).toLocaleString()}
                        </span>
                    </div>
                    <div className="flex items-center gap-2 mt-3 text-xs font-bold text-slate-500">
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Performer:</span> 
                        <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg border border-slate-200/50 shadow-sm">
                            {log.performedBy}
                        </span>
                    </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
}
