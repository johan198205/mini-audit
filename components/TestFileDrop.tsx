'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';

interface TestFileDropProps {
  onFilesAccepted: (files: File[]) => void;
  files: File[];
  title: string;
  maxFiles?: number;
}

export function TestFileDrop({ onFilesAccepted, files, title, maxFiles = 10 }: TestFileDropProps) {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || []);
    console.log('TestFileDrop: Files selected:', selectedFiles.length, selectedFiles.map(f => f.name));
    onFilesAccepted(selectedFiles);
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(false);
    
    const droppedFiles = Array.from(event.dataTransfer.files);
    console.log('TestFileDrop: Files dropped:', droppedFiles.length, droppedFiles.map(f => f.name));
    onFilesAccepted(droppedFiles);
  };

  return (
    <div className="space-y-3">
      <div>
        <h3 className="font-medium">{title}</h3>
        <p className="text-sm text-muted-foreground">
          Max {maxFiles} filer, 10MB per fil
        </p>
      </div>

      <Card
        className={`cursor-pointer transition-all duration-200 ${
          isDragOver ? 'border-primary bg-primary/5' : 'hover:border-primary/50'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <CardContent className="p-6">
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className={`p-3 rounded-full ${isDragOver ? 'bg-primary/10' : 'bg-muted'}`}>
              <Upload className={`h-6 w-6 ${isDragOver ? 'text-primary' : 'text-muted-foreground'}`} />
            </div>
            
            <div className="text-center">
              <p className="text-sm font-medium">
                {isDragOver ? 'Släpp filer här' : 'Dra och släpp filer här'}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                eller klicka för att välja filer
              </p>
            </div>
          </div>
          
          <input
            type="file"
            multiple
            accept=".csv,.xls,.xlsx,.json"
            onChange={handleFileSelect}
            className="hidden"
            id={`file-input-${title}`}
          />
          
          <Button
            type="button"
            variant="outline"
            className="w-full mt-4"
            onClick={() => document.getElementById(`file-input-${title}`)?.click()}
          >
            Välj filer
          </Button>
        </CardContent>
      </Card>

      {files.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium">Uppladdade filer:</p>
          <div className="flex flex-wrap gap-2">
            {files.map((file, index) => (
              <div key={index} className="px-2 py-1 bg-secondary rounded text-sm">
                {file.name}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}


