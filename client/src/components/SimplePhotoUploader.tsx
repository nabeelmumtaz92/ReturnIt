import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Camera, Upload, Check, Loader2 } from "lucide-react";
import type { UploadResult } from "@uppy/core";

interface SimplePhotoUploaderProps {
  maxNumberOfFiles?: number;
  maxFileSize?: number;
  onGetUploadParameters: () => Promise<{
    method: "PUT";
    url: string;
  }>;
  onComplete?: (result: UploadResult<Record<string, unknown>, Record<string, unknown>>) => void;
  buttonClassName?: string;
  children: React.ReactNode;
  variant?: "default" | "outline" | "ghost" | "link" | "destructive" | "secondary";
  size?: "default" | "sm" | "lg" | "icon";
  testId?: string;
}

export function SimplePhotoUploader({
  maxFileSize = 10485760,
  onGetUploadParameters,
  onComplete,
  buttonClassName,
  children,
  variant = "outline",
  size = "default",
  testId = "button-upload",
}: SimplePhotoUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > maxFileSize) {
      alert(`File size must be less than ${Math.round(maxFileSize / 1048576)}MB`);
      return;
    }

    if (!file.type.startsWith('image/')) {
      alert('Only image files are allowed');
      return;
    }

    try {
      setIsUploading(true);
      setUploadProgress(0);

      const { url } = await onGetUploadParameters();

      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100);
          setUploadProgress(progress);
        }
      });

      await new Promise<void>((resolve, reject) => {
        xhr.addEventListener('load', () => {
          if (xhr.status === 200) {
            resolve();
          } else {
            reject(new Error(`Upload failed with status ${xhr.status}`));
          }
        });

        xhr.addEventListener('error', () => {
          reject(new Error('Upload failed'));
        });

        xhr.open('PUT', url);
        xhr.setRequestHeader('Content-Type', file.type);
        xhr.send(file);
      });

      const fileUrl = url.split('?')[0];

      if (onComplete) {
        onComplete({
          successful: [
            {
              id: Date.now().toString(),
              name: file.name,
              type: file.type,
              size: file.size,
              uploadURL: fileUrl,
              data: file,
              extension: file.name.split('.').pop() || '',
              isRemote: false,
              meta: {},
              progress: { uploadComplete: true, uploadStarted: Date.now() },
              remote: {},
              source: 'file-input',
            } as any,
          ],
          failed: [],
        } as any);
      }

      setUploadProgress(100);
      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
      }, 500);
    } catch (error) {
      console.error('Upload error:', error);
      alert('Upload failed. Please try again.');
      setIsUploading(false);
      setUploadProgress(0);
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleButtonClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    fileInputRef.current?.click();
  };

  return (
    <div className="relative">
      <Button 
        onClick={handleButtonClick}
        className={buttonClassName}
        variant={variant}
        size={size}
        type="button"
        data-testid={testId}
        disabled={isUploading}
      >
        {isUploading ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Uploading {uploadProgress}%
          </>
        ) : (
          <>
            {isMobile ? <Camera className="h-4 w-4 mr-2" /> : <Upload className="h-4 w-4 mr-2" />}
            {children}
          </>
        )}
      </Button>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture={isMobile ? "environment" : undefined}
        onChange={handleFileChange}
        style={{ display: 'none' }}
        data-testid={`${testId}-input`}
      />
    </div>
  );
}

export { SimplePhotoUploader as ObjectUploader };
