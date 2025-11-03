import { useEffect } from "react";
import { useLocation } from "wouter";

export default function Settings() {
  const [, setLocation] = useLocation();
  
  useEffect(() => {
    // Redirect to the full-featured admin settings page
    setLocation("/admin-settings");
  }, [setLocation]);

  return null;
}
