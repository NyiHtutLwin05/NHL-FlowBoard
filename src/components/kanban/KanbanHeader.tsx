import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";
import { type RootState } from "../../store";
import {
  setSearchQuery,
  setSortBy,
  setFilterBy,
  updateBoardTitle,
  addTask,
} from "../../store/kanbanSlice";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Badge } from "../ui/badge";
import { Search, SortAsc, Filter, Settings, Plus } from "lucide-react";
import {
  type SortOption,
  type FilterOption,
  type TaskPriority,
} from "../../types/kanban";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Textarea } from "../ui/textarea";
import { useToast } from "../../hooks/use-toast";
import { Label } from "../ui/label";

const KanbanHeader: React.FC = () => {
  const dispatch = useDispatch();
  const { board, searchQuery, sortBy, filterBy } = useSelector(
    (state: RootState) => state.kanban
  );
  const { toast } = useToast();
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState(board.title);
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [quickAddData, setQuickAddData] = useState({
    title: "",
    description: "",
    priority: "medium" as TaskPriority,
    columnId: board.columns ? Object.keys(board.columns)[0] || "" : "",
  });

  const handleTitleSave = () => {
    if (titleValue.trim()) {
      dispatch(updateBoardTitle(titleValue.trim()));
    } else {
      setTitleValue(board.title);
    }
    setIsEditingTitle(false);
  };

  const handleTitleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleTitleSave();
    } else if (e.key === "Escape") {
      setTitleValue(board.title);
      setIsEditingTitle(false);
    }
  };

  const handleQuickAdd = () => {
    if (quickAddData.title.trim()) {
      dispatch(
        addTask({
          columnId: quickAddData.columnId,
          title: quickAddData.title.trim(),
          description: quickAddData.description.trim(),
          priority: quickAddData.priority,
        })
      );
      toast({
        title: "Task created",
        description: "Your new task has been added successfully.",
      });
      setQuickAddData({
        title: "",
        description: "",
        priority: "medium",
        columnId: board.columns ? Object.keys(board.columns)[0] || "" : "",
      });
      setIsQuickAddOpen(false);
    }
  };

  // FIXED: Added safety checks for tasks and columns
  const taskCount = board.tasks ? Object.keys(board.tasks).length : 0;
  const completedCount = board.columns?.done?.taskIds?.length || 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-8"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          {isEditingTitle ? (
            <Input
              value={titleValue}
              onChange={(e) => setTitleValue(e.target.value)}
              onBlur={handleTitleSave}
              onKeyDown={handleTitleKeyPress}
              className="text-3xl font-bold border-none p-0 h-auto bg-transparent focus-visible:ring-0"
              autoFocus
            />
          ) : (
            <h1
              className="text-3xl font-bold cursor-pointer hover:text-primary/80 transition-colors"
              onClick={() => setIsEditingTitle(true)}
            >
              {board.title}
            </h1>
          )}

          <div className="flex gap-2">
            <Badge variant="secondary" className="text-sm">
              {taskCount} tasks
            </Badge>
            <Badge variant="outline" className="text-sm text-success">
              {completedCount} completed
            </Badge>
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
          <Dialog open={isQuickAddOpen} onOpenChange={setIsQuickAddOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Quick Add
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Quick Add Task</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Task Title *</Label>
                  <Input
                    id="title"
                    placeholder="Enter task title..."
                    value={quickAddData.title}
                    onChange={(e) =>
                      setQuickAddData({
                        ...quickAddData,
                        title: e.target.value,
                      })
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleQuickAdd();
                    }}
                    autoFocus
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Enter task description..."
                    value={quickAddData.description}
                    onChange={(e) =>
                      setQuickAddData({
                        ...quickAddData,
                        description: e.target.value,
                      })
                    }
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="priority">Priority</Label>
                    <Select
                      value={quickAddData.priority}
                      onValueChange={(value: TaskPriority) =>
                        setQuickAddData({ ...quickAddData, priority: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="column">Column</Label>
                    <Select
                      value={quickAddData.columnId}
                      onValueChange={(value) =>
                        setQuickAddData({ ...quickAddData, columnId: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select column" />
                      </SelectTrigger>
                      <SelectContent>
                        {board.columns &&
                          Object.values(board.columns).map((column) => (
                            <SelectItem key={column.id} value={column.id}>
                              {column.title}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex gap-2 justify-end">
                  <Button
                    variant="outline"
                    onClick={() => setIsQuickAddOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleQuickAdd}
                    disabled={!quickAddData.title.trim()}
                  >
                    Add Task
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => dispatch(setSearchQuery(e.target.value))}
            className="pl-10"
          />
        </div>

        <div className="flex gap-2 items-center">
          <div className="flex items-center gap-2">
            <SortAsc className="w-4 h-4 text-muted-foreground" />
            <Select
              value={sortBy}
              onValueChange={(value: SortOption) => dispatch(setSortBy(value))}
            >
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No sorting</SelectItem>
                <SelectItem value="priority">Priority</SelectItem>
                <SelectItem value="dueDate">Due date</SelectItem>
                <SelectItem value="alphabetical">A-Z</SelectItem>
                <SelectItem value="created">Created</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <Select
              value={filterBy}
              onValueChange={(value: FilterOption) =>
                dispatch(setFilterBy(value))
              }
            >
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All tasks</SelectItem>
                <SelectItem value="high">High priority</SelectItem>
                <SelectItem value="medium">Medium priority</SelectItem>
                <SelectItem value="low">Low priority</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
                <SelectItem value="blue">Blue label</SelectItem>
                <SelectItem value="green">Green label</SelectItem>
                <SelectItem value="amber">Amber label</SelectItem>
                <SelectItem value="red">Red label</SelectItem>
                <SelectItem value="purple">Purple label</SelectItem>
                <SelectItem value="pink">Pink label</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default KanbanHeader;
