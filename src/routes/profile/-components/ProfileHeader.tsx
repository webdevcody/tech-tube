import { Button } from "~/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Card, CardContent } from "~/components/ui/card";
import { User, Settings } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { SubscriptionButton } from "~/components/SubscriptionButton";

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
  return (
    <Card>
      <CardContent className="p-8">
        <div className="flex flex-col md:flex-row md:items-center gap-6">
          <Avatar className="w-24 h-24 md:w-32 md:h-32">
            <AvatarImage src={profile.image || undefined} alt={profile.name} />
            <AvatarFallback className="text-2xl md:text-3xl bg-primary/10">
              <User className="w-12 h-12 md:w-16 md:h-16" />
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold">
                  {profile.name}
                </h1>
              </div>

              <div className="flex gap-2">
                {isOwnProfile ? (
                  <Link to="/profile/edit">
                    <Button variant="outline" size="sm">
                      <Settings className="w-4 h-4 mr-2" />
                      Edit Profile
                    </Button>
                  </Link>
                ) : (
                  <SubscriptionButton targetUserId={profile.userId} />
                )}
              </div>
            </div>

            {profile.bio && (
              <div className="space-y-2">
                <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                  About
                </h3>
                <p className="text-foreground leading-relaxed">{profile.bio}</p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
