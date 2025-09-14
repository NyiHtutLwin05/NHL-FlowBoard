import { useEffect } from "react";
import { useSelector } from "react-redux";
import { type RootState } from "../store";

export const useLocalStorage = () => {
  const board = useSelector((state: RootState) => state.kanban.board);

  useEffect(() => {
    try {
      localStorage.setItem("kanban-board", JSON.stringify(board));
    } catch (error) {
      console.warn("Failed to save board to localStorage:", error);
    }
  }, [board]);
};
