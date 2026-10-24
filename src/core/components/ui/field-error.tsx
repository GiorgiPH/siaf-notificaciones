import { AlertCircle } from 'lucide-react';

interface FieldErrorProps {
  message?: string;
  className?: string;
}

export function FieldError({ message, className }: FieldErrorProps) {
  if (!message) return null;
  return (
    <p
      className={`mt-1 flex items-center gap-1.5 text-xs font-light text-support-error ${className ?? ''}`}
    >
      <AlertCircle size={14} strokeWidth={1.75} className="shrink-0" />
      <span>{message}</span>
    </p>
  );
}
