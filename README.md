# 🗂️ NHL Taskly – Kanban Board

A modern **Trello-like Kanban board** built with React, Redux Toolkit, and drag-and-drop support. It's designed to be smooth, minimal, and fully responsive with local persistence.

![Kanban Board](https://img.shields.io/badge/Kanban-Board-blue) ![React](https://img.shields.io/badge/React-18.2.0-blue) ![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue) ![Redux](https://img.shields.io/badge/Redux-Toolkit-purple)

---

## 🚀 Features

- 📌 **Drag & Drop** tasks and columns (powered by `@hello-pangea/dnd`)
- ➕ Add new columns dynamically
- ✏️ Reorder tasks & columns
- 🔍 Search, sort & filter tasks
- 💾 Auto-save to **localStorage**
- 🎨 Smooth animations with **Framer Motion**
- 📱 Responsive & modern UI (Tailwind + shadcn/ui + Radix primitives)
- 🔔 Toast notifications for feedback
- 🎯 TypeScript for type safety

---

## 🛠️ Tech Stack

- **React 19** + **Vite 7** (fast build & HMR)
- **Redux Toolkit** – state management
- **@hello-pangea/dnd** – drag & drop
- **React Hook Form** + **Zod** – forms & validation
- **Framer Motion** – animations
- **Radix UI** + **shadcn/ui** – accessible components
- **Tailwind CSS** – styling
- **TypeScript** – type safety
- **Lucide React** – icons

---

## 📦 Project Structure

---

## 🧩 Component Details

### KanbanBoard.tsx

The main component that orchestrates the entire Kanban board:

- Manages drag and drop operations through `DragDropContext`
- Renders columns with smooth animations using Framer Motion
- Handles column creation via a dialog interface
- Connects to Redux store for state management
- Implements auto-persistence to localStorage

Key functions:

- `handleDragEnd()`: Processes all drag and drop operations
- `handleAddColumn()`: Creates new columns with user-provided titles

### Other Components

- **KanbanColumn**: Renders a single column with its tasks
- **KanbanTask**: Displays an individual task card
- **KanbanHeader**: Contains search, filter, and sort controls
- **TaskModal**: Form for creating/editing tasks

---

## 🧠 State Management

The application uses Redux Toolkit for state management:

### kanbanSlice.ts

Manages:

- Board structure (columns, tasks, column order)
- Search query, sort, and filter options
- All CRUD operations for tasks and columns

Key actions:

- `moveTask`: Moves tasks between columns
- `reorderTask`: Reorders tasks within a column
- `reorderColumns`: Changes column order
- `addColumn`: Creates new columns

---

## 💾 Data Persistence

The `useLocalStorage` hook automatically:

1. Loads initial state from localStorage on app startup
2. Saves state to localStorage after every modification
3. Handles data validation and error recovery

---

## 🎨 UI/UX Features

- **Responsive Design**: Adapts to mobile and desktop screens
- **Smooth Animations**: Framer Motion for column/task animations
- **Modern Styling**: Tailwind CSS with custom gradients and shadows
- **Accessible Components**: Radix UI primitives throughout
- **Toast Notifications**: User feedback for actions

---

## 🔧 Installation & Setup

1. **Clone the repository**
   ```sh
   git clone https://github.com/NyiHtutLwin05/kanban.git
   cd nhl_taskly
   ```
