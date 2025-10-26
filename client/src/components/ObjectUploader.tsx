import { useState, ReactNode, useRef } from "react";
import Uppy from "@uppy/core";
import { DashboardModal } from "@uppy/react";
import "@uppy/core/dist/style.min.css";
import "@uppy/dashboard/dist/style.min.css";
import AwsS3 from "@uppy/aws-s3";
import type { UploadResult } from "@uppy/core";
import { Button } from "@/components/ui/button";
import { Camera, Upload } from "lucide-react";

interface ObjectUploaderProps {
  maxNumberOfFiles?: number;
  maxFileSize?: number;
  onGetUploadParameters: () => Promise<{
    method: "PUT";
    url: string;
  }>;
  onComplete?: (
    result: UploadResult<Record<string, unknown>, Record<string, unknown>>
  ) => void;
  buttonClassName?: string;
  children: ReactNode;
  variant?: "default" | "outline" | "ghost" | "link" | "destructive" | "secondary";
  size?: "default" | "sm" | "lg" | "icon";
  testId?: string;
}

/**
 * A file upload component that renders as a button and provides a modal interface for
 * file management.
 * 
 * Features:
 * - Renders as a customizable button that opens a file upload modal
 * - Provides a modal interface for:
 *   - File selection
 *   - File preview
 *   - Upload progress tracking
 *   - Upload status display
 * 
 * The component uses Uppy under the hood to handle all file upload functionality.
 * All file management features are automatically handled by the Uppy dashboard modal.
 * 
 * @param props - Component props
 * @param props.maxNumberOfFiles - Maximum number of files allowed to be uploaded
 *   (default: 1)
 * @param props.maxFileSize - Maximum file size in bytes (default: 10MB)
 * @param props.onGetUploadParameters - Function to get upload parameters (method and URL).
 *   Typically used to fetch a presigned URL from the backend server for direct-to-S3
 *   uploads.
 * @param props.onComplete - Callback function called when upload is complete. Typically
 *   used to make post-upload API calls to update server state and set object ACL
 *   policies.
 * @param props.buttonClassName - Optional CSS class name for the button
 * @param props.children - Content to be rendered inside the button
 */
export function ObjectUploader({
  maxNumberOfFiles = 1,
  maxFileSize = 10485760, // 10MB default
  onGetUploadParameters,
  onComplete,
  buttonClassName,
  children,
  variant = "outline",
  size = "default",
  testId = "button-upload",
}: ObjectUploaderProps) {
  const [showModal, setShowModal] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Detect mobile device
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  
  const [uppy] = useState(() =>
    new Uppy({
      restrictions: {
        maxNumberOfFiles,
        maxFileSize,
        allowedFileTypes: ['image/*'], // Only images for mobile camera
      },
      autoProceed: false,
    })
      .use(AwsS3, {
        shouldUseMultipart: false,
        getUploadParameters: onGetUploadParameters,
      })
      .on("complete", (result) => {
        onComplete?.(result);
        setShowModal(false);
        setIsUploading(false);
      })
  );

  // Handle native file input for mobile
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    try {
      // Add files to Uppy
      Array.from(files).forEach(file => {
        uppy.addFile({
          name: file.name,
          type: file.type,
          data: file,
          source: 'Native File Input',
        });
      });
      
      // Upload files
      await uppy.upload();
    } catch (error) {
      console.error('Upload error:', error);
      setIsUploading(false);
    }
  };

  const handleButtonClick = () => {
    if (isMobile && fileInputRef.current) {
      // On mobile, trigger native file input (opens camera/photos)
      fileInputRef.current.click();
    } else {
      // On desktop, show Uppy modal
      setShowModal(true);
    }
  };

  return (
    <div>
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
          <>Uploading...</>
        ) : (
          <>
            {isMobile ? <Camera className="h-4 w-4 mr-2" /> : <Upload className="h-4 w-4 mr-2" />}
            {children}
          </>
        )}
      </Button>

      {/* Native file input for mobile (hidden) */}
      {isMobile && (
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment" // Opens camera on mobile
          multiple={maxNumberOfFiles > 1}
          onChange={handleFileChange}
          style={{ display: 'none' }}
          data-testid={`${testId}-input`}
        />
      )}

      {/* Uppy modal for desktop */}
      {!isMobile && (
        <DashboardModal
          uppy={uppy}
          open={showModal}
          onRequestClose={() => setShowModal(false)}
          proudlyDisplayPoweredByUppy={false}
        />
      )}
    </div>
  );
}