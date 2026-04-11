"use client";

import { useEffect } from "react";

export function SWRegistration() {
  useEffect(() => {
    if ("serviceWorker" in navigator && window.location.protocol === "https:") {
      const registerSW = () => {
        navigator.serviceWorker
          .register("/sw.js")
          .then((registration) => {
            console.log("PWA Service Worker registered:", registration.scope);
          })
          .catch((error) => {
            console.error("PWA Service Worker registration failed:", error);
          });
      };

      if (document.readyState === "complete") {
        registerSW();
      } else {
        window.addEventListener("load", registerSW);
        return () => window.removeEventListener("load", registerSW);
      }
    }
  }, []);

  return null;
}
