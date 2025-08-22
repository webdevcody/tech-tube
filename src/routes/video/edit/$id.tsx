import { createFileRoute, redirect, useNavigate, Link } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { database } from "~/db";
import { video } from "~/db/schema";
import { eq } from "drizzle-orm";
import { Page } from "~/components/Page";
import { PageTitle } from "~/components/PageTitle";
import { EditVideoForm } from "../-components/EditVideoForm";
import { authenticatedMiddleware } from "~/fn/middleware";
import { updateVideoFn } from "~/fn/videos";
import { 
  Breadcrumb, 
  BreadcrumbList, 
  BreadcrumbItem, 
  BreadcrumbLink, 
  BreadcrumbSeparator, 
  BreadcrumbPage 
} from "~/components/ui/breadcrumb";
import z from "zod";

const getVideoForEditFn = createServerFn({
  method: "GET",
})
  .validator(z.object({ id: z.string() }))
  .middleware([authenticatedMiddleware])
  .handler(async ({ data, context }) => {
    const videoRecord = await database.query.video.findFirst({
      where: eq(video.id, data.id),
    });

    if (!videoRecord) {
      throw redirect({ to: "/" });
    }

    if (videoRecord.userId !== context.userId) {
      throw redirect({ to: "/video/$id", params: { id: data.id } });
    }

    return videoRecord;
  });

export const Route = createFileRoute("/video/edit/$id")({
  loader: async ({ context, params }) => {
    return await getVideoForEditFn({ data: { id: params.id } });
  },
  component: EditVideoPage,
});

function EditVideoPage() {
  const video = Route.useLoaderData();
  const navigate = useNavigate();

  const handleUpdateVideo = async (data: {
    title: string;
    description?: string;
    tags: string[];
  }) => {
    try {
      await updateVideoFn({ 
        data: { 
          id: video.id, 
          title: data.title, 
          description: data.description,
          tags: data.tags,
        } 
      });
      navigate({ to: "/video/$id", params: { id: video.id } });
    } catch (error) {
      console.error("Failed to update video:", error);
    }
  };

  return (
    <Page>
      <div className="max-w-2xl mx-auto space-y-8">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/video/$id" params={{ id: video.id }}>
                  {video.title}
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Edit Video</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        
        <PageTitle title="Edit Video" />
        <EditVideoForm video={video} onSubmit={handleUpdateVideo} />
      </div>
    </Page>
  );
}