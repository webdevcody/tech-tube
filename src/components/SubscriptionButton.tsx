import { Button } from "~/components/ui/button";
import { UserPlus, UserMinus } from "lucide-react";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  subscribeToUserFn,
  unsubscribeFromUserFn,
  checkSubscriptionStatusFn,
} from "~/fn/subscriptions";
import { authClient } from "~/lib/auth-client";

interface SubscriptionButtonProps {
  targetUserId: string;
  className?: string;
}

export function SubscriptionButton({ targetUserId, className }: SubscriptionButtonProps) {
  const { data: session } = authClient.useSession();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);

  const { data: subscriptionStatus } = useQuery({
    queryKey: ["subscription-status", targetUserId],
    queryFn: () => checkSubscriptionStatusFn({ data: { subscribedToId: targetUserId } }),
    enabled: !!session?.user?.id && session.user.id !== targetUserId,
  });

  const subscribeMutation = useMutation({
    mutationFn: () => subscribeToUserFn({ data: { subscribedToId: targetUserId } }),
    onMutate: () => setIsLoading(true),
    onSuccess: () => {
      toast.success("Successfully subscribed!");
      queryClient.invalidateQueries({ queryKey: ["subscription-status", targetUserId] });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to subscribe");
    },
    onSettled: () => setIsLoading(false),
  });

  const unsubscribeMutation = useMutation({
    mutationFn: () => unsubscribeFromUserFn({ data: { subscribedToId: targetUserId } }),
    onMutate: () => setIsLoading(true),
    onSuccess: () => {
      toast.success("Successfully unsubscribed!");
      queryClient.invalidateQueries({ queryKey: ["subscription-status", targetUserId] });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to unsubscribe");
    },
    onSettled: () => setIsLoading(false),
  });

  const handleSubscriptionToggle = () => {
    if (subscriptionStatus?.isSubscribed) {
      unsubscribeMutation.mutate();
    } else {
      subscribeMutation.mutate();
    }
  };

  // Don't show button if not authenticated or viewing own profile
  if (!session?.user?.id || session.user.id === targetUserId) {
    return null;
  }

  const isSubscribed = subscriptionStatus?.isSubscribed ?? false;

  return (
    <Button
      onClick={handleSubscriptionToggle}
      disabled={isLoading}
      variant={isSubscribed ? "outline" : "default"}
      size="sm"
      className={className}
    >
      {isSubscribed ? (
        <>
          <UserMinus className="w-4 h-4 mr-2" />
          Unsubscribe
        </>
      ) : (
        <>
          <UserPlus className="w-4 h-4 mr-2" />
          Subscribe
        </>
      )}
    </Button>
  );
}