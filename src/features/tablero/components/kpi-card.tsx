import type { LucideIcon } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/core/components/ui/avatar';
import { Card } from '@/core/components/ui/card';

interface KpiCardProps {
  label: string;
  value: number;
  icon: LucideIcon;
}

/** Métrica del tablero: composición estándar del proyecto (skill `dashboard-view`), `Card` + `Avatar` con ícono. */
export function KpiCard({ label, value, icon: Icon }: KpiCardProps) {
  return (
    <Card className="flex flex-col gap-2 p-6">
      <p className="ds-body-sm text-content-low">{label}</p>
      <div className="flex items-center justify-between">
        <span className="ds-heading-sm text-accent-primary">{value.toLocaleString('es-MX')}</span>
        <Avatar size="lg" className="border border-accent-primary-low">
          <AvatarFallback className="bg-bg-surface-low text-accent-primary">
            <Icon className="size-5" />
          </AvatarFallback>
        </Avatar>
      </div>
    </Card>
  );
}
