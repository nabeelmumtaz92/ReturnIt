import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ReasonModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  action: "suspend" | "deactivate" | "reject" | "other";
  onConfirm: (reason: string, category?: string) => void;
  isLoading?: boolean;
}

export default function ReasonModal({
  open,
  onOpenChange,
  title,
  description,
  action,
  onConfirm,
  isLoading = false,
}: ReasonModalProps) {
  const [reason, setReason] = useState("");
  const [category, setCategory] = useState("");

  const getCategories = () => {
    if (action === "suspend" || action === "deactivate") {
      return [
        "Low Performance",
        "Customer Complaints",
        "Policy Violation",
        "Safety Concerns",
        "Fraud/Theft",
        "Background Check Issues",
        "Other",
      ];
    }
    return ["Policy Violation", "Incomplete Information", "Failed Verification", "Other"];
  };

  const handleConfirm = () => {
    onConfirm(reason, category);
    setReason("");
    setCategory("");
  };

  const handleCancel = () => {
    setReason("");
    setCategory("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent data-testid="reason-modal">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div>
            <Label htmlFor="category">Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger data-testid="select-reason-category">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {getCategories().map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="reason">Detailed Reason</Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Please provide a detailed explanation..."
              rows={4}
              data-testid="textarea-reason"
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isLoading}
            data-testid="button-cancel-reason"
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!reason.trim() || !category || isLoading}
            data-testid="button-confirm-reason"
          >
            {isLoading ? "Processing..." : "Confirm"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
