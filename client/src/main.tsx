import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Initialize PWA updater for Android update detection
import "./lib/pwa-updater";

createRoot(document.getElementById("root")!).render(<App />);
