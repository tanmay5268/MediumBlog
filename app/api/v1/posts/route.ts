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
    const search = searchParams.get("search");

    const where: any = { status };

    if (categoryId) where.categoryId = categoryId;
    if (tagId) where.tags = { some: { tagId } };
    if (authorId) where.authorId = authorId;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { content: { contains: search, mode: "insensitive" } },
        { excerpt: { contains: search, mode: "insensitive" } },
      ];
    }

    const posts = await prisma.post.findMany({
      where,
      take: limit + 1,
      cursor: cursor ? { id: cursor } : undefined,
      include: {
        author: { select: { id: true, name: true, image: true, username: true } },
        category: { select: { id: true, name: true, slug: true } },
        tags: { include: { tag: { select: { id: true, name: true, slug: true } } } },
        _count: { select: { likes: true, comments: true, bookmarks: true } },
      },
      orderBy: { publishedAt: "desc" },
    });

    let nextCursor: string | undefined;
    if (posts.length > limit) {
      const nextPost = posts.pop();
      nextCursor = nextPost!.id;
    }

    return NextResponse.json({ posts, nextCursor, hasMore: !!nextCursor });
  } catch (error) {
    console.error("Error fetching posts:", error);
    return NextResponse.json({ error: "Failed to fetch posts" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      title,
      excerpt,
      content,
      slug,
      coverImage,
      status = "DRAFT",
      categoryId,
      tagIds = [],
    } = body;

    if (!title || !content || !slug) {
      return NextResponse.json(
        { error: "Title, content, and slug are required" },
        { status: 400 }
      );
    }

    const existingPost = await prisma.post.findUnique({ where: { slug } });
    if (existingPost) {
      return NextResponse.json({ error: "Slug already exists" }, { status: 400 });
    }

    const publishedAt = status === "PUBLISHED" ? new Date() : null;

    const post = await prisma.post.create({
      data: {
        title,
        excerpt,
        content,
        slug,
        coverImage,
        status,
        publishedAt,
        categoryId,
        tags: { create: tagIds.map((tagId: string) => ({ tagId })) },
        authorId: "current-user-id", // TODO: get from session
      },
      include: {
        author: { select: { id: true, name: true, image: true, username: true } },
        category: { select: { id: true, name: true, slug: true } },
        tags: { include: { tag: { select: { id: true, name: true, slug: true } } } },
        _count: { select: { likes: true, comments: true, bookmarks: true } },
      },
    });

    return NextResponse.json(post, { status: 201 });
  } catch (error) {
    console.error("Error creating post:", error);
    return NextResponse.json({ error: "Failed to create post" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}