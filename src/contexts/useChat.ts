import { useContext } from "react";
import ChatContext, { type ChatContextType } from "@/contexts/ChatContext";

// Custom hook to use the chat context
export const useChat = (): ChatContextType => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
};
