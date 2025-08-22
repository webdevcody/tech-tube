import { createFileRoute, Outlet, useNavigate, useLocation } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { MessageCircle, Video as VideoIcon, Users } from "lucide-react";
import { Page } from "~/components/Page";
import { PageTitle } from "~/components/PageTitle";
import { Tabs, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { getSubscribedVideosAndCommentsFn } from "~/fn/subscriptions";
import { authClient } from "~/lib/auth-client";

const subscriptionsQueryOptions = () => ({
  queryKey: ["subscribed-content"],
  queryFn: () => getSubscribedVideosAndCommentsFn(),
});

export const Route = createFileRoute("/subscriptions")({
  loader: ({ context }) => {
    const { queryClient } = context;
    return queryClient.ensureQueryData(subscriptionsQueryOptions());
  },
  component: SubscriptionsLayout,
});

function SubscriptionsLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { data: session, isPending } = authClient.useSession();

  if (isPending) {
    return (
      <Page>
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      </Page>
    );
  }

  if (!session) {
    navigate({ to: "/sign-in" });
    return null;
  }

  // Determine current tab based on pathname
  const getCurrentTab = () => {
    if (location.pathname.includes('/comments')) return 'comments';
    if (location.pathname.includes('/users')) return 'users';
    return 'videos';
  };

  const handleTabChange = (value: string) => {
    switch (value) {
      case 'videos':
        navigate({ to: '/subscriptions/videos' });
        break;
      case 'comments':
        navigate({ to: '/subscriptions/comments' });
        break;
      case 'users':
        navigate({ to: '/subscriptions/users' });
        break;
    }
  };

  return (
    <Page>
      <div className="space-y-10">
        {/* Enhanced Header Section */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-primary/3 to-transparent rounded-2xl -z-10" />
          <div className="px-6 py-8 md:px-8 md:py-10">
            <div className="max-w-3xl">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                Your Subscriptions
              </h1>
              <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
                Stay up to date with the latest content from creators you follow
              </p>
            </div>
          </div>
        </div>

        {/* Enhanced Tabs */}
        <div className="w-full">
          <Tabs value={getCurrentTab()} onValueChange={handleTabChange} className="w-full">
            <div className="relative">
              <TabsList className="grid w-full grid-cols-3 h-12 bg-background/60 backdrop-blur-sm border border-border/50 shadow-sm rounded-xl p-1">
                <TabsTrigger 
                  value="videos" 
                  className="flex items-center gap-2.5 h-10 rounded-lg font-medium text-sm transition-all duration-200 data-[state=active]:bg-background data-[state=active]:shadow-md data-[state=active]:border-border/20 data-[state=active]:text-foreground hover:text-foreground/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  <VideoIcon className="h-4 w-4" />
                  <span className="hidden sm:inline">Recent Videos</span>
                  <span className="sm:hidden">Videos</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="comments" 
                  className="flex items-center gap-2.5 h-10 rounded-lg font-medium text-sm transition-all duration-200 data-[state=active]:bg-background data-[state=active]:shadow-md data-[state=active]:border-border/20 data-[state=active]:text-foreground hover:text-foreground/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  <MessageCircle className="h-4 w-4" />
                  <span>Comments</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="users" 
                  className="flex items-center gap-2.5 h-10 rounded-lg font-medium text-sm transition-all duration-200 data-[state=active]:bg-background data-[state=active]:shadow-md data-[state=active]:border-border/20 data-[state=active]:text-foreground hover:text-foreground/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  <Users className="h-4 w-4" />
                  <span className="hidden sm:inline">Subscribed Users</span>
                  <span className="sm:hidden">Users</span>
                </TabsTrigger>
              </TabsList>
            </div>
          </Tabs>
        </div>

        <div className="mt-8">
          <Outlet />
        </div>
      </div>
    </Page>
  );
}