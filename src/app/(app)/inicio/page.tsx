import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { CircleCheck, CircleX, Inbox, Package, Send } from 'lucide-react';
import { getPerfil } from '@/core/auth/perfil.service';
import { HOME_PATH, NOTIFICACIONES_PATH } from '@/core/auth/routes';
import { requireSession } from '@/core/auth/session';
import { AppPageHeader } from '@/core/components/app-page-header';
import { AlertBanner } from '@/core/components/ui/alert-banner';
import { BarChart } from '@/core/components/ui/bar-chart';
import { Button } from '@/core/components/ui/button';
import { DonutChart } from '@/core/components/ui/donut-chart';
import { HorizontalBarChart } from '@/core/components/ui/horizontal-bar-chart';
import { APP_DESCRIPTION } from '@/core/config/app';
import { isApiException } from '@/core/http/api-error';
import { AnioFilter } from '@/features/tablero/components/anio-filter';
import { KpiCard } from '@/features/tablero/components/kpi-card';
import { ESTATUS_TABLERO, MESES_CORTOS, TABLERO_GRID, TABLERO_TITLE } from '@/features/tablero/constants';
import { tableroQuerySchema } from '@/features/tablero/schemas';
import { getResumenTablero } from '@/features/tablero/services/tablero.service';
import type { ResumenTablero } from '@/features/tablero/types';

export const metadata: Metadata = { title: TABLERO_TITLE };

interface InicioDashboardPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

/**
 * Primera pantalla (skill `dashboard-view`). El Tablero es un módulo más: si el backend no lo da en el menú (p. ej. al
 * notificador), se va a la primera pantalla que sí tiene, sin decidirlo por rol en el front.
 */
export default async function InicioDashboardPage({ searchParams }: InicioDashboardPageProps) {
  const [{ user }, perfil] = await Promise.all([requireSession(), getPerfil()]);

  if (!perfil.menu.some((modulo) => modulo.url === HOME_PATH)) {
    const primera = perfil.menu[0];
    if (primera) redirect(primera.url);
    // El login ya rechaza a quien no tiene módulos en este sistema; solo pasa si se los quitaron durante la sesión.
    return (
      <div className="flex min-h-full flex-col">
        <AppPageHeader title={`Hola, ${user.displayName}`} subtitle={APP_DESCRIPTION} />
        <div className="flex flex-col gap-8 p-8">
          <AlertBanner variant="info">
            Tu usuario ya no tiene pantallas en {perfil.sistema.nombre}. Solicita el acceso al administrador del SIAF.
          </AlertBanner>
        </div>
      </div>
    );
  }

  const { anio } = tableroQuerySchema.parse(await searchParams);
  let contenido: React.ReactNode;
  try {
    contenido = <Tablero resumen={await getResumenTablero(anio)} />;
  } catch (err) {
    if (!isApiException(err)) throw err;
    contenido = <AlertBanner variant="error">{err.error.message}</AlertBanner>;
  }

  return (
    <div className="flex min-h-full flex-col">
      <AppPageHeader
        title={TABLERO_TITLE}
        subtitle={`Hola, ${user.displayName}`}
        actions={
          <Button variant="outline" asChild>
            <Link href={NOTIFICACIONES_PATH}>Ir a la bandeja</Link>
          </Button>
        }
      />
      <div className="flex flex-col gap-8 p-8">{contenido}</div>
    </div>
  );
}

function Tablero({ resumen }: { resumen: ResumenTablero }) {
  const { porEstatus, paquetes } = resumen;

  return (
    <>
      <div className={TABLERO_GRID.kpis}>
        <KpiCard label="Por asignar" value={porEstatus.porAsignar} icon={Inbox} />
        <KpiCard label="Por notificar (en campo)" value={porEstatus.porNotificar} icon={Send} />
        <KpiCard label="Notificadas" value={porEstatus.notificado} icon={CircleCheck} />
        <KpiCard label="No entregadas" value={porEstatus.noEntregado} icon={CircleX} />
        <KpiCard label="Paquetes abiertos" value={paquetes.abiertos} icon={Package} />
      </div>

      <div className={TABLERO_GRID.graficas}>
        <DonutChart
          title="Notificaciones por estatus"
          totalLabel="Total"
          data={ESTATUS_TABLERO.map(({ key, label }) => ({ label, value: porEstatus[key] }))}
        />
        <div className="relative">
          <BarChart
            title="Notificadas por mes"
            description={`Notificaciones con resultado Notificado en ${resumen.anio}`}
            data={[...resumen.notificadasPorMes]}
            labels={[...MESES_CORTOS]}
          />
          <div className="absolute top-4 right-4">
            <AnioFilter value={resumen.anio} options={resumen.aniosDisponibles} />
          </div>
        </div>
      </div>

      <div className={TABLERO_GRID.graficasPorAsignar}>
        <HorizontalBarChart
          title="Por asignar por método"
          description="Órdenes de cartas invitación listas para notificar"
          data={resumen.porMetodo.map(({ clave, nombre, total }) => ({
            key: clave,
            label: clave,
            sublabel: nombre,
            value: total,
          }))}
        />
        <DonutChart
          title="Por asignar por prioridad"
          totalLabel="Total"
          data={resumen.porPrioridad.map(({ nombre, total }) => ({ label: nombre, value: total }))}
        />
      </div>
    </>
  );
}
