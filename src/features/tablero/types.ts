/** Total de una categoría (método de revisión, prioridad). */
export interface ConteoCategoria {
  readonly clave: string;
  readonly nombre: string;
  readonly total: number;
}

/** Espejo de `ConsultarResumenResponseDTO` (`GET /notificaciones-campo/consultarResumen`). */
export interface ResumenTablero {
  readonly anio: number;
  /** Del más reciente al más antiguo. */
  readonly aniosDisponibles: readonly number[];
  readonly porEstatus: {
    readonly porAsignar: number;
    readonly porNotificar: number;
    readonly notificado: number;
    readonly noEntregado: number;
  };
  readonly paquetes: {
    readonly programados: number;
    readonly abiertos: number;
    readonly cerrados: number;
  };
  /** 12 valores, enero a diciembre. */
  readonly notificadasPorMes: readonly number[];
  readonly porMetodo: readonly ConteoCategoria[];
  readonly porPrioridad: readonly ConteoCategoria[];
}
