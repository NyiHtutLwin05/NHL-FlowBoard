import React, { useState } from "react";
import { DragDropContext, Droppable, type DropResult } from "@hello-pangea/dnd";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";
import { type RootState } from "../../store";
import {
  moveTask,
  reorderTask,
  reorderColumns,
  addColumn,
} from "../../store/kanbanSlice";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import KanbanColumn from "./KanbanColumn";
import KanbanHeader from "./KanbanHeader";
import { Button } from "../ui/button";
import { Plus } from "lucide-react";
import { Input } from "../ui/input";
import { useToast } from "../../hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";

const KanbanBoard: React.FC = () => {
  const dispatch = useDispatch();
  const { board, searchQuery, sortBy, filterBy } = useSelector(
    (state: RootState) => state.kanban
  );
  const { toast } = useToast();
  const [newColumnTitle, setNewColumnTitle] = useState("");
  const [isAddColumnDialogOpen, setIsAddColumnDialogOpen] = useState(false);

  // Auto-save to localStorage
  useLocalStorage();

  const handleAddColumn = () => {
    if (newColumnTitle.trim()) {
      dispatch(
        addColumn({
          title: newColumnTitle.trim(),
          color: "blue",
        })
      );
      toast({
        title: "Column added",
        description: `"${newColumnTitle.trim()}" column has been created.`,
      });
      setNewColumnTitle("");
      setIsAddColumnDialogOpen(false);
    }
  };

  const handleDragEnd = (result: DropResult) => {
    const { destination, source, type } = result;

    if (!destination) return;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    if (type === "column") {
      dispatch(
        reorderColumns({
          sourceIndex: source.index,
          destinationIndex: destination.index,
        })
      );
      return;
    }

    if (source.droppableId === destination.droppableId) {
      dispatch(
        reorderTask({
          columnId: source.droppableId,
          sourceIndex: source.index,
          destinationIndex: destination.index,
        })
      );
    } else {
      dispatch(
        moveTask({
          taskId: result.draggableId,
          sourceColumnId: source.droppableId,
          destinationColumnId: destination.droppableId,
          sourceIndex: source.index,
          destinationIndex: destination.index,
        })
      );
    }
  };

  const columnOrder = board?.columnOrder || [];
  const columns = board?.columns || {};

  return (
    <div className="min-h-screen bg-background p-4 md:p-6 bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-7xl mx-auto">
        <KanbanHeader />

        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="board" type="column" direction="horizontal">
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className={`flex gap-6 overflow-x-auto pb-6 ${
                  snapshot.isDraggingOver
                    ? "bg-slate-200/40 rounded-xl p-3"
                    : ""
                }`}
              >
                {columnOrder.map((columnId, index) => {
                  const column = columns[columnId];
                  if (!column) return null;

                  return (
                    <motion.div
                      key={columnId}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex-shrink-0"
                    >
                      <KanbanColumn
                        column={column}
                        tasks={board?.tasks || {}}
                        index={index}
                        searchQuery={searchQuery}
                        sortBy={sortBy}
                        filterBy={filterBy}
                      />
                    </motion.div>
                  );
                })}
                {provided.placeholder}

                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: columnOrder.length * 0.1 }}
                  className="flex-shrink-0"
                >
                  <Dialog
                    open={isAddColumnDialogOpen}
                    onOpenChange={setIsAddColumnDialogOpen}
                  >
                    <DialogTrigger asChild>
                      <Button
                        variant="ghost"
                        className="h-full min-h-[500px] w-72 bg-white/70 backdrop-blur-sm border-2 border-dashed border-slate-300 hover:border-slate-400 hover:bg-white/90 rounded-xl shadow-sm flex flex-col items-center justify-center gap-2 text-slate-500 hover:text-slate-700 transition-colors"
                      >
                        <Plus className="w-5 h-5 mr-2" />
                        <span className="text-sm font-medium">Add Column</span>
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px] rounded-xl">
                      <DialogHeader>
                        <DialogTitle>Add New Column</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 py-2">
                        <Input
                          placeholder="Column title"
                          value={newColumnTitle}
                          onChange={(e) => setNewColumnTitle(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleAddColumn();
                          }}
                          autoFocus
                        />
                        <div className="flex gap-2 justify-end pt-2">
                          <Button
                            variant="outline"
                            onClick={() => setIsAddColumnDialogOpen(false)}
                          >
                            Cancel
                          </Button>
                          <Button
                            onClick={handleAddColumn}
                            disabled={!newColumnTitle.trim()}
                          >
                            Add Column
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </motion.div>
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>
    </div>
  );
};

export default KanbanBoard;
