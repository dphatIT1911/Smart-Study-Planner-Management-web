import { format, isToday, parseISO } from "date-fns";
import { vi } from "date-fns/locale";
import { Calendar as CalendarIcon, Plus } from "lucide-react";

import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";

export default function DayTasksModal({
  isOpen,
  onOpenChange,
  date,
  tasks = [],
  onAddTask,
  onTaskClick,
}) {
  if (!date) return null;

  const title = format(date, "EEEE, dd/MM/yyyy", { locale: vi });
  const isDateToday = isToday(date);

  const sortedTasks = [...tasks].sort((a, b) => {
    const aTime = a?.due_date ? parseISO(a.due_date).getTime() : 0;
    const bTime = b?.due_date ? parseISO(b.due_date).getTime() : 0;
    return aTime - bTime;
  });

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[720px] h-[85vh] p-0 overflow-hidden">
        <div className="flex flex-col h-full">
          <DialogHeader className="p-6 pb-4 border-b">
            <DialogTitle className="flex items-center justify-between gap-3">
              <span className="flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-indigo-600" />
                <span className="text-xl font-bold text-slate-900 capitalize">
                  {title}
                </span>
                {isDateToday && (
                  <span className="text-xs font-semibold px-2 py-1 rounded-full bg-indigo-50 text-indigo-700">
                    Hôm nay
                  </span>
                )}
              </span>
              <Button
                onClick={onAddTask}
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Thêm việc
              </Button>
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 min-h-0 overflow-y-auto p-6">
            {sortedTasks.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-500">
                Chưa có công việc nào trong ngày này.
              </div>
            ) : (
              <div className="space-y-2">
                {sortedTasks.map((task) => {
                  const isDone = task.status === "DONE";
                  const isOverdue = task.is_overdue && !isDone;

                    const statusLabels = {
                      'TODO': 'Cần làm',
                      'IN_PROGRESS': 'Đang làm',
                      'DONE': 'Hoàn thành'
                    };

                    return (
                      <button
                        key={task.id}
                        type="button"
                        onClick={() => onTaskClick?.(task)}
                        className="w-full text-left rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition-colors p-4 flex items-start gap-3"
                      >
                        <span
                          className="mt-1 w-2.5 h-2.5 rounded-full shrink-0"
                          style={{
                            backgroundColor: isDone
                              ? task.subject_color || "#94a3b8"
                              : "transparent",
                            borderColor: task.subject_color || "#94a3b8",
                            borderStyle: "solid",
                            borderWidth: isDone ? "0px" : "2px",
                          }}
                        />

                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <div
                                className={[
                                  "font-semibold truncate",
                                  isDone
                                    ? "line-through text-slate-400"
                                    : isOverdue
                                    ? "text-red-700"
                                    : "text-slate-900",
                                ].join(" ")}
                                title={task.title}
                              >
                                {task.title}
                              </div>
                              {task.subject_name && (
                                <div className="text-xs text-slate-500 truncate mt-0.5">
                                  {task.subject_name}
                                </div>
                              )}
                            </div>

                            <div className="shrink-0 flex items-center gap-2">
                              {isOverdue && (
                                <span className="text-xs font-semibold px-2 py-1 rounded-full bg-red-50 text-red-700">
                                  Quá hạn
                                </span>
                              )}
                              <span
                                className={[
                                  "text-xs font-semibold px-2 py-1 rounded-full",
                                  isDone
                                    ? "bg-emerald-50 text-emerald-700"
                                    : task.status === 'IN_PROGRESS'
                                    ? "bg-blue-50 text-blue-700"
                                    : "bg-slate-100 text-slate-700",
                                ].join(" ")}
                              >
                                {statusLabels[task.status] || task.status}
                              </span>
                            </div>
                          </div>

                        {task.description && (
                          <div className="text-sm text-slate-600 mt-2 line-clamp-2">
                            {task.description}
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

