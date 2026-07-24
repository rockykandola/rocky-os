"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Upload, FileIcon } from "lucide-react";
import { toast } from "sonner";
import { nanoid } from "nanoid";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { attachFile, deleteFile, ATTACHMENTS_BUCKET } from "@/server/actions/files";
import type { FileAsset } from "@/generated/prisma/client";

function formatBytes(bytes: number | null) {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function ProjectFiles({
  projectId,
  userId,
  files,
}: {
  projectId: string;
  userId: string;
  files: FileAsset[];
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const supabase = createClient();

  async function handleFiles(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;
    setUploading(true);
    try {
      for (const file of Array.from(fileList)) {
        const storagePath = `${userId}/projects/${projectId}/${nanoid()}-${file.name}`;
        const { error } = await supabase.storage.from(ATTACHMENTS_BUCKET).upload(storagePath, file);
        if (error) throw error;

        await attachFile({
          entityType: "PROJECT",
          entityId: projectId,
          fileName: file.name,
          storagePath,
          mimeType: file.type || null,
          sizeBytes: file.size,
          revalidate: `/projects/${projectId}`,
        });
      }
      router.refresh();
    } catch {
      toast.error("Upload failed. Make sure the 'attachments' storage bucket exists in Supabase.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function remove(id: string) {
    startTransition(async () => {
      await deleteFile(id, `/projects/${projectId}`);
      router.refresh();
    });
  }

  function publicUrl(path: string) {
    return supabase.storage.from(ATTACHMENTS_BUCKET).getPublicUrl(path).data.publicUrl;
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <input
          ref={inputRef}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="gap-1.5"
          disabled={uploading || isPending}
          onClick={() => inputRef.current?.click()}
        >
          <Upload className="h-4 w-4" />
          {uploading ? "Uploading…" : "Upload file"}
        </Button>
      </div>
      <div className="flex flex-col gap-2">
        {files.length === 0 && <p className="text-sm text-muted-foreground">No files attached yet.</p>}
        {files.map((file) => (
          <div key={file.id} className="flex items-center justify-between gap-2 rounded-lg border p-3">
            <a
              href={publicUrl(file.storagePath)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex min-w-0 items-center gap-2 text-sm hover:underline"
            >
              <FileIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
              <span className="truncate">{file.fileName}</span>
              <span className="shrink-0 text-xs text-muted-foreground">{formatBytes(file.sizeBytes)}</span>
            </a>
            <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0 text-muted-foreground" onClick={() => remove(file.id)}>
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
