"use client";

import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { EditIcon, BookOpenIcon, HeartIcon, UserIcon, CalendarIcon, MailIcon, MapPinIcon, Link2Icon } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function ProfilePage() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<"overview" | "posts" | "drafts">("overview");

  if (!session?.user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <h1 className="text-2xl font-bold mb-4">Please sign in to view your profile</h1>
        <Button onClick={() => window.location.href = "/dashboard"}>Go to Dashboard</Button>
      </div>
    );
  }

  const user = session.user;

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={user.image || undefined} alt={user.name || "User"} />
                <AvatarFallback className="text-2xl">
                  {user.name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-2xl">{user.name || "Anonymous"}</CardTitle>
                <p className="text-muted-foreground">{user.email}</p>
              </div>
            </div>
            <Button variant="outline" size="sm">
              <EditIcon className="mr-2 h-4 w-4" />
              Edit Profile
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex gap-4 border-b mb-4" role="tablist">
            {[
              { id: "overview", label: "Overview", icon: UserIcon },
              { id: "posts", label: "Posts", icon: BookOpenIcon },
              { id: "drafts", label: "Drafts", icon: HeartIcon },
            ].map((tab) => (
              <button
                key={tab.id}
                role="tab"
                aria-selected={activeTab === tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
                  activeTab === tab.id
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </div>

          {activeTab === "overview" && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Member since</p>
                  <p className="font-medium">
                    <CalendarIcon className="inline h-4 w-4 mr-1" />
                    {new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">
                    <MailIcon className="inline h-4 w-4 mr-1" />
                    {user.email}
                  </p>
                </div>
              </div>
              <Separator />
              <div>
                <h3 className="font-medium mb-2">Bio</h3>
                <p className="text-muted-foreground">
                  {user.name ? `Welcome to ${user.name}'s profile!` : "No bio yet. Add one in settings."}
                </p>
              </div>
              <Separator />
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-2xl font-bold">12</p>
                  <p className="text-sm text-muted-foreground">Posts</p>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-2xl font-bold">342</p>
                  <p className="text-sm text-muted-foreground">Followers</p>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-2xl font-bold">56</p>
                  <p className="text-sm text-muted-foreground">Following</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === "posts" && (
            <div className="text-center py-12 text-muted-foreground">
              <BookOpenIcon className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <p className="text-lg">Your published posts will appear here</p>
              <Link href="/write" className="mt-4 inline-block text-primary underline">
                Write your first post
              </Link>
            </div>
          )}

          {activeTab === "drafts" && (
            <div className="text-center py-12 text-muted-foreground">
              <HeartIcon className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <p className="text-lg">Your drafts will appear here</p>
              <Link href="/write" className="mt-4 inline-block text-primary underline">
                Create a draft
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}