import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Card, CardContent } from "~/components/ui/card";
import { VideoCard } from "~/components/VideoCard";
import { EmptyState } from "~/components/EmptyState";
import { UserCommentsSection } from "~/components/UserCommentsSection";
import { Video, MessageSquare } from "lucide-react";
import { video } from "~/db/schema";

interface ProfileTabsProps {
  videos: (typeof video.$inferSelect)[];
  userId: string;
}

export function ProfileTabs({ videos, userId }: ProfileTabsProps) {
  return (
    <Tabs defaultValue="videos" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="videos" className="flex items-center gap-2">
          <Video className="w-4 h-4" />
          Videos ({videos.length})
        </TabsTrigger>
        <TabsTrigger value="comments" className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4" />
          Comments
        </TabsTrigger>
      </TabsList>

      <TabsContent value="videos" className="mt-6">
        {videos.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {videos.map((video) => (
              <VideoCard key={video.id} video={video} />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-8">
              <EmptyState
                icon={<Video className="w-12 h-12" />}
                title="No videos yet"
                description="This user hasn't uploaded any videos yet."
              />
            </CardContent>
          </Card>
        )}
      </TabsContent>

      <TabsContent value="comments" className="mt-6">
        <UserCommentsSection userId={userId} />
      </TabsContent>
    </Tabs>
  );
}
