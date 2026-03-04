import { ThemeProvider } from "@/components/ui/theme-provider";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./globals.css";

import { BrowserRouter } from "react-router-dom";

createRoot(document.getElementById("root")!).render(
  <ThemeProvider defaultTheme="light" enableSystem={false} storageKey="celiyo-theme">
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </ThemeProvider>
);
