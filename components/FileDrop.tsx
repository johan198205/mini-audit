'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Upload, X, File, Image, BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface FileDropProps {
  accept: Record<string, string[]>;
  maxFiles?: number;
  maxSize?: number;
  onFilesAccepted: (files: File[]) => void;
  onFileRemove?: (file: File) => void;
  files: File[];
  title: string;
  description: string;
  required?: boolean;
}

const getFileIcon = (file: File) => {
  if (file.type.startsWith('image/')) return <Image className="h-4 w-4" />;
  if (file.type.includes('csv') || file.type.includes('excel') || file.type.includes('spreadsheet')) {
    return <BarChart3 className="h-4 w-4" />;
  }
  return <File className="h-4 w-4" />;
};

export function FileDrop({
  accept,
  maxFiles = 1,
  maxSize = 10 * 1024 * 1024, // 10MB
  onFilesAccepted,
  onFileRemove,
  files,
  title,
  description,
  required = false,
}: FileDropProps) {
  const [isDragActive, setIsDragActive] = useState(false);
  
  console.log('FileDrop rendered with maxFiles:', maxFiles, 'title:', title);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    console.log('FileDrop: Files dropped:', acceptedFiles.length, acceptedFiles.map(f => f.name));
    onFilesAccepted(acceptedFiles);
    setIsDragActive(false);
  }, [onFilesAccepted]);

  const { getRootProps, getInputProps, isDragReject } = useDropzone({
    onDrop,
    accept,
    maxFiles,
    maxSize,
    multiple: maxFiles > 1,
    onDragEnter: () => setIsDragActive(true),
    onDragLeave: () => setIsDragActive(false),
  });

  return (
    <div className="space-y-3">
      <div>
        <h3 className="font-medium flex items-center gap-2">
          {title}
          {required && <span className="text-destructive">*</span>}
        </h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>

      <Card
        {...getRootProps()}
        className={cn(
          'cursor-pointer transition-all duration-200',
          isDragActive && !isDragReject && 'border-primary bg-primary/5',
          isDragReject && 'border-destructive bg-destructive/5',
          'hover:border-primary/50'
        )}
      >
        <CardContent className="p-6">
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className={cn(
              'p-3 rounded-full',
              isDragActive && !isDragReject ? 'bg-primary/10' : 'bg-muted'
            )}>
              <Upload className={cn(
                'h-6 w-6',
                isDragActive && !isDragReject ? 'text-primary' : 'text-muted-foreground'
              )} />
            </div>
            
            <div className="text-center">
              <p className="text-sm font-medium">
                {isDragActive ? 'Släpp filer här' : 'Dra och släpp filer här'}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                eller klicka för att välja filer
              </p>
              <p className="text-xs text-muted-foreground">
                Max {maxFiles} fil(er), {Math.round(maxSize / 1024 / 1024)}MB per fil
              </p>
            </div>
          </div>
          
          <input {...getInputProps()} multiple={maxFiles > 1} />
        </CardContent>
      </Card>

      {files.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium">Uppladdade filer:</p>
          <div className="flex flex-wrap gap-2">
            {files.map((file, index) => (
              <Badge key={index} variant="secondary" className="flex items-center gap-2">
                {getFileIcon(file)}
                <span className="truncate max-w-[200px]">{file.name}</span>
                {onFileRemove && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                    onClick={(e) => {
                      e.stopPropagation();
                      onFileRemove(file);
                    }}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
