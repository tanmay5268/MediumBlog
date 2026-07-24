import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/utils/client";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const postId = searchParams.get("postId");
    const authorId = searchParams.get("authorId");
    const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 50);
    const cursor = searchParams.get("cursor");

    const where: any = {};
    if (postId) where.postId = postId;
    if (authorId) where.authorId = authorId;

    const images = await prisma.image.findMany({
      where,
      include: {
        author: { select: { id: true, name: true, image: true, username: true } },
        post: { select: { id: true, slug: true, title: true } },
      },
      orderBy: { createdAt: "desc" },
      take: limit + 1,
      ...(cursor && { cursor: { id: cursor }, skip: 1 }),
    });

    let nextCursor: string | null = null;
    if (images.length > limit) {
      const nextImage = images.pop()!;
      nextCursor = nextImage.id;
    }

    return NextResponse.json({ images, nextCursor, hasMore: !!nextCursor });
  } catch (error) {
    console.error("Error fetching images:", error);
    return NextResponse.json({ error: "Failed to fetch images" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url, alt, width, height, format, size, blurDataUrl, postId } = body;

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    const image = await prisma.image.create({
      data: {
        url,
        alt,
        width,
        height,
        format,
        size,
        blurDataUrl,
        postId,
        authorId: "current-user-id", // TODO: get from session
      },
      include: {
        author: { select: { id: true, name: true, image: true, username: true } },
        post: { select: { id: true, slug: true, title: true } },
      },
    });

    return NextResponse.json(image, { status: 201 });
  } catch (error) {
    console.error("Error creating image:", error);
    return NextResponse.json({ error: "Failed to create image" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}