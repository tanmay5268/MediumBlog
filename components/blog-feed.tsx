"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { HeartIcon, MessageSquareIcon, BookOpenIcon, ClockIcon } from "lucide-react";
import Link from "next/link";

interface Post {
  id: string;
  title: string;
  excerpt: string | null;
  content: string;
  slug: string;
  coverImage: string | null;
  status: string;
  publishedAt: Date | string | null;
  author: {
    id: string;
    name: string | null;
    image: string | null;
    username: string | null;
  };
  tags?: Array<{ tag: { name: string } }>;
  _count: {
    likes: number;
    comments: number;
    bookmarks: number;
  };
}

interface BlogFeedProps {
  initialPosts?: Post[];
}

export function BlogFeed({ initialPosts = [] }: BlogFeedProps) {
  const posts = initialPosts;

  if (posts.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <BookOpenIcon className="mx-auto h-12 w-12 mb-4 opacity-50" />
        <p className="text-lg">No posts yet</p>
        <p className="text-sm">Be the first to write a post!</p>
        <Link href="/write" className="mt-4 inline-block text-primary underline">
          Write your first post
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {posts.map((post) => (
        <Card key={post.id} className="overflow-hidden transition-shadow hover:shadow-lg">
          {post.coverImage && (
            <img
              src={post.coverImage}
              alt={post.title}
              className="w-full h-48 object-cover"
            />
          )}
          <CardHeader className={post.coverImage ? "pt-4" : ""}>
            <div className="flex items-center gap-2 mb-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={post.author?.image || undefined} alt={post.author?.name || "Author"} />
                <AvatarFallback className="text-xs">
                  {post.author?.name?.[0]?.toUpperCase() || "A"}
                </AvatarFallback>
              </Avatar>
              <Link
                href={`/u/${post.author?.username || post.author?.id}`}
                className="font-medium text-sm hover:underline"
              >
                {post.author?.name || "Anonymous"}
              </Link>
              <span className="text-muted-foreground text-xs">·</span>
              <time className="text-muted-foreground text-xs flex items-center gap-1">
                <ClockIcon className="h-3 w-3" />
                {post.publishedAt
                  ? new Date(post.publishedAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                  : "Just now"}
              </time>
            </div>
            <Link href={`/post/${post.slug}`}>
              <CardTitle className="text-2xl line-clamp-2">{post.title}</CardTitle>
            </Link>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground line-clamp-3">
              {post.excerpt || post.content.slice(0, 200)}...
            </p>
            <div className="flex flex-wrap gap-2">
              {post.tags?.slice(0, 3).map((tag: any) => (
                <Badge key={tag.tag?.name || tag.name} variant="secondary" className="text-xs">
                  {tag.tag?.name || tag.name}
                </Badge>
              ))}
            </div>
            <div className="flex items-center justify-between pt-4 border-t">
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <button className="flex items-center gap-1 hover:text-primary transition-colors">
                  <HeartIcon className="h-4 w-4" />
                  <span>{post._count?.likes || 0}</span>
                </button>
                <button className="flex items-center gap-1 hover:text-primary transition-colors">
                  <MessageSquareIcon className="h-4 w-4" />
                  <span>{post._count?.comments || 0}</span>
                </button>
                <button className="flex items-center gap-1 hover:text-primary transition-colors">
                  <BookOpenIcon className="h-4 w-4" />
                  <span>{post._count?.bookmarks || 0}</span>
                </button>
              </div>
              <Link
                href={`/post/${post.slug}`}
                className="text-sm font-medium text-primary hover:underline"
              >
                Read more →
              </Link>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}