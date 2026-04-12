import { useEffect, useState } from 'react';
import { Modal, Button, Input, Label } from '@/components/ui';
import { equipmentApi } from '@/api/equipmentApi';
import { Meter } from '@/types';
import { Loader2, TrendingUp } from 'lucide-react';

interface MeterReadingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  meter: Meter;
}

export default function MeterReadingModal({ isOpen, onClose, onSuccess, meter }: MeterReadingModalProps) {
  const [operation, setOperation] = useState<'ADD' | 'SUBTRACT'>('ADD');
  const [amount, setAmount] = useState<number>(0);
  const [submitting, setSubmitting] = useState(false);

  const currentValue = meter.value || 0;
  const resultingValue = operation === 'ADD' ? currentValue + amount : currentValue - amount;
  const isAmountValid = Number.isFinite(amount) && amount > 0;

  useEffect(() => {
    if (isOpen) {
      setOperation('ADD');
      setAmount(0);
    }
  }, [isOpen, meter.meterId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await equipmentApi.recordMeterLog(meter.meterId, operation, amount);
      onSuccess();
      onClose();
    } catch (err) {
      console.error('Failed to record reading', err);
      alert('Failed to record new reading');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Update ${meter.name}`} className="max-w-md">
      <div className="p-6 pt-2 space-y-6">
        <div className="flex items-center gap-4 p-4 rounded-xl bg-primary/5 border border-primary/10">
          <TrendingUp className="w-8 h-8 text-primary" />
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-primary/60 mb-1">Previous Value</p>
            <p className="text-xl font-black text-slate-900">{currentValue} <span className="text-sm font-bold text-slate-400">{meter.unit}</span></p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="operation">Operation</Label>
            <select
              id="operation"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              value={operation}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setOperation(e.target.value as 'ADD' | 'SUBTRACT')}
            >
              <option value="ADD">Add</option>
              <option value="SUBTRACT">Subtract</option>
            </select>
            <p className="text-[11px] text-muted-foreground">Subtract is intended only for correcting mistakes.</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Amount ({meter.unit})</Label>
            <Input 
              id="amount" 
              type="number" 
              min={0}
              step="0.01"
              autoFocus
              className="text-2xl h-14 font-black text-center"
              value={amount} 
              onChange={e => setAmount(parseFloat(e.target.value))}
              required 
            />
            {resultingValue < 0 && (
              <p className="text-xs font-bold text-destructive">Resulting value cannot go below zero.</p>
            )}
          </div>

          <div className="rounded-lg border border-border/60 bg-muted/20 p-3 text-sm">
            <span className="font-semibold text-muted-foreground">Resulting value: </span>
            <span className={resultingValue < 0 ? 'text-destructive font-bold' : 'font-bold text-foreground'}>
              {Number.isFinite(resultingValue) ? resultingValue : currentValue} {meter.unit}
            </span>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
            <Button type="submit" className="flex-1 font-bold" disabled={submitting || resultingValue < 0 || !isAmountValid}>
              {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Apply Adjustment
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
