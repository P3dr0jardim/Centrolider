import { createRoot } from "react-dom/client";
import App from "./app/App.jsx";
import { AuthProvider } from "./app/context/AuthContext.jsx";
import "./styles/index.css";

createRoot(document.getElementById("root")).render(
  <AuthProvider>
    <App />
  </AuthProvider>
);
