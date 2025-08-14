import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function AdminSupportModal({ isOpen, onClose, context }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg bg-white">
        <CardHeader>
          <CardTitle>Start Support Chat</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-amber-800">
            Context: <b>{context?.type}</b> • {context?.name || context?.id}
          </div>
          <textarea
            className="w-full border rounded-md p-3"
            rows={4}
            placeholder="Type a message to start the conversation…"
          />
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>Close</Button>
            <Button className="bg-amber-700 hover:bg-amber-800 text-white">Send</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}