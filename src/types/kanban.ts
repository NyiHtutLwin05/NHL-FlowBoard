export type TaskPriority = "low" | "medium" | "high" | "urgent";
export type TaskLabel = "blue" | "green" | "amber" | "red" | "purple" | "pink";

export interface Task {
  id: string;
  title: string;
  description?: string;
  labels: TaskLabel[];
  priority: TaskPriority;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Column {
  id: string;
  title: string;
  taskIds: string[];
  color?: string;
}

export interface KanbanBoard {
  id: string;
  title: string;
  columns: Record<string, Column>;
  tasks: Record<string, Task>;
  columnOrder: string[];
  createdAt: string;
  updatedAt: string;
}

export interface DragResult {
  draggableId: string;
  type: string;
  source: {
    droppableId: string;
    index: number;
  };
  destination?: {
    droppableId: string;
    index: number;
  } | null;
  reason: "DROP" | "CANCEL";
}

export type SortOption =
  | "none"
  | "priority"
  | "dueDate"
  | "alphabetical"
  | "created";
export type FilterOption = "all" | TaskLabel | TaskPriority;
