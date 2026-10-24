'use client';

import * as React from 'react';
import { Info } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/core/components/ui/alert-dialog';

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'default' | 'destructive';
  loading?: boolean;
  hideCancel?: boolean;
  onConfirm: () => void;
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  variant = 'default',
  loading = false,
  hideCancel = false,
  onConfirm,
}: ConfirmDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent size="sm" onOpenAutoFocus={(e) => e.preventDefault()}>
        <AlertDialogHeader className="gap-4">
          <Info className="size-7 text-content-high" strokeWidth={1.75} />
          <AlertDialogTitle className="text-[18px]">{title}</AlertDialogTitle>
        </AlertDialogHeader>
        {description && (
          <div className="px-6 pt-2">
            <AlertDialogDescription>{description}</AlertDialogDescription>
          </div>
        )}
        <AlertDialogFooter className="flex-nowrap">
          {!hideCancel && (
            <AlertDialogCancel
              className="flex-1"
              variant="primary-low"
              disabled={loading}
            >
              {cancelLabel}
            </AlertDialogCancel>
          )}
          <AlertDialogAction
            className="flex-1"
            variant={variant}
            disabled={loading}
            onClick={(e) => {
              e.preventDefault();
              onConfirm();
            }}
          >
            {loading ? 'Procesando...' : confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
