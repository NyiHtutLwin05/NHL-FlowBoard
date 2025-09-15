import React, { useState } from "react";
import { Droppable, Draggable } from "@hello-pangea/dnd";
import { useDispatch } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import {
  type Column,
  type Task,
  type SortOption,
  type FilterOption,
} from "../../types/kanban";
import { addTask, updateColumn, deleteColumn } from "../../store/kanbanSlice";
import { getTasksByColumnId } from "@/utils/taskHelpers";
import { useToast } from "../../hooks/use-toast";
import KanbanTask from "./KanbanTask";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Card, CardContent, CardHeader } from "../ui/card";
import { Badge } from "../ui/badge";
import {
  Plus,
  MoreHorizontal,
  Edit2,
  Trash2,
  GripHorizontal,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";

interface KanbanColumnProps {
  column: Column;
  tasks: Record<string, Task>;
  index: number;
  searchQuery: string;
  sortBy: SortOption;
  filterBy: FilterOption;
}

const KanbanColumn: React.FC<KanbanColumnProps> = ({
  column,
  tasks,
  index,
  searchQuery,
  sortBy,
  filterBy,
}) => {
  const dispatch = useDispatch();
  const { toast } = useToast();
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState(column.title);
  const [showAddTask, setShowAddTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const columnTasks = getTasksByColumnId(
    tasks,
    column.taskIds,
    sortBy,
    filterBy,
    searchQuery
  );

  const handleTitleSave = () => {
    if (titleValue.trim() && titleValue.trim() !== column.title) {
      dispatch(
        updateColumn({
          columnId: column.id,
          updates: { title: titleValue.trim() },
        })
      );
      toast({
        title: "Column renamed",
        description: `Column has been renamed to "${titleValue.trim()}".`,
      });
    }
    setIsEditingTitle(false);
    setTitleValue(column.title);
  };

  const handleTitleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleTitleSave();
    } else if (e.key === "Escape") {
      setTitleValue(column.title);
      setIsEditingTitle(false);
    }
  };

  const handleAddTask = () => {
    if (newTaskTitle.trim()) {
      dispatch(
        addTask({
          columnId: column.id,
          title: newTaskTitle.trim(),
        })
      );
      toast({
        title: "Task created",
        description: "Your new task has been added successfully.",
      });
      setNewTaskTitle("");
      setShowAddTask(false);
    }
  };

  const handleAddTaskKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleAddTask();
    } else if (e.key === "Escape") {
      setNewTaskTitle("");
      setShowAddTask(false);
    }
  };

  const handleDeleteColumn = () => {
    dispatch(deleteColumn(column.id));
    toast({
      title: "Column deleted",
      description: `"${column.title}" column and its tasks have been deleted.`,
      variant: "destructive",
    });
    setIsDeleteDialogOpen(false);
  };

  return (
    <>
      <Draggable draggableId={column.id} index={index}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            className={`w-80 select-none ${
              snapshot.isDragging ? "rotate-2 scale-105" : ""
            }`}
          >
            <Card
              className={`kanban-column ${
                snapshot.isDragging ? "shadow-xl" : ""
              }`}
            >
              <div
                className="flex justify-center"
                {...provided.dragHandleProps}
              >
                <GripHorizontal className="h-4 w-4 text-slate-400" />
              </div>
              <CardHeader className="pb-3" {...provided.dragHandleProps}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 flex-1">
                    {isEditingTitle ? (
                      <Input
                        value={titleValue}
                        onChange={(e) => setTitleValue(e.target.value)}
                        onBlur={handleTitleSave}
                        onKeyDown={handleTitleKeyPress}
                        className="font-semibold border-none p-0 h-auto bg-transparent focus-visible:ring-0"
                        autoFocus
                      />
                    ) : (
                      <h3
                        className="font-semibold cursor-pointer hover:text-primary/80 transition-colors flex-1"
                        onClick={() => setIsEditingTitle(true)}
                      >
                        {column.title}
                      </h3>
                    )}
                    <Badge variant="secondary" className="text-xs">
                      {columnTasks.length}
                    </Badge>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setIsEditingTitle(true)}>
                        <Edit2 className="h-4 w-4 mr-2" />
                        Rename
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => setIsDeleteDialogOpen(true)}
                        className="text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>

              <CardContent className="pt-0">
                <Droppable droppableId={column.id} type="task">
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`space-y-3 min-h-[400px] transition-colors rounded-lg p-2 ${
                        snapshot.isDraggingOver
                          ? "bg-primary/5 border-2 border-primary/20 border-dashed"
                          : ""
                      }`}
                    >
                      <AnimatePresence>
                        {columnTasks.map((task, index) => (
                          <motion.div
                            key={task.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ delay: index * 0.05 }}
                          >
                            <KanbanTask task={task} index={index} />
                          </motion.div>
                        ))}
                      </AnimatePresence>
                      {provided.placeholder}

                      {showAddTask ? (
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="kanban-task"
                        >
                          <Input
                            value={newTaskTitle}
                            onChange={(e) => setNewTaskTitle(e.target.value)}
                            onKeyDown={handleAddTaskKeyPress}
                            onBlur={() => {
                              if (!newTaskTitle.trim()) {
                                setShowAddTask(false);
                              }
                            }}
                            placeholder="Enter task title..."
                            autoFocus
                          />
                          <div className="flex gap-2 mt-2">
                            <Button size="sm" onClick={handleAddTask}>
                              Add
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setNewTaskTitle("");
                                setShowAddTask(false);
                              }}
                            >
                              Cancel
                            </Button>
                          </div>
                        </motion.div>
                      ) : (
                        <Button
                          variant="ghost"
                          className="w-full border-2 border-dashed border-muted-foreground/25 hover:border-primary/50 hover:bg-primary/5 h-12"
                          onClick={() => setShowAddTask(true)}
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Add a task
                        </Button>
                      )}
                    </div>
                  )}
                </Droppable>
              </CardContent>
            </Card>
          </div>
        )}
      </Draggable>

      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Column</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the "{column.title}" column? This
              will also delete all {column.taskIds.length} tasks in this column.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteColumn}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Column
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default KanbanColumn;
