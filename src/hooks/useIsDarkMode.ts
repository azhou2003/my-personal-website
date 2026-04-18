"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";

export function useIsDarkMode() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return false;
  }

  return resolvedTheme === "dark";
}
