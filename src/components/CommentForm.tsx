import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "~/components/ui/button";
import { Textarea } from "~/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "~/components/ui/form";
import { createCommentFn } from "~/fn/comments";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Send } from "lucide-react";

const commentSchema = z.object({
  content: z.string().min(1, "Comment cannot be empty").max(1000, "Comment is too long"),
});

type CommentFormData = z.infer<typeof commentSchema>;

interface CommentFormProps {
  videoId: string;
}

export function CommentForm({ videoId }: CommentFormProps) {
  const queryClient = useQueryClient();

  const form = useForm<CommentFormData>({
    resolver: zodResolver(commentSchema),
    defaultValues: {
      content: "",
    },
  });

  const createCommentMutation = useMutation({
    mutationFn: (data: { content: string; videoId: string }) =>
      createCommentFn({ data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", videoId] });
      form.reset();
      toast.success("Comment posted successfully!");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to post comment");
    },
  });

  const onSubmit = (data: CommentFormData) => {
    createCommentMutation.mutate({
      content: data.content,
      videoId,
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Textarea
                  placeholder="Add a comment..."
                  className="min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={createCommentMutation.isPending || !form.formState.isValid}
            className="flex items-center gap-2"
          >
            {createCommentMutation.isPending ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Posting...
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                Post Comment
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}