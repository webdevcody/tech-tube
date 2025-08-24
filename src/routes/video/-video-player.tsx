import "cloudinary-video-player/cld-video-player.min.css";
import { useEffect } from "react";
import { publicEnv } from "~/config/publicEnv";

interface CloudinaryVideoPlayerProps {
  publicId: string | null;
}

export function CloudinaryVideoPlayer({
  publicId,
}: CloudinaryVideoPlayerProps) {
  useEffect(() => {
    import("cloudinary-video-player").then((cloudinary) => {
      // Try to import chapters, but don't fail if not available
      import("cloudinary-video-player/chapters").catch(() => {
        console.log("Chapters module not available");
      }).finally(() => {
        cloudinary.videoPlayer("video-player", {
          cloud_name: publicEnv.cloudName,
          publicId: publicId,
          chapters: true,
          chaptersButton: true,
          autoplay: false,
          muted: false,
        });
      });
    });
  }, []);

  if (!publicId) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-muted text-muted-foreground">
        Video not available
      </div>
    );
  }

  return (
    <video
      id="video-player"
      controls
      className="w-full h-full aspect-video rounded-lg"
      style={{ width: "100%", height: "auto" }}
    />
  );
}
