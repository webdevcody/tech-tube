import { Button } from "~/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Badge } from "~/components/ui/badge";
import { Card, CardContent } from "~/components/ui/card";
import { User, Settings, Tag } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { SubscriptionButton } from "~/components/SubscriptionButton";
import { useQuery } from "@tanstack/react-query";
import { getUserTagsFn } from "~/fn/tags";

interface ProfileHeaderProps {
  profile: {
    userId: string;
    name: string;
    bio: string | null;
    image: string | null;
  };
  isOwnProfile: boolean;
}

export function ProfileHeader({ profile, isOwnProfile }: ProfileHeaderProps) {
  const { data: userTags = [], isLoading: isLoadingTags } = useQuery({
    queryKey: ["userTags", profile.userId],
    queryFn: () => getUserTagsFn({ data: { userId: profile.userId } }),
  });

  return (
    <Card className="sticky top-8">
      <CardContent className="p-6">
        <div className="flex flex-col items-center text-center space-y-6">
          {/* Avatar */}
          <Avatar className="w-32 h-32">
            <AvatarImage src={profile.image || undefined} alt={profile.name} />
            <AvatarFallback className="text-3xl bg-primary/10">
              <User className="w-16 h-16" />
            </AvatarFallback>
          </Avatar>

          {/* Name */}
          <div className="space-y-2">
            <h1 className="text-2xl font-bold">{profile.name}</h1>
          </div>

          {/* Action Button */}
          <div className="w-full">
            {isOwnProfile ? (
              <Link to="/profile/edit" className="block">
                <Button variant="outline" size="sm" className="w-full">
                  <Settings className="w-4 h-4 mr-2" />
                  Edit Profile
                </Button>
              </Link>
            ) : (
              <SubscriptionButton targetUserId={profile.userId} />
            )}
          </div>

          {/* Bio */}
          {profile.bio && (
            <div className="space-y-3 w-full">
              <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                About
              </h3>
              <p className="text-sm text-foreground leading-relaxed text-left">
                {profile.bio}
              </p>
            </div>
          )}

          {/* Tags Section */}
          {!isLoadingTags && userTags.length > 0 && (
            <div className="space-y-3 w-full">
              <div className="flex items-center justify-center gap-2">
                <Tag className="w-4 h-4 text-muted-foreground" />
                <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                  Tags
                </h3>
              </div>
              <div className="flex flex-wrap gap-2 justify-center">
                {userTags.map((userTag) => (
                  <Badge key={userTag.id} variant="secondary" className="text-xs">
                    {userTag.tag.name}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
