import {
  type Task,
  type SortOption,
  type FilterOption,
  type TaskPriority,
} from "../types/kanban";

export const getPriorityWeight = (priority: TaskPriority): number => {
  const weights = { low: 1, medium: 2, high: 3, urgent: 4 };
  return weights[priority];
};

export const sortTasks = (tasks: Task[], sortBy: SortOption): Task[] => {
  if (sortBy === "none") return tasks;

  return [...tasks].sort((a, b) => {
    switch (sortBy) {
      case "priority":
        return getPriorityWeight(b.priority) - getPriorityWeight(a.priority);

      case "dueDate":
        if (!a.dueDate && !b.dueDate) return 0;
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();

      case "alphabetical":
        return a.title.localeCompare(b.title);

      case "created":
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

      default:
        return 0;
    }
  });
};

export const filterTasks = (
  tasks: Task[],
  filterBy: FilterOption,
  searchQuery: string
): Task[] => {
  let filtered = tasks;

  // Apply filter
  if (filterBy !== "all") {
    if (["low", "medium", "high", "urgent"].includes(filterBy)) {
      filtered = filtered.filter((task) => task.priority === filterBy);
    } else {
      filtered = filtered.filter((task) =>
        task.labels.includes(filterBy as any)
      );
    }
  }

  // Apply search
  if (searchQuery.trim()) {
    const query = searchQuery.toLowerCase().trim();
    filtered = filtered.filter(
      (task) =>
        task.title.toLowerCase().includes(query) ||
        task.description?.toLowerCase().includes(query) ||
        task.labels.some((label) => label.toLowerCase().includes(query))
    );
  }

  return filtered;
};

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = date.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Tomorrow";
  if (diffDays === -1) return "Yesterday";
  if (diffDays > 0) return `In ${diffDays} days`;
  return `${Math.abs(diffDays)} days ago`;
};

export const isOverdue = (dueDate: string): boolean => {
  return new Date(dueDate) < new Date();
};

export const getTasksByColumnId = (
  tasks: Record<string, Task>,
  taskIds: string[],
  sortBy: SortOption,
  filterBy: FilterOption,
  searchQuery: string
): Task[] => {
  const columnTasks = taskIds.map((id) => tasks[id]).filter(Boolean);
  const filtered = filterTasks(columnTasks, filterBy, searchQuery);
  return sortTasks(filtered, sortBy);
};
