"use client";

import { useEffect } from "react";

export function SWRegistration() {
  useEffect(() => {
    if ("serviceWorker" in navigator && window.location.protocol === "https:") {
      const registerSW = async () => {
        try {
          const registration = await navigator.serviceWorker.register("/sw.js");
          console.log("PWA Service Worker registered:", registration.scope);
          
          // Request notification permission if not already granted
          if (Notification.permission === "default") {
             // We'll trigger this from a UI action instead to be less intrusive
          }
        } catch (error) {
          console.error("PWA Service Worker registration failed:", error);
        }
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
