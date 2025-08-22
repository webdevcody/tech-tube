import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Users } from "lucide-react";
import { EmptyState } from "~/components/EmptyState";
import { getSubscribedVideosAndCommentsFn } from "~/fn/subscriptions";
import { Card, CardContent } from "~/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { formatRelativeTime } from "~/utils/video";

const subscriptionsQueryOptions = () => ({
  queryKey: ["subscribed-content"],
  queryFn: () => getSubscribedVideosAndCommentsFn(),
});

export const Route = createFileRoute("/subscriptions/users")({
  loader: ({ context }) => {
    const { queryClient } = context;
    return queryClient.ensureQueryData(subscriptionsQueryOptions());
  },
  component: SubscriptionUsers,
});

function SubscriptionUsers() {
  const navigate = useNavigate();
  const { data, isLoading } = useQuery(subscriptionsQueryOptions());

  const { subscribedUsers } = data || { subscribedUsers: [] };

  return (
    <div className="space-y-6">
      {isLoading ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i} className="border-border/50">
              <CardContent className="p-6">
                <div className="flex flex-col items-center space-y-4 animate-pulse">
                  <div className="h-20 w-20 bg-muted rounded-full" />
                  <div className="space-y-2 w-full">
                    <div className="h-4 bg-muted rounded w-3/4 mx-auto" />
                    <div className="h-3 bg-muted rounded w-1/2 mx-auto" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : subscribedUsers && subscribedUsers.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
          {subscribedUsers.map((subscription) => (
            <Link
              key={subscription.id}
              to="/profile/$id"
              params={{ id: subscription.subscribedTo.id }}
              className="rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              <Card className="group border-border/50 hover:border-border hover:shadow-xl transition-all duration-300 cursor-pointer bg-card/50 backdrop-blur-sm overflow-hidden">
                <CardContent className="p-0">
                  <div className="relative">
                    {/* Background gradient */}
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    
                    <div className="relative p-6 flex flex-col items-center space-y-4">
                      <div className="relative">
                        <Avatar className="h-20 w-20 ring-4 ring-transparent group-hover:ring-primary/20 transition-all duration-300 shadow-lg">
                          <AvatarImage
                            src={subscription.subscribedTo.image || undefined}
                            alt={subscription.subscribedTo.name}
                          />
                          <AvatarFallback className="bg-gradient-to-br from-primary/30 to-primary/20 text-foreground text-2xl font-bold">
                            {subscription.subscribedTo.name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        
                        {/* Subtle glow effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-md" />
                      </div>
                      
                      <div className="text-center space-y-2 w-full">
                        <h3 className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors duration-200 truncate">
                          {subscription.subscribedTo.name}
                        </h3>
                        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                          <div className="h-1.5 w-1.5 bg-green-500 rounded-full animate-pulse" />
                          <span>
                            Subscribed {formatRelativeTime(new Date(subscription.createdAt).toISOString())}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Bottom accent border */}
                    <div className="h-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<Users className="h-10 w-10 text-primary/60" />}
          title="No subscriptions"
          description="You haven't subscribed to any creators yet. Start following some creators to see them here!"
          actionLabel="Browse Creators"
          onAction={() => {
            navigate({ to: "/browse" });
          }}
        />
      )}
    </div>
  );
}