import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/utils/client";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const cursor = searchParams.get("cursor");
    const limit = Math.min(parseInt(searchParams.get("limit") || "10"), 50);
    const status = searchParams.get("status") || "PUBLISHED";
    const categoryId = searchParams.get("categoryId");
    const tagId = searchParams.get("tagId");
    const authorId = searchParams.get("authorId");
    const q = searchParams.get("q");

    const where: any = { status };

    if (categoryId) where.categoryId = categoryId;
    if (tagId) where.tags = { some: { tagId } };
    if (authorId) where.authorId = authorId;

    if (q && q.trim().length >= 2) {
      // Use full-text search with tsvector
      // First try exact phrase match, then partial match
      const searchTerms = q.trim().split(/\s+/).join(" & ");
      
      where.OR = [
        { title: { search: searchTerms } },
        { content: { search: searchTerms } },
        { excerpt: { search: searchTerms } },
        // Fallback to contains for partial matches
        { title: { contains: q, mode: "insensitive" } },
        { content: { contains: q, mode: "insensitive" } },
        { excerpt: { contains: q, mode: "insensitive" } },
      ];
    }

    const posts = await prisma.post.findMany({
      where,
      include: {
        author: { select: { id: true, name: true, image: true, username: true } },
        category: { select: { id: true, name: true, slug: true } },
        tags: { include: { tag: { select: { id: true, name: true, slug: true } } } },
        _count: { select: { likes: true, comments: true, bookmarks: true } },
      },
      orderBy: { publishedAt: "desc" },
      take: limit + 1,
      ...(cursor && { cursor: { id: cursor }, skip: 1 }),
    });

    let nextCursor: string | null = null;
    if (posts.length > limit) {
      const nextPost = posts.pop()!;
      nextCursor = nextPost.id;
    }

    return NextResponse.json({
      posts,
      nextCursor,
      hasMore: !!nextCursor,
      limit,
    });
  } catch (error) {
    console.error("Error searching posts:", error);
    return NextResponse.json({ error: "Failed to search posts" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}