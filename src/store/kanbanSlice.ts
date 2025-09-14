import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { v4 as uuidv4 } from "uuid";

import {
  type KanbanBoard,
  type Task,
  type Column,
  type TaskPriority,
  type TaskLabel,
  type SortOption,
  type FilterOption,
} from "../types/kanban";

interface KanbanState {
  board: KanbanBoard;
  searchQuery: string;
  sortBy: SortOption;
  filterBy: FilterOption;
  isLoading: boolean;
  error: string | null;
}

const initialBoard: KanbanBoard = {
  id: "default-board",
  title: "NHL Taskly",
  columns: {
    todo: {
      id: "todo",
      title: "To Do",
      taskIds: [],
      color: "blue",
    },
    progress: {
      id: "progress",
      title: "In Progress",
      taskIds: [],
      color: "amber",
    },
    done: {
      id: "done",
      title: "Done",
      taskIds: [],
      color: "green",
    },
  },
  tasks: {},
  columnOrder: ["todo", "progress", "done"],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

// Load from localStorage if available
const loadBoardFromStorage = (): KanbanBoard => {
  try {
    const saved = localStorage.getItem("kanban-board");
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (error) {
    console.warn("Failed to load board from localStorage:", error);
  }
  return initialBoard;
};

const initialState: KanbanState = {
  board: loadBoardFromStorage(),
  searchQuery: "",
  sortBy: "none",
  filterBy: "all",
  isLoading: false,
  error: null,
};

const kanbanSlice = createSlice({
  name: "kanban",
  initialState,
  reducers: {
    // Task actions
    addTask: (
      state,
      action: PayloadAction<{
        columnId: string;
        title: string;
        description?: string;
        priority?: TaskPriority;
        labels?: TaskLabel[];
        dueDate?: string;
      }>
    ) => {
      const {
        columnId,
        title,
        description = "",
        priority = "medium",
        labels = [],
        dueDate,
      } = action.payload;
      const taskId = uuidv4();
      const now = new Date().toISOString();

      const newTask: Task = {
        id: taskId,
        title,
        description,
        labels,
        priority,
        dueDate,
        createdAt: now,
        updatedAt: now,
      };

      state.board.tasks[taskId] = newTask;
      state.board.columns[columnId].taskIds.push(taskId);
      state.board.updatedAt = now;
    },

    updateTask: (
      state,
      action: PayloadAction<{
        taskId: string;
        updates: Partial<Omit<Task, "id" | "createdAt">>;
      }>
    ) => {
      const { taskId, updates } = action.payload;
      if (state.board.tasks[taskId]) {
        state.board.tasks[taskId] = {
          ...state.board.tasks[taskId],
          ...updates,
          updatedAt: new Date().toISOString(),
        };
        state.board.updatedAt = new Date().toISOString();
      }
    },

    deleteTask: (state, action: PayloadAction<string>) => {
      const taskId = action.payload;

      // Remove from all columns
      Object.values(state.board.columns).forEach((column) => {
        column.taskIds = column.taskIds.filter((id) => id !== taskId);
      });

      // Remove from tasks
      delete state.board.tasks[taskId];
      state.board.updatedAt = new Date().toISOString();
    },

    moveTask: (
      state,
      action: PayloadAction<{
        taskId: string;
        sourceColumnId: string;
        destinationColumnId: string;
        sourceIndex: number;
        destinationIndex: number;
      }>
    ) => {
      const {
        taskId,
        sourceColumnId,
        destinationColumnId,
        sourceIndex,
        destinationIndex,
      } = action.payload;

      // Remove from source
      state.board.columns[sourceColumnId].taskIds.splice(sourceIndex, 1);

      // Add to destination
      state.board.columns[destinationColumnId].taskIds.splice(
        destinationIndex,
        0,
        taskId
      );

      state.board.updatedAt = new Date().toISOString();
    },

    reorderTask: (
      state,
      action: PayloadAction<{
        columnId: string;
        sourceIndex: number;
        destinationIndex: number;
      }>
    ) => {
      const { columnId, sourceIndex, destinationIndex } = action.payload;
      const column = state.board.columns[columnId];
      const [removed] = column.taskIds.splice(sourceIndex, 1);
      column.taskIds.splice(destinationIndex, 0, removed);
      state.board.updatedAt = new Date().toISOString();
    },

    // Column actions
    addColumn: (
      state,
      action: PayloadAction<{
        title: string;
        color?: string;
      }>
    ) => {
      const { title, color = "blue" } = action.payload;
      const columnId = uuidv4();
      const now = new Date().toISOString();

      const newColumn: Column = {
        id: columnId,
        title,
        taskIds: [],
        color,
      };

      state.board.columns[columnId] = newColumn;
      state.board.columnOrder.push(columnId);
      state.board.updatedAt = now;
    },

    updateColumn: (
      state,
      action: PayloadAction<{
        columnId: string;
        updates: Partial<Omit<Column, "id" | "taskIds">>;
      }>
    ) => {
      const { columnId, updates } = action.payload;
      if (state.board.columns[columnId]) {
        state.board.columns[columnId] = {
          ...state.board.columns[columnId],
          ...updates,
        };
        state.board.updatedAt = new Date().toISOString();
      }
    },

    deleteColumn: (state, action: PayloadAction<string>) => {
      const columnId = action.payload;
      const column = state.board.columns[columnId];

      if (column) {
        // Delete all tasks in the column
        column.taskIds.forEach((taskId) => {
          delete state.board.tasks[taskId];
        });

        // Remove column
        delete state.board.columns[columnId];
        state.board.columnOrder = state.board.columnOrder.filter(
          (id) => id !== columnId
        );
        state.board.updatedAt = new Date().toISOString();
      }
    },

    reorderColumns: (
      state,
      action: PayloadAction<{
        sourceIndex: number;
        destinationIndex: number;
      }>
    ) => {
      const { sourceIndex, destinationIndex } = action.payload;
      const [removed] = state.board.columnOrder.splice(sourceIndex, 1);
      state.board.columnOrder.splice(destinationIndex, 0, removed);
      state.board.updatedAt = new Date().toISOString();
    },

    // UI actions
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },

    setSortBy: (state, action: PayloadAction<SortOption>) => {
      state.sortBy = action.payload;
    },

    setFilterBy: (state, action: PayloadAction<FilterOption>) => {
      state.filterBy = action.payload;
    },

    // Board actions
    updateBoardTitle: (state, action: PayloadAction<string>) => {
      state.board.title = action.payload;
      state.board.updatedAt = new Date().toISOString();
    },

    resetBoard: (state) => {
      state.board = initialBoard;
      state.searchQuery = "";
      state.sortBy = "none";
      state.filterBy = "all";
    },

    loadBoard: (state, action: PayloadAction<KanbanBoard>) => {
      state.board = action.payload;
    },
  },
});

export const {
  addTask,
  updateTask,
  deleteTask,
  moveTask,
  reorderTask,
  addColumn,
  updateColumn,
  deleteColumn,
  reorderColumns,
  setSearchQuery,
  setSortBy,
  setFilterBy,
  updateBoardTitle,
  resetBoard,
  loadBoard,
} = kanbanSlice.actions;

export default kanbanSlice.reducer;
