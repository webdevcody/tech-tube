import { Link } from "@tanstack/react-router";
import { authClient } from "~/lib/auth-client";
import { ModeToggle } from "./mode-toggle";
import { Button, buttonVariants } from "./ui/button";
import { Video, LogOut, User, Menu, X, Bell } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import { useState } from "react";
import { getUnreadNotificationCountFn } from "~/fn/notifications";
import { useQuery } from "@tanstack/react-query";
import { getAvatarUrl, getInitials } from "~/utils/avatar";

const publicNavigationLinks = [
  {
    title: "Home",
    href: "/",
  },
  {
    title: "Browse",
    href: "/browse",
  },
];

const authenticatedNavigationLinks = [
  ...publicNavigationLinks,
  {
    title: "Creators",
    href: "/creators",
  },
  {
    title: "Subscriptions",
    href: "/subscriptions",
  },
];

export function Header() {
  const { data: session, isPending } = authClient.useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigationLinks = session
    ? authenticatedNavigationLinks
    : publicNavigationLinks;

  const { data: unreadCount } = useQuery({
    queryKey: ["unread-notification-count"],
    queryFn: () => getUnreadNotificationCountFn(),
    enabled: !!session,
  });

  const avatarUrl = session?.user 
    ? getAvatarUrl(session.user.image, session.user.name || 'User', session.user.id)
    : undefined;
  const initials = session?.user?.name 
    ? getInitials(session.user.name) 
    : 'U';

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-screen-2xl mx-auto px-8 flex h-14 items-center">
        <div className="mr-4 flex gap-16">
          <Link to="/" className="mr-6 flex items-center space-x-2">
            <Video />{" "}
            <span className="hidden font-bold sm:inline-block">TechTube</span>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm">
            {navigationLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className="transition-colors hover:text-foreground/80 text-foreground/60"
              >
                {link.title}
              </Link>
            ))}
          </nav>
        </div>

        {/* Mobile menu */}
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              className="mr-2 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden"
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="pr-0">
            <div className="px-7">
              <Link
                to="/"
                className="flex items-center space-x-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Video className="h-6 w-6" />
                <span className="font-bold">TechTube</span>
              </Link>
              <nav className="flex flex-col gap-3 mt-6">
                {navigationLinks.map((link) => (
                  <Link
                    key={link.href}
                    to={link.href}
                    className="block px-2 py-1 text-lg transition-colors hover:text-foreground/80 text-foreground/60"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {link.title}
                  </Link>
                ))}
              </nav>
            </div>
          </SheetContent>
        </Sheet>
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none"></div>
          <nav className="flex items-center gap-4">
            {isPending ? (
              <div className="flex h-9 w-9 items-center justify-center">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              </div>
            ) : session ? (
              <>
                <Link
                  className={buttonVariants({ variant: "default" })}
                  to="/upload"
                >
                  Upload
                </Link>
                <Link to="/notifications" className="relative">
                  <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    {unreadCount && unreadCount > 0 && (
                      <Badge
                        variant="destructive"
                        className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                      >
                        {unreadCount > 99 ? "99+" : unreadCount}
                      </Badge>
                    )}
                  </Button>
                </Link>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="relative h-8 w-8 rounded-full"
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarImage
                          src={avatarUrl}
                          alt={session.user.name || "Profile"}
                        />
                        <AvatarFallback className="bg-primary/10">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">
                          Account
                        </p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {session.user.email}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <Link to="/profile/$id" params={{ id: session.user.id }}>
                      <DropdownMenuItem>
                        <User className="mr-2 h-4 w-4" />
                        <span>Profile</span>
                      </DropdownMenuItem>
                    </Link>
                    <DropdownMenuItem onClick={() => authClient.signOut()}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Link
                  className={buttonVariants({ variant: "outline" })}
                  to="/sign-in"
                >
                  Sign In
                </Link>
                <Link
                  className={buttonVariants({ variant: "default" })}
                  to="/sign-up"
                >
                  Sign Up
                </Link>
              </>
            )}
            <ModeToggle />
          </nav>
        </div>
      </div>
    </header>
  );
}
