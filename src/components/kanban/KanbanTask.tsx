import React, { useState } from "react";
import { Draggable } from "@hello-pangea/dnd";
import { useDispatch } from "react-redux";
import { type Task, type TaskPriority } from "../../types/kanban";
import { updateTask, deleteTask } from "../../store/kanbanSlice";
import { formatDate, isOverdue } from "../../utils/taskHelpers";
import { useToast } from "../../hooks/use-toast";
import { Card, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import TaskModal from "./TaskModal";
import {
  Calendar,
  Edit2,
  Trash2,
  MoreHorizontal,
  AlertCircle,
  Flag,
  GripVertical,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

interface KanbanTaskProps {
  task: Task;
  index: number;
}

const priorityColors: Record<TaskPriority, string> = {
  low: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  medium:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
  high: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
  urgent: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
};

const priorityIcons: Record<TaskPriority, React.ReactNode> = {
  low: <Flag className="w-3 h-3" />,
  medium: <Flag className="w-3 h-3" />,
  high: <Flag className="w-3 h-3" />,
  urgent: <AlertCircle className="w-3 h-3" />,
};

const KanbanTask: React.FC<KanbanTaskProps> = ({ task, index }) => {
  const dispatch = useDispatch();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [editDescription, setEditDescription] = useState(
    task.description || ""
  );

  const handleSave = () => {
    dispatch(
      updateTask({
        taskId: task.id,
        updates: {
          title: editTitle.trim() || task.title,
          description: editDescription.trim(),
        },
      })
    );
    toast({
      title: "Task updated",
      description: "Your task has been successfully updated.",
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditTitle(task.title);
    setEditDescription(task.description || "");
    setIsEditing(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && e.ctrlKey) {
      handleSave();
    } else if (e.key === "Escape") {
      handleCancel();
    }
  };

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      dispatch(deleteTask(task.id));
      toast({
        title: "Task deleted",
        description: "Your task has been successfully deleted.",
        variant: "destructive",
      });
    }
  };

  const isTaskOverdue = task.dueDate ? isOverdue(task.dueDate) : false;

  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className="mb-2"
        >
          <Card
            className={`kanban-task group ${
              snapshot.isDragging ? "dragging shadow-2xl rotate-2" : ""
            } ${isTaskOverdue ? "border-destructive/50" : ""}`}
          >
            <CardContent className="p-4">
              {isEditing ? (
                <div className="space-y-3">
                  <Input
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    onKeyDown={handleKeyPress}
                    className="font-medium"
                    autoFocus
                  />
                  <Textarea
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder="Add description..."
                    className="min-h-[80px] text-sm"
                  />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={handleSave}>
                      Save
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleCancel}>
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div
                      {...provided.dragHandleProps}
                      className="cursor-grab active:cursor-grabbing mr-1 mt-0.5 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <GripVertical className="h-4 w-4" />
                    </div>

                    <h4 className="font-medium text-sm leading-5 cursor-pointer hover:text-primary/80 transition-colors flex-1">
                      {task.title}
                    </h4>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 opacity-70 group-hover:opacity-100 transition-opacity"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setIsModalOpen(true)}>
                          <Edit2 className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={handleDelete}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <TaskModal
                    task={task}
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onEdit={() => {
                      setIsModalOpen(false);
                      setIsEditing(true);
                    }}
                    onDelete={handleDelete}
                  />

                  {task.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {task.description}
                    </p>
                  )}

                  {task.labels.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {task.labels.map((label) => (
                        <Badge
                          key={label}
                          variant="secondary"
                          className="text-xs"
                        >
                          {label}
                        </Badge>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1">
                      <Badge
                        variant="secondary"
                        className={`${
                          priorityColors[task.priority]
                        } flex items-center gap-1 text-xs`}
                      >
                        {priorityIcons[task.priority]}
                        <span className="ml-1 capitalize">{task.priority}</span>
                      </Badge>
                    </div>

                    {task.dueDate && (
                      <div
                        className={`flex items-center gap-1 ${
                          isTaskOverdue
                            ? "text-destructive font-medium"
                            : "text-muted-foreground"
                        }`}
                      >
                        <Calendar className="w-3 h-3" />
                        <span>{formatDate(task.dueDate)}</span>
                        {isTaskOverdue && (
                          <AlertCircle className="w-3 h-3 ml-1" />
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </Draggable>
  );
};

export default KanbanTask;
