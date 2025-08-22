import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Badge } from "~/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Bell, Check, Trash2, Video, User } from "lucide-react";
import {
  getNotificationsFn,
  markNotificationAsReadFn,
  markAllNotificationsAsReadFn,
  deleteNotificationFn,
} from "~/fn/notifications";
import { formatDistanceToNow } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { useMutation } from "@tanstack/react-query";

export const Route = createFileRoute("/notifications")({
  component: Notifications,
});

function Notifications() {
  const [filter, setFilter] = useState<"all" | "unread" | "read">("all");

  const { data: allNotifications, refetch: refetchAll } = useQuery({
    queryKey: ["notifications", "all"],
    queryFn: () => getNotificationsFn({ data: {} }),
    enabled: filter === "all",
  });

  const { data: unreadNotifications, refetch: refetchUnread } = useQuery({
    queryKey: ["notifications", "unread"],
    queryFn: () => getNotificationsFn({ data: { filter: "unread" } }),
    enabled: filter === "unread",
  });

  const { data: readNotifications, refetch: refetchRead } = useQuery({
    queryKey: ["notifications", "read"],
    queryFn: () => getNotificationsFn({ data: { filter: "read" } }),
    enabled: filter === "read",
  });

  const markAsReadMutation = useMutation({
    mutationFn: (variables: { data: { notificationId: string } }) =>
      markNotificationAsReadFn({ data: variables.data }),
    onSuccess: () => {
      refetchAll();
      refetchUnread();
      refetchRead();
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: () => markAllNotificationsAsReadFn(),
    onSuccess: () => {
      refetchAll();
      refetchUnread();
      refetchRead();
    },
  });

  const deleteNotificationMutation = useMutation({
    mutationFn: (variables: { data: { notificationId: string } }) =>
      deleteNotificationFn({ data: variables.data }),
    onSuccess: () => {
      refetchAll();
      refetchUnread();
      refetchRead();
    },
  });

  const currentNotifications =
    filter === "unread"
      ? unreadNotifications
      : filter === "read"
        ? readNotifications
        : allNotifications;

  const handleMarkAsRead = async (notificationId: string) => {
    await markAsReadMutation.mutateAsync({ data: { notificationId } });
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsReadMutation.mutateAsync();
  };

  const handleDelete = async (notificationId: string) => {
    await deleteNotificationMutation.mutateAsync({ data: { notificationId } });
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Bell className="h-6 w-6" />
          <h1 className="text-2xl font-bold">Notifications</h1>
        </div>
        <Button
          onClick={handleMarkAllAsRead}
          variant="outline"
          size="sm"
          disabled={markAllAsReadMutation.isPending}
        >
          <Check className="h-4 w-4 mr-2" />
          Mark All Read
        </Button>
      </div>

      <Tabs
        value={filter}
        onValueChange={(value) => setFilter(value as typeof filter)}
      >
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="unread">Unread</TabsTrigger>
          <TabsTrigger value="read">Read</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <NotificationsList
            notifications={currentNotifications}
            onMarkAsRead={handleMarkAsRead}
            onDelete={handleDelete}
            isMarkingAsRead={markAsReadMutation.isPending}
            isDeleting={deleteNotificationMutation.isPending}
          />
        </TabsContent>

        <TabsContent value="unread" className="space-y-4">
          <NotificationsList
            notifications={currentNotifications}
            onMarkAsRead={handleMarkAsRead}
            onDelete={handleDelete}
            isMarkingAsRead={markAsReadMutation.isPending}
            isDeleting={deleteNotificationMutation.isPending}
          />
        </TabsContent>

        <TabsContent value="read" className="space-y-4">
          <NotificationsList
            notifications={currentNotifications}
            onMarkAsRead={handleMarkAsRead}
            onDelete={handleDelete}
            isMarkingAsRead={markAsReadMutation.isPending}
            isDeleting={deleteNotificationMutation.isPending}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

interface NotificationsListProps {
  notifications?: any[];
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
  isMarkingAsRead: boolean;
  isDeleting: boolean;
}

function NotificationsList({
  notifications,
  onMarkAsRead,
  onDelete,
  isMarkingAsRead,
  isDeleting,
}: NotificationsListProps) {
  if (!notifications || notifications.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Bell className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-lg font-medium mb-2">No notifications yet</p>
          <p className="text-muted-foreground text-center">
            When someone comments on your videos, you'll see notifications here.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {notifications.map((notification) => (
        <Card
          key={notification.id}
          className={`transition-colors ${
            !notification.isRead ? "bg-muted/30 border-primary/20" : ""
          }`}
        >
          <CardContent className="p-4">
            <div className="flex items-start gap-4">
              <Avatar className="h-10 w-10 flex-shrink-0">
                <AvatarImage src={notification.triggeredByUser?.image || ""} />
                <AvatarFallback>
                  <User className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-relaxed">
                      {notification.triggeredByUser?.name || "Someone"}{" "}
                      commented on your video
                    </p>
                    {notification.video && (
                      <Link
                        to="/video/$id"
                        params={{ id: notification.video.id }}
                        className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
                        onClick={() => {
                          if (!notification.isRead) {
                            onMarkAsRead(notification.id);
                          }
                        }}
                      >
                        <Video className="h-4 w-4" />
                        {notification.video.title}
                      </Link>
                    )}
                    {notification.comment && (
                      <p className="text-sm text-muted-foreground bg-muted p-2 rounded">
                        "{notification.comment.content}"
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {!notification.isRead && (
                      <Badge variant="secondary" className="text-xs">
                        New
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(notification.createdAt), {
                      addSuffix: true,
                    })}
                  </p>

                  <div className="flex items-center gap-2">
                    {!notification.isRead && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onMarkAsRead(notification.id)}
                        disabled={isMarkingAsRead}
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete(notification.id)}
                      disabled={isDeleting}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
