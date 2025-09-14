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
          color: "blue", // default color
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

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <KanbanHeader />

        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="board" type="column" direction="horizontal">
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className={`flex gap-6 overflow-x-auto pb-6 ${
                  snapshot.isDraggingOver ? "bg-muted/20 rounded-2xl p-4" : ""
                }`}
              >
                {board.columnOrder.map((columnId, index) => {
                  const column = board.columns[columnId];
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
                        tasks={board.tasks}
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
                  transition={{ delay: board.columnOrder.length * 0.1 }}
                  className="flex-shrink-0"
                >
                  <Dialog
                    open={isAddColumnDialogOpen}
                    onOpenChange={setIsAddColumnDialogOpen}
                  >
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        className="h-16 w-80 border-dashed border-2 hover:border-primary/50 hover:bg-primary/5"
                      >
                        <Plus className="w-5 h-5 mr-2" />
                        Add Column
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add New Column</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <Input
                          placeholder="Column title"
                          value={newColumnTitle}
                          onChange={(e) => setNewColumnTitle(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleAddColumn();
                          }}
                          autoFocus
                        />
                        <div className="flex gap-2 justify-end">
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
