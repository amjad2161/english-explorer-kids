import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const routes = [
  { key: "1", path: "/" },
  { key: "2", path: "/levels" },
  { key: "3", path: "/alphabet" },
  { key: "4", path: "/words" },
  { key: "5", path: "/memory" },
  { key: "6", path: "/quiz" },
  { key: "7", path: "/spelling" },
  { key: "8", path: "/scramble" },
  { key: "9", path: "/hangman" },
  { key: "0", path: "/settings" },
];

const KeyboardShortcuts = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Don't trigger if typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      // Don't trigger with modifier keys
      if (e.ctrlKey || e.metaKey || e.altKey) return;

      const route = routes.find(r => r.key === e.key);
      if (route && location.pathname !== route.path) {
        e.preventDefault();
        navigate(route.path);
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [navigate, location.pathname]);

  return null; // This component renders nothing
};

export default KeyboardShortcuts;
