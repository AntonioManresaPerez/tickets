"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  CalendarDays,
} from "lucide-react";
import { StatusBadge } from "@/components/badges";
import type { StatusKey } from "@/lib/constants";

type Task = {
  id: number;
  title: string;
  status: StatusKey;
  dueDate: string | null;
  dueBucket: string;
};

const WEEKDAYS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
const MONTHS = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

type View = "month" | "week" | "day";

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function startOfWeek(d: Date) {
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  const start = new Date(d);
  start.setDate(d.getDate() + diff);
  start.setHours(0, 0, 0, 0);
  return start;
}

function addDays(d: Date, n: number) {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}

function getTasksForDay(tasks: Task[], day: Date, today: Date): Task[] {
  return tasks.filter((t) => {
    if (t.dueDate) {
      return isSameDay(new Date(t.dueDate), day);
    }
    if (t.dueBucket === "TODAY") return isSameDay(day, today);
    if (t.dueBucket === "WEEK") {
      const ws = startOfWeek(today);
      const we = addDays(ws, 6);
      return day >= ws && day <= we;
    }
    return false;
  });
}

function TaskChip({ task }: { task: Task }) {
  return (
    <Link
      href={`/tasks/${task.id}`}
      className="block truncate rounded px-1 py-0.5 text-xs font-medium text-blue-700 transition hover:bg-blue-100 dark:text-blue-300 dark:hover:bg-blue-900/30"
      title={task.title}
    >
      {task.title}
    </Link>
  );
}

function DayTaskList({ tasks, day }: { tasks: Task[]; day: Date }) {
  const d = day.getDate();
  const short = WEEKDAYS[(day.getDay() + 6) % 7];
  return (
    <div>
      <p className="mb-3 text-sm font-semibold text-slate-500 dark:text-slate-400">
        {short} {d} — {tasks.length} tarea{tasks.length !== 1 ? "s" : ""}
      </p>
      {tasks.length === 0 ? (
        <p className="text-sm text-slate-400">Sin tareas para este día.</p>
      ) : (
        <div className="space-y-2">
          {tasks.map((t) => (
            <Link
              key={t.id}
              href={`/tasks/${t.id}`}
              className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 bg-white px-4 py-3 text-sm shadow-sm transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700/50"
            >
              <span className="truncate font-medium text-slate-800 dark:text-slate-200">
                {t.title}
              </span>
              <StatusBadge status={t.status} />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export function CalendarView({ tasks }: { tasks: Task[] }) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [view, setView] = useState<View>("month");
  const [cursor, setCursor] = useState(new Date(today));
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);

  function prevPeriod() {
    if (view === "month") {
      setCursor((c) => new Date(c.getFullYear(), c.getMonth() - 1, 1));
    } else if (view === "week") {
      setCursor((c) => addDays(c, -7));
    } else {
      setCursor((c) => addDays(c, -1));
    }
    setSelectedDay(null);
  }

  function nextPeriod() {
    if (view === "month") {
      setCursor((c) => new Date(c.getFullYear(), c.getMonth() + 1, 1));
    } else if (view === "week") {
      setCursor((c) => addDays(c, 7));
    } else {
      setCursor((c) => addDays(c, 1));
    }
    setSelectedDay(null);
  }

  function goToday() {
    setCursor(new Date(today));
    setSelectedDay(null);
  }

  // ---- Month view ----
  function renderMonth() {
    const year = cursor.getFullYear();
    const month = cursor.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    // Monday-based grid
    const startOffset = (firstDay.getDay() + 6) % 7;
    const cells: (Date | null)[] = [];
    for (let i = 0; i < startOffset; i++) cells.push(null);
    for (let d = 1; d <= lastDay.getDate(); d++) cells.push(new Date(year, month, d));
    while (cells.length % 7 !== 0) cells.push(null);

    return (
      <div>
        <div className="grid grid-cols-7 border-b border-slate-200 dark:border-slate-700">
          {WEEKDAYS.map((w) => (
            <div
              key={w}
              className="py-2 text-center text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500"
            >
              {w}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 divide-x divide-y divide-slate-100 dark:divide-slate-700/50">
          {cells.map((day, i) => {
            if (!day) {
              return (
                <div key={`empty-${i}`} className="min-h-[90px] bg-slate-50/50 dark:bg-slate-800/30" />
              );
            }
            const dayTasks = getTasksForDay(tasks, day, today);
            const isToday = isSameDay(day, today);
            const isSelected = selectedDay && isSameDay(day, selectedDay);
            const isOtherMonth = day.getMonth() !== month;
            return (
              <div
                key={day.toISOString()}
                onClick={() => setSelectedDay(isSelected ? null : day)}
                className={`min-h-[90px] cursor-pointer p-1.5 transition ${
                  isSelected
                    ? "bg-blue-50 dark:bg-blue-900/20"
                    : "hover:bg-slate-50 dark:hover:bg-slate-700/30"
                } ${isOtherMonth ? "opacity-40" : ""}`}
              >
                <div className="mb-1 flex justify-end">
                  <span
                    className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold ${
                      isToday
                        ? "bg-blue-600 text-white"
                        : "text-slate-600 dark:text-slate-400"
                    }`}
                  >
                    {day.getDate()}
                  </span>
                </div>
                <div className="space-y-0.5">
                  {dayTasks.slice(0, 3).map((t) => (
                    <TaskChip key={t.id} task={t} />
                  ))}
                  {dayTasks.length > 3 && (
                    <p className="pl-1 text-xs text-slate-400">+{dayTasks.length - 3} más</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        {selectedDay && (
          <div className="border-t border-slate-200 p-5 dark:border-slate-700">
            <DayTaskList tasks={getTasksForDay(tasks, selectedDay, today)} day={selectedDay} />
          </div>
        )}
      </div>
    );
  }

  // ---- Week view ----
  function renderWeek() {
    const ws = startOfWeek(cursor);
    const days = Array.from({ length: 7 }, (_, i) => addDays(ws, i));
    return (
      <div>
        <div className="grid grid-cols-7 border-b border-slate-200 dark:border-slate-700">
          {days.map((day) => {
            const isToday = isSameDay(day, today);
            const isSelected = selectedDay && isSameDay(day, selectedDay);
            const dayTasks = getTasksForDay(tasks, day, today);
            return (
              <div
                key={day.toISOString()}
                onClick={() => setSelectedDay(isSelected ? null : day)}
                className={`cursor-pointer border-r border-slate-100 p-3 transition last:border-r-0 dark:border-slate-700/50 ${
                  isSelected
                    ? "bg-blue-50 dark:bg-blue-900/20"
                    : "hover:bg-slate-50 dark:hover:bg-slate-700/30"
                }`}
              >
                <p className="text-center text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
                  {WEEKDAYS[(day.getDay() + 6) % 7]}
                </p>
                <div className="my-2 flex justify-center">
                  <span
                    className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${
                      isToday
                        ? "bg-blue-600 text-white"
                        : "text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    {day.getDate()}
                  </span>
                </div>
                <div className="space-y-1">
                  {dayTasks.slice(0, 2).map((t) => (
                    <TaskChip key={t.id} task={t} />
                  ))}
                  {dayTasks.length > 2 && (
                    <p className="pl-1 text-xs text-slate-400">+{dayTasks.length - 2}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        {selectedDay && (
          <div className="border-t border-slate-200 p-5 dark:border-slate-700">
            <DayTaskList tasks={getTasksForDay(tasks, selectedDay, today)} day={selectedDay} />
          </div>
        )}
      </div>
    );
  }

  // ---- Day view ----
  function renderDay() {
    const dayTasks = getTasksForDay(tasks, cursor, today);
    const isToday = isSameDay(cursor, today);
    return (
      <div className="p-5">
        <div className="mb-4 flex items-center gap-3">
          <div
            className={`flex h-12 w-12 items-center justify-center rounded-full text-lg font-bold ${
              isToday ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300"
            }`}
          >
            {cursor.getDate()}
          </div>
          <div>
            <p className="font-semibold text-slate-800 dark:text-slate-200">
              {WEEKDAYS[(cursor.getDay() + 6) % 7]}, {cursor.getDate()} de{" "}
              {MONTHS[cursor.getMonth()]}
            </p>
            {isToday && (
              <p className="text-xs font-medium text-blue-600 dark:text-blue-400">Hoy</p>
            )}
          </div>
        </div>
        <DayTaskList tasks={dayTasks} day={cursor} />
      </div>
    );
  }

  function headerTitle() {
    if (view === "month") {
      return `${MONTHS[cursor.getMonth()]} ${cursor.getFullYear()}`;
    }
    if (view === "week") {
      const ws = startOfWeek(cursor);
      const we = addDays(ws, 6);
      if (ws.getMonth() === we.getMonth()) {
        return `${ws.getDate()}–${we.getDate()} ${MONTHS[ws.getMonth()]} ${ws.getFullYear()}`;
      }
      return `${ws.getDate()} ${MONTHS[ws.getMonth()]} – ${we.getDate()} ${MONTHS[we.getMonth()]} ${we.getFullYear()}`;
    }
    return `${cursor.getDate()} de ${MONTHS[cursor.getMonth()]} ${cursor.getFullYear()}`;
  }

  const allDayTasks = tasks.filter((t) => {
    if (t.dueDate || t.dueBucket !== "NONE") return true;
    return false;
  });

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-4 py-3 dark:border-slate-700">
        <div className="flex items-center gap-2">
          <button
            onClick={prevPeriod}
            className="rounded-lg p-1.5 text-slate-500 transition hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={nextPeriod}
            className="rounded-lg p-1.5 text-slate-500 transition hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          <button
            onClick={goToday}
            className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 dark:border-slate-600 dark:text-slate-400 dark:hover:bg-slate-700"
          >
            Hoy
          </button>
          <h2 className="ml-1 text-sm font-semibold text-slate-800 dark:text-slate-200">
            {headerTitle()}
          </h2>
        </div>

        <div className="flex rounded-lg border border-slate-200 dark:border-slate-600">
          {(["month", "week", "day"] as View[]).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`px-3 py-1.5 text-xs font-semibold transition first:rounded-l-lg last:rounded-r-lg ${
                view === v
                  ? "bg-blue-600 text-white"
                  : "text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-700"
              }`}
            >
              {v === "month" ? "Mes" : v === "week" ? "Semana" : "Día"}
            </button>
          ))}
        </div>
      </div>

      {/* Calendar body */}
      {view === "month" && renderMonth()}
      {view === "week" && renderWeek()}
      {view === "day" && renderDay()}

      {/* No tasks hint */}
      {allDayTasks.length === 0 && (
        <div className="border-t border-dashed border-slate-200 p-6 text-center dark:border-slate-700">
          <CalendarDays className="mx-auto mb-2 h-8 w-8 text-slate-300 dark:text-slate-600" />
          <p className="text-sm text-slate-400 dark:text-slate-500">
            Asigna una fecha concreta a tus tareas para verlas en el calendario.
          </p>
        </div>
      )}
    </div>
  );
}
