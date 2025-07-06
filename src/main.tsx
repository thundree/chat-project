import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import "@/index.css";
import Layout from "@/layout.tsx";
import { ChatProvider } from "@/contexts/ChatContext.tsx";
import { ThemeProvider } from "@/contexts/ThemeContext.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <ChatProvider>
        <div className="w-full bg-gray-200 dark:bg-gray-900">
          <Layout />
        </div>
      </ChatProvider>
    </ThemeProvider>
  </StrictMode>
);
