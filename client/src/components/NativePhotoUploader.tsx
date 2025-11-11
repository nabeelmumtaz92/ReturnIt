import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Camera, Upload, Loader2, X, Image as ImageIcon } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface NativePhotoUploaderProps {
  maxFiles?: number;
  maxFileSize?: number;
  onUploadComplete: (urls: string[]) => void;
  currentUrls?: string[];
  buttonText?: string;
  variant?: "default" | "outline" | "ghost" | "link" | "destructive" | "secondary";
  size?: "default" | "sm" | "lg" | "icon";
  testId?: string;
  label?: string;
}

export function NativePhotoUploader({
  maxFiles = 1,
  maxFileSize = 10485760, // 10MB
  onUploadComplete,
  currentUrls = [],
  buttonText,
  variant = "outline",
  size = "sm",
  testId = "button-upload-photo",
  label
}: NativePhotoUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Validate file count
    if (files.length > maxFiles) {
      toast({
        title: "Too many files",
        description: `You can only upload up to ${maxFiles} photo${maxFiles > 1 ? 's' : ''}.`,
        variant: "destructive"
      });
      return;
    }

    // Validate file sizes
    const oversizedFiles = Array.from(files).filter(file => file.size > maxFileSize);
    if (oversizedFiles.length > 0) {
      toast({
        title: "File too large",
        description: `Maximum file size is ${Math.round(maxFileSize / 1048576)}MB.`,
        variant: "destructive"
      });
      return;
    }

    setUploading(true);
    setProgress(0);

    try {
      const uploadedUrls: string[] = [];
      const totalFiles = files.length;

      for (let i = 0; i < totalFiles; i++) {
        const file = files[i];
        
        // Get presigned URL from backend
        const { uploadURL } = await apiRequest("POST", "/api/objects/upload");

        // Upload file directly to object storage
        const uploadResponse = await fetch(uploadURL, {
          method: 'PUT',
          body: file,
          headers: {
            'Content-Type': file.type,
          },
        });

        if (!uploadResponse.ok) {
          throw new Error(`Upload failed for ${file.name}`);
        }

        // Extract the public URL (remove query params from presigned URL)
        const publicUrl = uploadURL.split('?')[0];
        uploadedUrls.push(publicUrl);
        
        setProgress(Math.round(((i + 1) / totalFiles) * 100));
      }

      // Call completion handler with all uploaded URLs
      onUploadComplete(uploadedUrls);
      
      toast({
        title: "Upload successful",
        description: `${uploadedUrls.length} photo${uploadedUrls.length > 1 ? 's' : ''} uploaded successfully.`,
      });

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Failed to upload photo. Please try again.",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemovePhoto = (urlToRemove: string) => {
    const newUrls = currentUrls.filter(url => url !== urlToRemove);
    onUploadComplete(newUrls);
  };

  return (
    <div className="space-y-2">
      {label && (
        <label className="text-sm font-medium text-foreground">{label}</label>
      )}
      
      <div className="flex flex-wrap gap-2">
        {/* Show uploaded photos */}
        {currentUrls.map((url, index) => (
          <div key={url} className="relative group">
            <img 
              src={url} 
              alt={`Upload ${index + 1}`}
              className="h-20 w-20 object-cover rounded border border-border"
            />
            <button
              onClick={() => handleRemovePhoto(url)}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
              type="button"
              data-testid={`${testId}-remove-${index}`}
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}

        {/* Upload button - show if under max files */}
        {currentUrls.length < maxFiles && (
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture={isMobile ? "environment" : undefined}
              multiple={maxFiles > 1}
              onChange={handleFileSelect}
              className="hidden"
              data-testid={`${testId}-input`}
            />
            
            <Button
              type="button"
              variant={variant}
              size={size}
              onClick={handleButtonClick}
              disabled={uploading}
              data-testid={testId}
              className="h-20 w-20 flex flex-col items-center justify-center gap-1"
            >
              {uploading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-xs">{progress}%</span>
                </>
              ) : (
                <>
                  {isMobile ? <Camera className="h-5 w-5" /> : <Upload className="h-5 w-5" />}
                  {buttonText && <span className="text-xs text-center">{buttonText}</span>}
                </>
              )}
            </Button>
          </div>
        )}
      </div>

      {/* Helper text */}
      {!uploading && currentUrls.length === 0 && (
        <p className="text-xs text-muted-foreground">
          {isMobile ? 'Tap to take a photo' : 'Click to upload'} 
          {maxFiles > 1 && ` (up to ${maxFiles} photos)`}
        </p>
      )}
    </div>
  );
}
