import { useEffect, useState } from "react";
import { loadHistory } from "@/lib/history";
import type { GeneratedPost } from "@/lib/types";

export function useHistory(): GeneratedPost[] {
  const [items, setItems] = useState<GeneratedPost[]>([]);

  useEffect(() => {
    setItems(loadHistory());
    const onChange = () => setItems(loadHistory());
    window.addEventListener("history:changed", onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener("history:changed", onChange);
      window.removeEventListener("storage", onChange);
    };
  }, []);

  return items;
}
