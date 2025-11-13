"use client";

import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/Button";
import { Upload, X } from "lucide-react";

interface FileUploadProps {
  accept?: string;
  onChange: (file: File | null) => void;
  maxSize?: number; // in bytes
}

export function FileUpload({ accept, onChange, maxSize }: FileUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (maxSize && selectedFile.size > maxSize) {
      setError(`File size exceeds ${Math.round(maxSize / 1024 / 1024)}MB`);
      return;
    }

    setFile(selectedFile);
    setError(null);
    onChange(selectedFile);
  };

  const handleRemove = () => {
    setFile(null);
    setError(null);
    onChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-2">
      {!file ? (
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept={accept}
            onChange={handleFileSelect}
            className="hidden"
            id="file-upload"
          />
          <label htmlFor="file-upload">
            <Button
              type="button"
              variant="secondary"
              className="w-full cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="w-4 h-4 mr-2" />
              Choose File
            </Button>
          </label>
        </div>
      ) : (
        <div className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-neutral-900 truncate">
              {file.name}
            </p>
            <p className="text-xs text-neutral-600">
              {(file.size / 1024).toFixed(2)} KB
            </p>
          </div>
          <button
            onClick={handleRemove}
            className="ml-3 text-error-600 hover:text-error-700"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
      {error && (
        <p className="text-xs text-error-600">{error}</p>
      )}
    </div>
  );
}

