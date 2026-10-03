"use client";

import { useEffect } from "react";

export default function ImagePreloader() {
  useEffect(() => {
    // Preload the blueprint background image
    const link = document.createElement("link");
    link.rel = "preload";
    link.as = "image";
    link.href = "/blueprints/architectural-blueprints.jpg";
    document.head.appendChild(link);

    // Also preload the image using Image object for better caching
    const img = new Image();
    img.src = "/blueprints/architectural-blueprints.jpg";

    return () => {
      // Cleanup
      if (document.head.contains(link)) {
        document.head.removeChild(link);
      }
    };
  }, []);

  return null;
}

