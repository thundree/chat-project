import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import "@/index.css";
import Layout from "@/layout.tsx";
import { ChatProvider } from "@/contexts/ChatContext.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ChatProvider>
      <div className="w-full bg-gray-200 dark:bg-gray-900">
        <Layout />
      </div>
    </ChatProvider>
  </StrictMode>
);
