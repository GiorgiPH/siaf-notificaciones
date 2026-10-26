'use client';

import { AlertBanner } from '@/core/components/ui/alert-banner';
import { Button } from '@/core/components/ui/button';

/** Error no controlado dentro de la app (p. ej. el backend no responde). El detalle real queda en el log del servidor. */
export default function AppError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="flex flex-col items-start gap-4 p-4 md:p-8">
      <AlertBanner variant="error">No se pudo cargar esta sección. Intenta de nuevo en unos momentos.</AlertBanner>
      <Button variant="outline" onClick={reset}>
        Reintentar
      </Button>
    </div>
  );
}
