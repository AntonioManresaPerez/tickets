// Etiquetas y estilos de estados, prioridades y vencimiento (en español).

// Secciones independientes de la app.
export const SECTION_META = {
  ESCALAS_MEDICAS: {
    label: "Escalas médicas",
    short: "Escalas",
    accent: "bg-teal-500",
    badge: "bg-teal-50 text-teal-700 ring-teal-200 dark:bg-teal-900/30 dark:text-teal-300 dark:ring-teal-800",
  },
  PROGRAMACION: {
    label: "Programación",
    short: "Programación",
    accent: "bg-blue-500",
    badge: "bg-blue-50 text-blue-700 ring-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:ring-blue-800",
  },
} as const;

export type SectionKey = keyof typeof SECTION_META;

export const SECTION_ORDER: SectionKey[] = ["ESCALAS_MEDICAS", "PROGRAMACION"];

export const STATUS = {
  PENDING: {
    label: "Pendiente",
    dot: "bg-slate-400",
    solid: "bg-slate-500 hover:bg-slate-600",
    badge: "bg-slate-100 text-slate-700 ring-slate-200 dark:bg-slate-700 dark:text-slate-200 dark:ring-slate-600",
  },
  IN_PROGRESS: {
    label: "En progreso",
    dot: "bg-blue-500",
    solid: "bg-blue-600 hover:bg-blue-700",
    badge: "bg-blue-50 text-blue-700 ring-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:ring-blue-800",
  },
  PAUSED: {
    label: "Parada",
    dot: "bg-rose-500",
    solid: "bg-rose-600 hover:bg-rose-700",
    badge: "bg-rose-50 text-rose-700 ring-rose-200 dark:bg-rose-900/30 dark:text-rose-300 dark:ring-rose-800",
  },
  USER_REVIEW: {
    label: "Revisión usuario",
    dot: "bg-amber-500",
    solid: "bg-amber-500 hover:bg-amber-600",
    badge: "bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:ring-amber-800",
  },
  ADMIN_REVIEW: {
    label: "Revisión admin",
    dot: "bg-purple-500",
    solid: "bg-purple-600 hover:bg-purple-700",
    badge: "bg-purple-50 text-purple-700 ring-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:ring-purple-800",
  },
  DONE: {
    label: "Finalizada",
    dot: "bg-emerald-500",
    solid: "bg-emerald-600 hover:bg-emerald-700",
    badge: "bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:ring-emerald-800",
  },
} as const;

export type StatusKey = keyof typeof STATUS;

// Orden lineal del flujo. "PAUSED" queda fuera: es un estado lateral (pausa).
export const STATUS_ORDER: StatusKey[] = [
  "PENDING",
  "IN_PROGRESS",
  "USER_REVIEW",
  "ADMIN_REVIEW",
  "DONE",
];

// Columnas del tablero Kanban (incluye Parada).
export const BOARD_COLUMNS: StatusKey[] = [
  "PENDING",
  "IN_PROGRESS",
  "PAUSED",
  "USER_REVIEW",
  "ADMIN_REVIEW",
  "DONE",
];

export const SPRINT_STATUS = {
  PLANNED: {
    label: "Planificado",
    badge: "bg-slate-100 text-slate-600 ring-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:ring-slate-600",
  },
  ACTIVE: {
    label: "Activo",
    badge: "bg-blue-50 text-blue-700 ring-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:ring-blue-800",
  },
  COMPLETED: {
    label: "Completado",
    badge: "bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:ring-emerald-800",
  },
} as const;

export type SprintStatusKey = keyof typeof SPRINT_STATUS;

export const SPRINT_STATUS_ORDER: SprintStatusKey[] = ["PLANNED", "ACTIVE", "COMPLETED"];

export const PRIORITY = {
  LOW: {
    label: "Baja",
    icon: "↓",
    badge: "bg-slate-50 text-slate-600 ring-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:ring-slate-600",
  },
  MEDIUM: {
    label: "Media",
    icon: "→",
    badge: "bg-blue-50 text-blue-700 ring-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:ring-blue-800",
  },
  HIGH: {
    label: "Alta",
    icon: "↑",
    badge: "bg-orange-100 text-orange-700 ring-orange-300 dark:bg-orange-900/30 dark:text-orange-300 dark:ring-orange-800",
  },
  URGENT: {
    label: "Urgente",
    icon: "⚡",
    badge: "bg-red-100 text-red-700 ring-red-300 dark:bg-red-900/30 dark:text-red-300 dark:ring-red-800",
  },
} as const;

export type PriorityKey = keyof typeof PRIORITY;

export const PRIORITY_ORDER: PriorityKey[] = ["LOW", "MEDIUM", "HIGH", "URGENT"];

// Vencimiento por "cubos": sin fecha, hoy o esta semana.
export const DUE_BUCKET = {
  NONE: {
    label: "Sin fecha",
    badge: "bg-slate-50 text-slate-500 ring-slate-200 dark:bg-slate-700 dark:text-slate-400 dark:ring-slate-600",
  },
  TODAY: {
    label: "Hoy",
    badge: "bg-red-50 text-red-700 ring-red-200 dark:bg-red-900/30 dark:text-red-300 dark:ring-red-800",
  },
  WEEK: {
    label: "Esta semana",
    badge: "bg-indigo-50 text-indigo-700 ring-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300 dark:ring-indigo-800",
  },
} as const;

export type DueBucketKey = keyof typeof DUE_BUCKET;

export const DUE_BUCKET_ORDER: DueBucketKey[] = ["NONE", "TODAY", "WEEK"];

export const IDEA_STATUS = {
  OPEN: {
    label: "Abierta",
    badge: "bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:ring-amber-800",
  },
  PLANNED: {
    label: "Planificada",
    badge: "bg-blue-50 text-blue-700 ring-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:ring-blue-800",
  },
  DOING: {
    label: "En desarrollo",
    badge: "bg-indigo-50 text-indigo-700 ring-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300 dark:ring-indigo-800",
  },
  DONE: {
    label: "Implementada",
    badge: "bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:ring-emerald-800",
  },
  REJECTED: {
    label: "Descartada",
    badge: "bg-slate-100 text-slate-500 ring-slate-200 dark:bg-slate-700 dark:text-slate-400 dark:ring-slate-600",
  },
} as const;

export type IdeaStatusKey = keyof typeof IDEA_STATUS;

export const IDEA_STATUS_ORDER: IdeaStatusKey[] = ["OPEN", "PLANNED", "DOING", "DONE", "REJECTED"];

export const IDEA_CATEGORIES: Record<string, string> = {
  feature: "Nueva funcionalidad",
  improvement: "Mejora",
  design: "Diseño",
  performance: "Rendimiento",
  other: "Otro",
};
