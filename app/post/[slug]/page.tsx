import { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/app/utils/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { HeartIcon, MessageSquareIcon, BookmarkIcon, Share2Icon, ClockIcon, ArrowLeftIcon } from "lucide-react";
import Link from "next/link";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await prisma.post.findUnique({
    where: { slug },
    include: { author: { select: { name: true, image: true } } },
  });

  if (!post) return { title: "Post Not Found" };

  return {
    title: post.title,
    description: post.excerpt || post.content.slice(0, 160),
    openGraph: {
      title: post.title,
      description: post.excerpt || post.content.slice(0, 160),
      images: post.coverImage ? [post.coverImage] : [],
      type: "article",
      publishedTime: post.publishedAt?.toISOString(),
      authors: post.author.name ? [post.author.name] : [],
    },
  };
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params;

  const post = await prisma.post.findUnique({
    where: { slug },
    include: {
      author: {
        select: { id: true, name: true, image: true, username: true, bio: true },
      },
      tags: { include: { tag: true } },
      _count: { select: { likes: true, comments: true, bookmarks: true } },
    },
  });

  if (!post) notFound();

  const { author, ...postData } = post!;

  return (
    <article className="max-w-3xl mx-auto py-12 px-4 space-y-8">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
      >
        <ArrowLeftIcon className="h-4 w-4" />
        Back to feed
      </Link>

      <header className="space-y-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={author.image || undefined} alt={author.name || "Author"} />
            <AvatarFallback className="text-sm">
              {author.name?.[0]?.toUpperCase() || "A"}
            </AvatarFallback>
          </Avatar>
          <div>
            <Link
              href={`/u/${author.username || author.id}`}
              className="font-medium hover:underline"
            >
              {author.name || "Anonymous"}
            </Link>
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <ClockIcon className="h-3 w-3" />
              {postData.publishedAt
                ? new Date(postData.publishedAt).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })
                : "Just now"}
            </p>
          </div>
        </div>

        <h1 className="text-4xl md:text-5xl font-bold leading-tight">{postData.title}</h1>

        <div className="flex flex-wrap gap-2">
          {postData.tags.map(({ tag }) => (
            <Badge key={tag.id} variant="secondary" className="text-sm">
              {tag.name}
            </Badge>
          ))}
        </div>
      </header>

      {postData.coverImage && (
        <div className="rounded-xl overflow-hidden">
          <img
            src={postData.coverImage}
            alt={postData.title}
            className="w-full h-auto max-h-[500px] object-cover"
          />
        </div>
      )}

      <div className="prose prose-lg max-w-none space-y-6">
        {postData.excerpt && (
          <p className="text-xl text-muted-foreground font-medium border-l-4 border-primary pl-4 italic">
            {postData.excerpt}
          </p>
        )}
        <div className="whitespace-pre-wrap">{postData.content}</div>
      </div>

      <footer className="border-t pt-8 space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <Link
              href={`/u/${author.username || author.id}`}
              className="flex items-center gap-2"
            >
              <Avatar className="h-8 w-8">
                <AvatarImage src={author.image || undefined} alt={author.name || "Author"} />
                <AvatarFallback className="text-xs">
                  {author.name?.[0]?.toUpperCase() || "A"}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{author.name || "Anonymous"}</p>
                <p className="text-sm text-muted-foreground">Author</p>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" className="gap-1">
              <HeartIcon className="h-4 w-4" />
              <span>{postData._count.likes}</span>
            </Button>
            <Button variant="outline" size="icon" className="gap-1">
              <MessageSquareIcon className="h-4 w-4" />
              <span>{postData._count.comments}</span>
            </Button>
            <Button variant="outline" size="icon" className="gap-1">
              <BookmarkIcon className="h-4 w-4" />
              <span>{postData._count.bookmarks}</span>
            </Button>
            <Button variant="outline" size="icon" className="gap-1">
              <Share2Icon className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {author.bio && (
          <Card>
            <CardContent className="pt-6">
              <h3 className="font-medium mb-2">About the author</h3>
              <p className="text-muted-foreground">{author.bio}</p>
            </CardContent>
          </Card>
        )}
      </footer>
    </article>
  );
}