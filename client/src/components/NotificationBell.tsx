import { Bell } from "lucide-react";

export default function NotificationBell() {
  return (
    <button
      type="button"
      className="relative inline-flex items-center justify-center h-10 w-10 rounded-lg border border-amber-200 bg-white hover:bg-amber-50"
      title="Notifications"
    >
      <Bell className="h-5 w-5 text-amber-700" />
      <span className="sr-only">Notifications</span>
    </button>
  );
}