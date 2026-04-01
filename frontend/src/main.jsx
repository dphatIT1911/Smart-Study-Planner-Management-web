import { createRoot } from "react-dom/client";
import { Toaster } from "sonner";
import App from "./app/App.jsx";
import "./styles/index.css";

createRoot(document.getElementById("root")).render(
  <>
    <App />
    <Toaster position="bottom-right" richColors />
  </>
);