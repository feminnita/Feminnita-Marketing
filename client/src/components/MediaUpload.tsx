import { useState, useRef } from "react";
import { Upload, X, Image as ImageIcon, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface MediaFile {
  id: string;
  file: File;
  preview: string;
  progress: number;
  error?: string;
}

interface MediaUploadProps {
  onFilesSelected: (files: MediaFile[]) => void;
  maxFiles?: number;
  maxFileSize?: number; // em MB
  acceptedFormats?: string[];
}

export function MediaUpload({
  onFilesSelected,
  maxFiles = 10,
  maxFileSize = 50,
  acceptedFormats = ["image/jpeg", "image/png", "image/webp", "video/mp4", "video/quicktime"],
}: MediaUploadProps) {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const processFiles = async (fileList: FileList) => {
    setIsProcessing(true);
    const newFiles: MediaFile[] = [];

    for (let i = 0; i < Math.min(fileList.length, maxFiles - files.length); i++) {
      const file = fileList[i];

      // Validar tipo
      if (!acceptedFormats.includes(file.type)) {
        newFiles.push({
          id: `${Date.now()}-${i}`,
          file,
          preview: "",
          progress: 0,
          error: `Formato não suportado. Aceitos: ${acceptedFormats.join(", ")}`,
        });
        continue;
      }

      // Validar tamanho
      if (file.size > maxFileSize * 1024 * 1024) {
        newFiles.push({
          id: `${Date.now()}-${i}`,
          file,
          preview: "",
          progress: 0,
          error: `Arquivo muito grande. Máximo: ${maxFileSize}MB`,
        });
        continue;
      }

      // Criar preview
      const reader = new FileReader();
      reader.onload = (e) => {
        const preview = e.target?.result as string;
        newFiles.push({
          id: `${Date.now()}-${i}`,
          file,
          preview,
          progress: 100,
        });

        if (newFiles.length === Math.min(fileList.length, maxFiles - files.length)) {
          const updatedFiles = [...files, ...newFiles];
          setFiles(updatedFiles);
          onFilesSelected(updatedFiles);
          setIsProcessing(false);
        }
      };

      reader.readAsDataURL(file);
    }

    if (newFiles.length === 0) {
      setIsProcessing(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      processFiles(e.target.files);
    }
  };

  const removeFile = (id: string) => {
    const updatedFiles = files.filter((f) => f.id !== id);
    setFiles(updatedFiles);
    onFilesSelected(updatedFiles);
  };

  const getMediaType = (file: File) => {
    return file.type.startsWith("video") ? "video" : "image";
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  return (
    <div className="space-y-4">
      {/* Drag and Drop Area */}
      <div
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          isDragging
            ? "border-pink-500 bg-pink-50"
            : "border-slate-300 bg-slate-50 hover:border-pink-400"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={acceptedFormats.join(",")}
          onChange={handleFileInputChange}
          className="hidden"
        />

        <div className="flex flex-col items-center gap-3">
          <Upload className="w-8 h-8 text-slate-400" />
          <div>
            <p className="font-semibold text-slate-900">
              Arraste arquivos aqui ou clique para selecionar
            </p>
            <p className="text-sm text-slate-600 mt-1">
              Máximo {maxFiles} arquivos, {maxFileSize}MB cada
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processando...
              </>
            ) : (
              "Selecionar Arquivos"
            )}
          </Button>
        </div>
      </div>

      {/* Preview Grid */}
      {files.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-semibold text-slate-700">
            {files.length} arquivo{files.length !== 1 ? "s" : ""} selecionado{files.length !== 1 ? "s" : ""}
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {files.map((mediaFile) => (
              <Card key={mediaFile.id} className="relative overflow-hidden group">
                {/* Preview */}
                <div className="relative w-full aspect-square bg-slate-100">
                  {mediaFile.error ? (
                    <div className="w-full h-full flex items-center justify-center bg-red-50 p-2">
                      <p className="text-xs text-red-600 text-center">{mediaFile.error}</p>
                    </div>
                  ) : mediaFile.preview ? (
                    <>
                      {getMediaType(mediaFile.file) === "video" ? (
                        <video
                          src={mediaFile.preview}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <img
                          src={mediaFile.preview}
                          alt="preview"
                          className="w-full h-full object-cover"
                        />
                      )}
                      {getMediaType(mediaFile.file) === "video" && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                          <div className="w-12 h-12 rounded-full bg-white/80 flex items-center justify-center">
                            <div className="w-0 h-0 border-l-6 border-l-transparent border-r-6 border-r-transparent border-t-6 border-t-slate-900 ml-1" />
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon className="w-8 h-8 text-slate-300" />
                    </div>
                  )}

                  {/* Remove Button */}
                  <button
                    onClick={() => removeFile(mediaFile.id)}
                    className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-4 h-4" />
                  </button>

                  {/* Progress Bar */}
                  {mediaFile.progress < 100 && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-200">
                      <div
                        className="h-full bg-pink-500 transition-all"
                        style={{ width: `${mediaFile.progress}%` }}
                      />
                    </div>
                  )}
                </div>

                {/* File Info */}
                <div className="p-2 bg-white">
                  <p className="text-xs font-semibold text-slate-900 truncate">
                    {mediaFile.file.name}
                  </p>
                  <p className="text-xs text-slate-500">
                    {formatFileSize(mediaFile.file.size)}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
