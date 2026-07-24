import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/utils/client";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const postId = searchParams.get("postId");
    const cursor = searchParams.get("cursor");
    const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 50);
    const parentId = searchParams.get("parentId") || null;

    if (!postId) {
      return NextResponse.json({ error: "postId is required" }, { status: 400 });
    }

    const comments = await prisma.comment.findMany({
      where: { postId, parentId: parentId || null },
      include: {
        author: { select: { id: true, name: true, image: true, username: true } },
        _count: { select: { replies: true } },
        replies: {
          take: 3,
          orderBy: { createdAt: "asc" },
          include: {
            author: { select: { id: true, name: true, image: true, username: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: limit + 1,
      ...(cursor && { cursor: { id: cursor }, skip: 1 }),
    });

    let nextCursor: string | null = null;
    if (comments.length > limit) {
      const nextComment = comments.pop()!;
      nextCursor = nextComment.id;
    }

    return NextResponse.json({ comments, nextCursor, hasMore: !!nextCursor });
  } catch (error) {
    console.error("Error fetching comments:", error);
    return NextResponse.json({ error: "Failed to fetch comments" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { postId, content, parentId } = body;

    if (!postId) {
      return NextResponse.json({ error: "postId is required" }, { status: 400 });
    }
    if (!content || content.trim().length === 0) {
      return NextResponse.json({ error: "Content is required" }, { status: 400 });
    }

    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    if (parentId) {
      const parentComment = await prisma.comment.findUnique({ where: { id: parentId } });
      if (!parentComment || parentComment.postId !== postId) {
        return NextResponse.json({ error: "Invalid parent comment" }, { status: 400 });
      }
    }

    const comment = await prisma.comment.create({
      data: {
        content,
        postId,
        authorId: "current-user-id", // TODO: get from session
        parentId: parentId || null,
      },
      include: {
        author: { select: { id: true, name: true, image: true, username: true } },
        _count: { select: { replies: true } },
      },
    });

    return NextResponse.json(comment, { status: 201 });
  } catch (error) {
    console.error("Error creating comment:", error);
    return NextResponse.json({ error: "Failed to create comment" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}