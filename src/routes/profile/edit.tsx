import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { database } from "~/db";
import { user } from "~/db/schema";
import { eq } from "drizzle-orm";
import { Page } from "~/components/Page";
import { PageTitle } from "~/components/PageTitle";
import { EditProfileForm } from "./-components/EditProfileForm";
import { authenticatedMiddleware } from "~/fn/middleware";
import z from "zod";

const getCurrentUserFn = createServerFn({
  method: "GET",
})
  .middleware([authenticatedMiddleware])
  .handler(async ({ context }) => {
    const currentUser = await database.query.user.findFirst({
      where: eq(user.id, context.userId),
    });

    if (!currentUser) {
      throw redirect({ to: "/sign-in" });
    }

    return currentUser;
  });

const updateProfileFn = createServerFn({
  method: "POST",
})
  .validator(
    z.object({
      name: z.string().min(1),
      bio: z.string().optional(),
      image: z.url().optional(),
    })
  )
  .middleware([authenticatedMiddleware])
  .handler(async ({ context, data }) => {
    const updatedUser = await database
      .update(user)
      .set({
        name: data.name,
        bio: data.bio || null,
        image: data.image || null,
        updatedAt: new Date(),
      })
      .where(eq(user.id, context.userId))
      .returning();

    return updatedUser[0];
  });

export const Route = createFileRoute("/profile/edit")({
  loader: async () => {
    return await getCurrentUserFn();
  },
  component: EditProfilePage,
});

function EditProfilePage() {
  const user = Route.useLoaderData();
  const navigate = useNavigate();

  const handleUpdateProfile = async (data: {
    name: string;
    bio?: string;
    image?: string;
  }) => {
    try {
      await updateProfileFn({ data });
      navigate({ to: "/profile/$id", params: { id: user.id } });
    } catch (error) {
      console.error("Failed to update profile:", error);
    }
  };

  return (
    <Page>
      <div className="max-w-2xl mx-auto space-y-8">
        <PageTitle title="Edit Profile" />
        <EditProfileForm user={user} onSubmit={handleUpdateProfile} />
      </div>
    </Page>
  );
}
