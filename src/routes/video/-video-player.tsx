import "cloudinary-video-player/cld-video-player.min.css";
import { useEffect, useRef, useState } from "react";
import { publicEnv } from "~/config/publicEnv";

interface CloudinaryVideoPlayerProps {
  publicId: string | null;
}

export function CloudinaryVideoPlayer({
  publicId,
}: CloudinaryVideoPlayerProps) {
  const playerRef = useRef<any>(null);
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  const lastPublicIdRef = useRef<string | null>(null);

  // Initialize player once
  useEffect(() => {
    import("cloudinary-video-player").then((cloudinary) => {
      // Try to import chapters, but don't fail if not available
      import("cloudinary-video-player/chapters").catch(() => {
        console.log("Chapters module not available");
      }).finally(() => {
        const playerConfig: any = {
          cloud_name: publicEnv.cloudName,
          chapters: true,
          chaptersButton: true,
          autoplay: false,
          muted: false,
        };

        // If we have a publicId on initial load, include it in the initialization
        if (publicId) {
          playerConfig.publicId = publicId;
          lastPublicIdRef.current = publicId;
        }

        playerRef.current = cloudinary.videoPlayer("video-player", playerConfig);
        setIsPlayerReady(true);
      });
    });

    return () => {
      if (playerRef.current) {
        try {
          playerRef.current.dispose();
        } catch (error) {
          console.log("Error disposing player:", error);
        }
        playerRef.current = null;
      }
      setIsPlayerReady(false);
    };
  }, []);

  // Update video source when publicId changes (but not on initial load if already set)
  useEffect(() => {
    if (isPlayerReady && playerRef.current && publicId && publicId !== lastPublicIdRef.current) {
      playerRef.current.source({ publicId: publicId });
      lastPublicIdRef.current = publicId;
    }
  }, [publicId, isPlayerReady]);

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
