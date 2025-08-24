import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { FileText, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getVideoTranscriptFn } from "~/fn/videos";

interface TranscriptSegment {
  text: string;
  startTime: number;
  endTime: number;
  confidence: number;
}

interface TranscriptDialogProps {
  videoId: string;
}

function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
}

export function TranscriptDialog({ videoId }: TranscriptDialogProps) {
  const [open, setOpen] = useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ["video-transcript", videoId],
    queryFn: () => getVideoTranscriptFn({ data: { videoId } }),
    enabled: open,
  });

  const transcript = data?.transcript;
  const transcriptError = data?.error;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <FileText className="h-4 w-4 mr-2" />
          Show Transcript
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Video Transcript</DialogTitle>
          <DialogDescription>
            Auto-generated transcript with timestamps
          </DialogDescription>
        </DialogHeader>

        <div className="h-96 w-full overflow-y-auto rounded-md border p-4">
          {isLoading && (
            <div className="flex items-center justify-center h-32">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              <span className="text-sm text-muted-foreground">
                Loading transcript...
              </span>
            </div>
          )}

          {error && (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground mb-2">
                Failed to load transcript
              </p>
              <p className="text-xs text-muted-foreground">
                {error instanceof Error ? error.message : "Unknown error"}
              </p>
            </div>
          )}

          {transcriptError && !transcript && (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground mb-2">
                {transcriptError}
              </p>
              <p className="text-xs text-muted-foreground">
                Transcripts are generated automatically when videos are
                uploaded. Please check back later if this is a recently uploaded
                video.
              </p>
            </div>
          )}

          {transcript && transcript.length > 0 && (
            <div className="space-y-3 leading-relaxed">
              {transcript.map((segment: any) => segment.text).join(" ")}
            </div>
          )}

          {transcript && transcript.length === 0 && (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                No transcript content found
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
