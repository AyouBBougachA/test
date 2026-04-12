import React from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './Button';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  className?: string;
  footer?: React.ReactNode;
}

export function Modal({ isOpen, onClose, title, children, className, footer }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/30 backdrop-blur-sm animate-in fade-in duration-200 p-4">
      <div 
        className={cn(
          "w-full max-w-lg bg-card rounded-xl shadow-2xl border border-border overflow-hidden slide-in-from-bottom-4 flex flex-col",
          className
        )}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/50 bg-muted/20">
          <h2 className="text-lg font-bold tracking-tight text-foreground">
            {title}
          </h2>
          <button 
            onClick={onClose} 
            className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-md hover:bg-muted"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          {children}
        </div>

        {footer && (
          <div className="px-6 py-4 bg-muted/30 border-t border-border/50 flex justify-end gap-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
