// Etiquetas y estilos de estados, prioridades y vencimiento (en español).

export const STATUS = {
  PENDING: {
    label: "Pendiente",
    dot: "bg-slate-400",
    solid: "bg-slate-500 hover:bg-slate-600",
    badge: "bg-slate-100 text-slate-700 ring-slate-200",
  },
  IN_PROGRESS: {
    label: "En progreso",
    dot: "bg-blue-500",
    solid: "bg-blue-600 hover:bg-blue-700",
    badge: "bg-blue-50 text-blue-700 ring-blue-200",
  },
  USER_REVIEW: {
    label: "Revisión usuario",
    dot: "bg-amber-500",
    solid: "bg-amber-500 hover:bg-amber-600",
    badge: "bg-amber-50 text-amber-700 ring-amber-200",
  },
  ADMIN_REVIEW: {
    label: "Revisión admin",
    dot: "bg-purple-500",
    solid: "bg-purple-600 hover:bg-purple-700",
    badge: "bg-purple-50 text-purple-700 ring-purple-200",
  },
  DONE: {
    label: "Finalizada",
    dot: "bg-emerald-500",
    solid: "bg-emerald-600 hover:bg-emerald-700",
    badge: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  },
} as const;

export type StatusKey = keyof typeof STATUS;

export const STATUS_ORDER: StatusKey[] = [
  "PENDING",
  "IN_PROGRESS",
  "USER_REVIEW",
  "ADMIN_REVIEW",
  "DONE",
];

export const PRIORITY = {
  LOW: {
    label: "Baja",
    icon: "↓",
    badge: "bg-slate-50 text-slate-600 ring-slate-200",
  },
  MEDIUM: {
    label: "Media",
    icon: "→",
    badge: "bg-blue-50 text-blue-700 ring-blue-200",
  },
  HIGH: {
    label: "Alta",
    icon: "↑",
    badge: "bg-orange-50 text-orange-700 ring-orange-200",
  },
  URGENT: {
    label: "Urgente",
    icon: "⚡",
    badge: "bg-red-50 text-red-700 ring-red-200",
  },
} as const;

export type PriorityKey = keyof typeof PRIORITY;

export const PRIORITY_ORDER: PriorityKey[] = ["LOW", "MEDIUM", "HIGH", "URGENT"];

// Vencimiento por "cubos": sin fecha, hoy o esta semana.
export const DUE_BUCKET = {
  NONE: {
    label: "Sin fecha",
    badge: "bg-slate-50 text-slate-500 ring-slate-200",
  },
  TODAY: {
    label: "Hoy",
    badge: "bg-red-50 text-red-700 ring-red-200",
  },
  WEEK: {
    label: "Esta semana",
    badge: "bg-indigo-50 text-indigo-700 ring-indigo-200",
  },
} as const;

export type DueBucketKey = keyof typeof DUE_BUCKET;

export const DUE_BUCKET_ORDER: DueBucketKey[] = ["NONE", "TODAY", "WEEK"];
