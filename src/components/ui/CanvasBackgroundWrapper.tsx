"use client";

import { useEffect, useState } from "react";
import CanvasBackground from "./CanvasBackground";

export default function CanvasBackgroundWrapper() {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const checkDesktop = () => {
      setIsDesktop(window.innerWidth > 767);
    };

    checkDesktop();
    window.addEventListener("resize", checkDesktop);
    return () => window.removeEventListener("resize", checkDesktop);
  }, []);

  if (!isDesktop) {
    return null;
  }

  return <CanvasBackground />;
}