import React from "react";
import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import {
  type Task,
  type TaskPriority,
  type TaskLabel,
} from "../../types/kanban";
import { updateTask } from "../../store/kanbanSlice";
import { formatDate } from "@/utils/taskHelpers";
import { useToast } from "../../hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Calendar, Clock, Flag, Save, X } from "lucide-react";

interface TaskModalProps {
  task: Task;
  isOpen: boolean;
  onClose: () => void;
}

interface FormData {
  title: string;
  description: string;
  priority: TaskPriority;
  dueDate: string;
}

const priorityOptions: { value: TaskPriority; label: string; color: string }[] =
  [
    { value: "low", label: "Low", color: "text-blue-600" },
    { value: "medium", label: "Medium", color: "text-yellow-600" },
    { value: "high", label: "High", color: "text-orange-600" },
    { value: "urgent", label: "Urgent", color: "text-red-600" },
  ];

const TaskModal: React.FC<TaskModalProps> = ({ task, isOpen, onClose }) => {
  const dispatch = useDispatch();
  const { toast } = useToast();

  const form = useForm<FormData>({
    defaultValues: {
      title: task.title,
      description: task.description || "",
      priority: task.priority,
      dueDate: task.dueDate || "",
    },
  });

  const onSubmit = (data: FormData) => {
    dispatch(
      updateTask({
        taskId: task.id,
        updates: {
          title: data.title,
          description: data.description,
          priority: data.priority,
          dueDate: data.dueDate || undefined,
        },
      })
    );

    toast({
      title: "Task updated",
      description: "Your task has been successfully updated.",
    });

    onClose();
  };

  const currentPriority = priorityOptions.find(
    (p) => p.value === task.priority
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Flag className="w-5 h-5" />
            Edit Task
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              rules={{ required: "Title is required" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter task title..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter task description..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="priority"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Flag className="w-4 h-4" />
                    Priority
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {priorityOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          <div className="flex items-center gap-2">
                            <Flag className={`w-3 h-3 ${option.color}`} />
                            <span className="capitalize">{option.label}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="dueDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Due Date
                  </FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {task.labels.length > 0 && (
              <div>
                <FormLabel className="text-sm font-medium">Labels</FormLabel>
                <div className="flex flex-wrap gap-2 mt-2">
                  {task.labels.map((label) => (
                    <Badge
                      key={label}
                      className={`task-label ${label} text-xs`}
                    >
                      {label}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Clock className="w-3 h-3" />
              <span>Created {formatDate(task.createdAt)}</span>
            </div>

            <div className="flex gap-2 pt-4">
              <Button type="submit" className="flex-1">
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
              <Button type="button" variant="outline" onClick={onClose}>
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default TaskModal;
