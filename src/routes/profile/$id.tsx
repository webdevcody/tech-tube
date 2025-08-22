import { createFileRoute, notFound } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { getUserProfileFn } from "~/fn/users";
import { authClient } from "~/lib/auth-client";
import { Page } from "~/components/Page";
import { ProfileHeader } from "./-components/ProfileHeader";
import { ProfileTabs } from "./-components/ProfileTabs";

const profileQueryOptions = (userId: string) => ({
  queryKey: ["profile", userId],
  queryFn: () => getUserProfileFn({ data: { userId } }),
});

export const Route = createFileRoute("/profile/$id")({
  loader: ({ context: { queryClient }, params: { id } }) => {
    if (!id) {
      throw notFound();
    }
    return queryClient.ensureQueryData(profileQueryOptions(id));
  },
  component: ProfilePage,
});

function ProfilePage() {
  const { id } = Route.useParams();
  const { data: session } = authClient.useSession();
  const {
    data: { profile, videos },
  } = useSuspenseQuery(profileQueryOptions(id));
  const isOwnProfile = session?.user?.id === profile.userId;

  return (
    <Page>
      <div className="max-w-4xl mx-auto space-y-8">
        <ProfileHeader profile={profile} isOwnProfile={isOwnProfile} />
        <ProfileTabs videos={videos} userId={profile.userId} />
      </div>
    </Page>
  );
}
