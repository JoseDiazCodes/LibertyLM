import React, { useState, useCallback } from 'react';
import { Upload, File, X, Check, AlertCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { validateFileType, validateFileSize } from '@/lib/security';
import { useToast } from '@/hooks/use-toast';

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  status: 'uploading' | 'success' | 'error';
  progress?: number;
}

interface FileUploadProps {
  onFilesUploaded: (files: UploadedFile[]) => void;
  uploadedFiles: UploadedFile[];
  onRemoveFile: (fileId: string) => void;
  className?: string;
}

const ACCEPTED_FILE_TYPES = {
  '.js': { icon: '📄', label: 'JavaScript' },
  '.py': { icon: '🐍', label: 'Python' },
  '.java': { icon: '☕', label: 'Java' },
  '.cpp': { icon: '⚡', label: 'C++' },
  '.json': { icon: '📋', label: 'JSON' },
  '.yaml': { icon: '⚙️', label: 'YAML' },
  '.yml': { icon: '⚙️', label: 'YAML' },
  '.md': { icon: '📝', label: 'Markdown' },
  '.txt': { icon: '📄', label: 'Text' },
  '.png': { icon: '🖼️', label: 'PNG Image' },
  '.jpg': { icon: '🖼️', label: 'JPG Image' },
  '.jpeg': { icon: '🖼️', label: 'JPEG Image' },
  '.svg': { icon: '🎨', label: 'SVG Image' }
};

const ALLOWED_MIME_TYPES = [
  'text/javascript',
  'text/plain',
  'application/json',
  'text/markdown',
  'image/png',
  'image/jpeg',
  'image/svg+xml',
  'application/x-python-code',
  'text/x-python',
  'text/x-java-source'
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export function FileUpload({ onFilesUploaded, uploadedFiles, onRemoveFile, className }: FileUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileExtension = (filename: string) => {
    return '.' + filename.split('.').pop()?.toLowerCase();
  };

  const getFileTypeInfo = (filename: string) => {
    const ext = getFileExtension(filename);
    return ACCEPTED_FILE_TYPES[ext as keyof typeof ACCEPTED_FILE_TYPES] || { icon: '📄', label: 'File' };
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  }, []);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    handleFiles(files);
  }, []);

  const handleFiles = async (files: File[]) => {
    setIsUploading(true);
    
    // Validate files before processing
    const validFiles: File[] = [];
    const rejectedFiles: string[] = [];
    
    for (const file of files) {
      // Check file size
      if (!validateFileSize(file, MAX_FILE_SIZE)) {
        rejectedFiles.push(`${file.name}: File too large (max 10MB)`);
        continue;
      }
      
      // Check file type by extension and MIME type
      const extension = '.' + file.name.split('.').pop()?.toLowerCase();
      const hasValidExtension = extension in ACCEPTED_FILE_TYPES;
      const hasValidMimeType = ALLOWED_MIME_TYPES.includes(file.type) || file.type === '';
      
      if (!hasValidExtension && !hasValidMimeType) {
        rejectedFiles.push(`${file.name}: Unsupported file type`);
        continue;
      }
      
      validFiles.push(file);
    }
    
    // Show rejection toast if any files were rejected
    if (rejectedFiles.length > 0) {
      toast({
        title: "Some files were rejected",
        description: rejectedFiles.slice(0, 3).join(', ') + (rejectedFiles.length > 3 ? '...' : ''),
        variant: "destructive",
      });
    }
    
    if (validFiles.length === 0) {
      setIsUploading(false);
      return;
    }
    
    const newFiles: UploadedFile[] = validFiles.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: file.size,
      type: file.type,
      status: 'uploading' as const,
      progress: 0
    }));

    onFilesUploaded(newFiles);

    // Simulate upload progress
    for (const file of newFiles) {
      for (let progress = 0; progress <= 100; progress += 20) {
        await new Promise(resolve => setTimeout(resolve, 100));
        file.progress = progress;
      }
      file.status = 'success';
    }

    setIsUploading(false);
  };

  const totalSize = uploadedFiles.reduce((sum, file) => sum + file.size, 0);

  return (
    <div className={cn("space-y-6", className)}>
      {/* Upload Zone */}
      <Card 
        className={cn(
          "border-2 border-dashed transition-all duration-200 cursor-pointer",
          "hover:border-primary hover:shadow-hover",
          isDragOver ? "border-primary bg-accent scale-[1.02]" : "border-border",
          isUploading && "pointer-events-none opacity-50"
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => document.getElementById('file-input')?.click()}
      >
        <div className="p-8 text-center space-y-4">
          <div className={cn(
            "mx-auto w-16 h-16 rounded-full flex items-center justify-center transition-colors",
            isDragOver ? "bg-primary text-primary-foreground" : "bg-accent text-accent-foreground"
          )}>
            <Upload className="w-8 h-8" />
          </div>
          
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">
              {isDragOver ? "Drop files here" : "Upload your codebase files"}
            </h3>
            <p className="text-muted-foreground">
              Drag and drop files here, or click to browse
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-2 text-xs text-muted-foreground">
            {Object.entries(ACCEPTED_FILE_TYPES).slice(0, 8).map(([ext, info]) => (
              <span key={ext} className="flex items-center gap-1 px-2 py-1 bg-muted rounded">
                <span>{info.icon}</span>
                <span>{ext}</span>
              </span>
            ))}
            <span className="text-muted-foreground">+more</span>
          </div>

          <input
            id="file-input"
            type="file"
            multiple
            className="hidden"
            onChange={handleFileInput}
            accept={Object.keys(ACCEPTED_FILE_TYPES).join(',')}
          />
        </div>
      </Card>

      {/* File List */}
      {uploadedFiles.length > 0 && (
        <Card className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">Uploaded Files ({uploadedFiles.length})</h4>
            <span className="text-sm text-muted-foreground">
              Total: {formatFileSize(totalSize)}
            </span>
          </div>

          <div className="space-y-2 max-h-64 overflow-y-auto">
            {uploadedFiles.map((file) => {
              const fileInfo = getFileTypeInfo(file.name);
              
              return (
                <div key={file.id} className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                  <span className="text-xl">{fileInfo.icon}</span>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium truncate">{file.name}</span>
                      <span className="text-xs px-2 py-1 bg-muted rounded">{fileInfo.label}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>{formatFileSize(file.size)}</span>
                      {file.status === 'uploading' && file.progress !== undefined && (
                        <span>• {file.progress}%</span>
                      )}
                    </div>
                    {file.status === 'uploading' && file.progress !== undefined && (
                      <div className="w-full bg-muted rounded-full h-1 mt-1">
                        <div 
                          className="bg-primary h-1 rounded-full transition-all duration-300"
                          style={{ width: `${file.progress}%` }}
                        />
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {file.status === 'success' && (
                      <Check className="w-4 h-4 text-green-500" />
                    )}
                    {file.status === 'error' && (
                      <AlertCircle className="w-4 h-4 text-red-500" />
                    )}
                    {file.status === 'uploading' && (
                      <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    )}
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveFile(file.id);
                      }}
                      className="h-8 w-8 p-0 hover:bg-destructive hover:text-destructive-foreground"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
}