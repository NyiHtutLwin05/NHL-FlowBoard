import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";
import { type RootState } from "../../store";
import {
  setSearchQuery,
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
import { Search, Filter, Plus } from "lucide-react";
import { type FilterOption, type TaskPriority } from "../../types/kanban";
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
  const { board, searchQuery, filterBy } = useSelector(
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
      className="mb-6"
    >
      <div className="flex flex-col gap-4 mb-6 select-none">
        {/* Title and Stats */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            {isEditingTitle ? (
              <Input
                value={titleValue}
                onChange={(e) => setTitleValue(e.target.value)}
                onBlur={handleTitleSave}
                onKeyDown={handleTitleKeyPress}
                className="text-2xl md:text-3xl font-bold border-none p-0 h-auto bg-transparent focus-visible:ring-0 text-slate-800"
                autoFocus
              />
            ) : (
              <h1
                className="text-2xl md:text-3xl font-bold cursor-pointer hover:text-primary/80 transition-colors text-slate-800"
                onClick={() => setIsEditingTitle(true)}
              >
                {board.title}
              </h1>
            )}

            <div className="flex gap-2">
              <Badge
                variant="secondary"
                className="text-xs bg-slate-100 text-slate-600"
              >
                {taskCount} tasks
              </Badge>
              <Badge
                variant="outline"
                className="text-xs text-emerald-600 bg-emerald-50 border-emerald-200"
              >
                {completedCount} completed
              </Badge>
            </div>
          </div>
        </div>

        {/* Controls Row */}
        <div className="flex flex-col md:flex-row gap-3 items-stretch">
          {/* Search */}
          <div className="relative flex-1 max-w-lg">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <Input
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => dispatch(setSearchQuery(e.target.value))}
              className="pl-10 rounded-lg bg-white border-slate-200"
            />
          </div>

          {/* Filters and Actions */}
          <div className="flex flex-col sm:flex-row gap-3 items-center">
            <div className="flex gap-2">
              {/* Filter */}
              <div className="flex items-center">
                <Select
                  value={filterBy}
                  onValueChange={(value: FilterOption) =>
                    dispatch(setFilterBy(value))
                  }
                >
                  <SelectTrigger className="w-32 rounded-lg border-slate-200 gap-2">
                    <Filter className="w-4 h-4 text-slate-400" />
                    <SelectValue placeholder="Filter" />
                  </SelectTrigger>
                  <SelectContent className="rounded-lg">
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

            {/* Quick Add Button */}
            <Dialog open={isQuickAddOpen} onOpenChange={setIsQuickAddOpen}>
              <DialogTrigger asChild>
                <Button
                  size="sm"
                  className="rounded-lg gap-2 whitespace-nowrap"
                >
                  <Plus className="w-4 h-4" />
                  <span className="hidden sm:inline">Quick Add Task</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="rounded-xl sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className="text-slate-800">
                    Add New Task
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-2">
                  <div className="space-y-2">
                    <Label htmlFor="title" className="text-slate-700">
                      Task Title *
                    </Label>
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
                      className="rounded-lg"
                      autoFocus
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-slate-700">
                      Description
                    </Label>
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
                      className="rounded-lg"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="priority" className="text-slate-700">
                        Priority
                      </Label>
                      <Select
                        value={quickAddData.priority}
                        onValueChange={(value: TaskPriority) =>
                          setQuickAddData({ ...quickAddData, priority: value })
                        }
                      >
                        <SelectTrigger className="rounded-lg">
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                        <SelectContent className="rounded-lg">
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="urgent">Urgent</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="column" className="text-slate-700">
                        Column
                      </Label>
                      <Select
                        value={quickAddData.columnId}
                        onValueChange={(value) =>
                          setQuickAddData({ ...quickAddData, columnId: value })
                        }
                      >
                        <SelectTrigger className="rounded-lg">
                          <SelectValue placeholder="Select column" />
                        </SelectTrigger>
                        <SelectContent className="rounded-lg">
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
                  <div className="flex gap-2 justify-end pt-2">
                    <Button
                      variant="outline"
                      onClick={() => setIsQuickAddOpen(false)}
                      className="rounded-lg"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleQuickAdd}
                      disabled={!quickAddData.title.trim()}
                      className="rounded-lg"
                    >
                      Add Task
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default KanbanHeader;
