import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/utils/client";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const parentId = searchParams.get("parentId") || null;
    const includeChildren = searchParams.get("includeChildren") === "true";

    const categories = await prisma.category.findMany({
      where: { parentId },
      include: {
        children: includeChildren ? true : false,
        _count: { select: { posts: true } },
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json(categories);
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, slug, description, parentId } = body;

    if (!name || !slug) {
      return NextResponse.json({ error: "Name and slug are required" }, { status: 400 });
    }

    const category = await prisma.category.create({
      data: { name, slug, description, parentId },
      include: { children: true, _count: { select: { posts: true } } },
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    console.error("Error creating category:", error);
    return NextResponse.json({ error: "Failed to create category" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}