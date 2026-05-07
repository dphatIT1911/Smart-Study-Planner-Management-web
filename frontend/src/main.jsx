import { createRoot } from "react-dom/client";
import { Toaster } from "sonner";
import App from "./app/App.jsx";
import "./styles/index.css";

import { GoogleOAuthProvider } from "@react-oauth/google";

createRoot(document.getElementById("root")).render(
  <GoogleOAuthProvider clientId="888853854520-ckqe654m7vkverkoofcrq0ula28gevst.apps.googleusercontent.com">
    <App />
    <Toaster position="bottom-right" richColors />
  </GoogleOAuthProvider>
);