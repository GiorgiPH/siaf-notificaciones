import { TableSkeleton } from '@/core/components/ui/table-skeleton';

export default function NotificacionesLoading() {
  return (
    <div className="flex flex-col gap-6 p-8">
      <TableSkeleton columns={5} headers={['Num. Orden', 'Fecha Oficio', 'Domicilio', 'Estatus', 'Acciones']} />
    </div>
  );
}
