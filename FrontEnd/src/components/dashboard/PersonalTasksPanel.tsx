//src/components/dashboard/PersonalTasksPanel.tsx
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Trash2, Plus, ListTodo, CalendarClock, CheckSquare, Square } from "lucide-react";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/redux/store";
import { editorialService } from "@/lib/services/editorialService";

interface Task {
  id: string;
  text: string;
  completed: boolean;
  createdAt: number;
}

const TASK_ID_RE = /^[0-9a-fA-F]{24}$/;

export function PersonalTasksPanel() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskText, setNewTaskText] = useState("");
  const [isLoaded, setIsLoaded] = useState(false);

  const token = useSelector((state: RootState) => state.auth.token);

  const loadTasks = useCallback(async () => {
    if (!token) {
      setIsLoaded(true);
      return;
    }
    try {
      const rows = await editorialService.listTasks();
      const mapped: Task[] = Array.isArray(rows)
        ? rows.map((t: any) => ({
            id: String(t.id || t._id || ""),
            text: String(t.title || t.text || ""),
            completed: Boolean(t.completed ?? t.isDone),
            createdAt: t.createdAt ? new Date(t.createdAt).getTime() : Date.now(),
          }))
        : [];
      setTasks(mapped);
    } catch {
      setTasks([]);
    } finally {
      setIsLoaded(true);
    }
  }, [token]);

  useEffect(() => {
    void loadTasks();
  }, [loadTasks]);

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newTaskText.trim();
    if (!trimmed) return;
    setNewTaskText("");

    try {
      const created = await editorialService.createTask({
        title: trimmed,
        dueCategory: "today",
        origin: "Manual",
      });
      const item: Task = {
        id: String(created.id || created._id || ""),
        text: String(created.title || trimmed),
        completed: Boolean(created.completed ?? created.isDone),
        createdAt: created.createdAt
          ? new Date(created.createdAt).getTime()
          : Date.now(),
      };
      setTasks((prev) => [item, ...prev]);
    } catch {
      void loadTasks();
    }
  };

  const toggleTask = async (id: string) => {
    const target = tasks.find((t) => t.id === id);
    if (!target) return;
    const nextCompleted = !target.completed;
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id ? { ...task, completed: nextCompleted } : task
      )
    );
    if (TASK_ID_RE.test(id)) {
      try {
        await editorialService.updateTask(id, {
          completed: nextCompleted,
          isDone: nextCompleted,
        });
      } catch {
        void loadTasks();
      }
    }
  };

  const deleteTask = async (id: string) => {
    setTasks((prev) => prev.filter((task) => task.id !== id));
    if (TASK_ID_RE.test(id)) {
      try {
        await editorialService.deleteTask(id);
      } catch {
        void loadTasks();
      }
    }
  };

  const activeTasksCount = tasks.filter((t) => !t.completed).length;

  if (!isLoaded) return <div className="h-[350px] bg-card border border-border rounded-sm shadow-sm animate-pulse" />;

  return (
    <div className="bg-card border border-border rounded-sm shadow-sm flex flex-col h-[350px] overflow-hidden">
      
      {/* Cabeçalho */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-muted/10">
        <div>
          <h2 className="text-sm font-semibold tracking-tight text-foreground flex items-center gap-2 uppercase">
            <ListTodo className="w-4 h-4 text-muted-foreground" />
            Minhas Tarefas
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            {activeTasksCount === 0 
              ? "Nenhuma pendência ativa." 
              : `${activeTasksCount} pendência${activeTasksCount > 1 ? 's' : ''}`}
          </p>
        </div>
      </div>

      {/* Input de Nova Tarefa (Minimalista) */}
      <div className="p-3 bg-background">
        <form onSubmit={handleAddTask} className="relative flex items-center gap-2">
          <input
            type="text"
            placeholder="Nova anotação..."
            value={newTaskText}
            onChange={(e) => setNewTaskText(e.target.value)}
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary shadow-sm"
          />
          <button 
            type="submit" 
            disabled={!newTaskText.trim()}
            className="h-9 px-3 flex items-center justify-center bg-secondary text-secondary-foreground border border-border rounded-md hover:bg-secondary/80 disabled:opacity-50 transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* Lista de Tarefas (Clean) */}
      <div className="flex-1 overflow-y-auto p-3 bg-muted/5 space-y-1.5 scrollbar-thin">
        {tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground opacity-50 gap-2 pb-5">
            <CalendarClock className="w-8 h-8 stroke-[1.5]" />
            <p className="text-xs font-medium">Lista vazia.</p>
          </div>
        ) : (
          tasks
            .sort((a, b) => Number(a.completed) - Number(b.completed) || b.createdAt - a.createdAt)
            .map((task) => (
            <div 
              key={task.id} 
              className={`group flex items-start gap-3 p-2.5 rounded-md transition-all ${task.completed ? 'opacity-50' : 'bg-background border border-border hover:border-muted-foreground/30 shadow-sm'}`}
            >
              <button onClick={() => toggleTask(task.id)} className="mt-0.5 flex-shrink-0 focus:outline-none text-muted-foreground hover:text-foreground transition-colors">
                {task.completed ? (
                  <CheckSquare className="w-4 h-4" />
                ) : (
                  <Square className="w-4 h-4" />
                )}
              </button>
              
              <span className={`flex-1 text-xs leading-relaxed transition-all ${task.completed ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
                {task.text}
              </span>

              <button 
                onClick={() => deleteTask(task.id)}
                className="opacity-0 group-hover:opacity-100 flex-shrink-0 p-1 text-muted-foreground hover:text-foreground transition-all focus:opacity-100"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))
        )}
      </div>

    </div>
  );
}