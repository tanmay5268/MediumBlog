// prisma/seed.ts
//
// Generates large, realistically-SKEWED data for the blog schema so you can
// observe real bottlenecks (N+1s, missing indexes, slow OFFSET pagination,
// hot rows) instead of a uniform toy dataset.
//
// Usage:
//   bun prisma/seed.ts
//
// Tune the CONFIG block below. Start small (SCALE=1) to confirm it works,
// then bump to SCALE=10 or SCALE=50 to actually feel the pain.

import { PostStatus, UserRole } from "@/generated/prisma/client";
import { faker } from "@faker-js/faker";
import { prisma } from "@/app/utils/client";

// ---------------------------------------------------------------------------
// CONFIG — bump SCALE up once the small run works
// ---------------------------------------------------------------------------
const SCALE = 1; // multiplier for everything below
const NUM_USERS = 200 * SCALE;
const NUM_TAGS = 10;
const NUM_POSTS = 200 * SCALE;
const BATCH_SIZE = 100; // never insert row-by-row, always batch

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

// Insert in batches instead of one giant array (avoids memory blowups and
// query-size limits — this itself is a lesson: try BATCH_SIZE = 50000 and
// watch createMany choke).
async function batchInsert<T>(
  label: string,
  items: T[],
  insertFn: (chunk: T[]) => Promise<unknown>
) {
  const start = Date.now();
  for (let i = 0; i < items.length; i += BATCH_SIZE) {
    const chunk = items.slice(i, i + BATCH_SIZE);
    await insertFn(chunk);
    process.stdout.write(
      `\r${label}: ${Math.min(i + BATCH_SIZE, items.length)}/${items.length}`
    );
  }
  const seconds = ((Date.now() - start) / 1000).toFixed(1);
  console.log(` (done in ${seconds}s)`);
}

// Power-law-ish weighted pick: makes a small number of items "hot"
// (e.g. a few power-user authors with thousands of posts, most with a few).
function weightedIndex(n: number): number {
  // Skews heavily toward low indices using an exponential distribution
  const r = Math.random();
  const idx = Math.floor(-Math.log(1 - r) * (n / 8));
  return Math.min(idx, n - 1);
}

function messyBio(): string | null {
  // Real-world messiness: nulls, empty strings, emoji, long text, trailing spaces
  const roll = Math.random();
  if (roll < 0.15) return null;
  if (roll < 0.2) return "";
  if (roll < 0.25) return "  trailing space bio  ";
  if (roll < 0.3) return faker.lorem.paragraphs(3); // unusually long bio
  if (roll < 0.35) return "🔥 dev | coffee ☕ | building stuff 🚀";
  return faker.lorem.sentence();
}

// Lightweight random-N-picker — avoids shuffling the full tag array on every
// single post (20,000x faker.helpers.shuffle() was the main slowdown).
function pickRandomTags(tagIds: string[], count: number): string[] {
  const picked = new Set<string>();
  while (picked.size < count && picked.size < tagIds.length) {
    picked.add(tagIds[Math.floor(Math.random() * tagIds.length)]);
  }
  return Array.from(picked);
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
async function main() {
  console.time("total seed time");

  // -------------------------------------------------------------------
  // 1. USERS
  // -------------------------------------------------------------------
  console.log("Generating users...");
  const users = Array.from({ length: NUM_USERS }).map((_, i) => {
    const username = faker.internet.username().toLowerCase() + i; // ensure uniqueness at scale
    const role: UserRole = Math.random() < 0.02 ? "ADMIN" : "USER";
    return {
      name: faker.person.fullName(),
      username,
      email: faker.internet.email({ firstName: username }).toLowerCase(),
      bio: messyBio(),
      role,
      image: Math.random() < 0.7 ? faker.image.avatar() : null,
      createdAt: faker.date.between({ from: "2019-01-01", to: "2026-07-18" }),
    };
  });

  await batchInsert("Users", users, (chunk) =>
    prisma.user.createMany({ data: chunk, skipDuplicates: true })
  );

  const userRows = await prisma.user.findMany({ select: { id: true } });
  const userIds = userRows.map((u) => u.id);

  // -------------------------------------------------------------------
  // 2. TAGS
  // -------------------------------------------------------------------
  console.log("Generating tags...");
  const tagNames = new Set<string>();
  while (tagNames.size < NUM_TAGS) tagNames.add(faker.hacker.noun());
  const tags = Array.from(tagNames).map((name) => ({
    name,
    slug: name.toLowerCase().replace(/\s+/g, "-") + "-" + faker.string.alphanumeric(4),
  }));
  await prisma.tag.createMany({ data: tags, skipDuplicates: true });
  const tagRows = await prisma.tag.findMany({ select: { id: true } });
  const tagIds = tagRows.map((t) => t.id);
  console.log(`Tags: ${tagIds.length}/${NUM_TAGS}`);

  // -------------------------------------------------------------------
  // 3. POSTS — skewed authorship (a few users write A LOT)
  // -------------------------------------------------------------------
  console.log("Generating posts...");
  const statuses: PostStatus[] = ["DRAFT", "PUBLISHED", "PUBLISHED", "PUBLISHED", "ARCHIVED"];
  // ^ weighted toward PUBLISHED since that's the realistic majority

  const posts = Array.from({ length: NUM_POSTS }).map((_, i) => {
    const authorId = userIds[weightedIndex(userIds.length)]; // power-user skew
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const title = faker.lorem.sentence({ min: 4, max: 12 });
    return {
      title,
      excerpt: Math.random() < 0.8 ? faker.lorem.sentences(2) : null,
      content: faker.lorem.paragraphs({ min: 3, max: 20 }, "\n\n"),
      slug: faker.helpers.slugify(title).toLowerCase() + "-" + i, // guaranteed unique
      coverImage: Math.random() < 0.5 ? faker.image.urlPicsumPhotos() : null,
      status,
      publishedAt: status === "PUBLISHED" ? faker.date.past({ years: 3 }) : null,
      authorId,
      createdAt: faker.date.past({ years: 3 }),
    };
  });

  await batchInsert("Posts", posts, (chunk) =>
    prisma.post.createMany({ data: chunk, skipDuplicates: true })
  );

  const postRows = await prisma.post.findMany({ select: { id: true, authorId: true } });
  const postIds = postRows.map((p) => p.id);

  // -------------------------------------------------------------------
  // 4. POST-TAGS (many-to-many) — 1 to 5 tags per post
  // -------------------------------------------------------------------
  console.log("Generating post-tags...");
  const postTagPairs = new Set<string>();
  const postTags: { postId: string; tagId: string }[] = [];
  for (const postId of postIds) {
    const tagCount = faker.number.int({ min: 1, max: 5 });
    const pickedTags = pickRandomTags(tagIds, tagCount);
    for (const tagId of pickedTags) {
      const key = `${postId}:${tagId}`;
      if (!postTagPairs.has(key)) {
        postTagPairs.add(key);
        postTags.push({ postId, tagId });
      }
    }
  }
  await batchInsert("PostTags", postTags, (chunk) =>
    prisma.postTag.createMany({ data: chunk, skipDuplicates: true })
  );

  // -------------------------------------------------------------------
  // 5. COMMENTS — skewed toward a few viral posts (hot rows!)
  // -------------------------------------------------------------------
  console.log("Generating comments...");
  const NUM_COMMENTS = NUM_POSTS * 3; // avg 3 comments/post, but heavily skewed
  const comments = Array.from({ length: NUM_COMMENTS }).map(() => {
    const postId = postIds[weightedIndex(postIds.length)]; // some posts get thousands
    const authorId = userIds[Math.floor(Math.random() * userIds.length)];
    return {
      content: faker.lorem.sentences({ min: 1, max: 4 }),
      postId,
      authorId,
      createdAt: faker.date.past({ years: 2 }),
    };
  });
  await batchInsert("Comments", comments, (chunk) =>
    prisma.comment.createMany({ data: chunk, skipDuplicates: true })
  );

  // -------------------------------------------------------------------
  // 6. LIKES — high volume, unique (userId, postId) pairs
  // -------------------------------------------------------------------
  console.log("Generating likes...");
  const likePairs = new Set<string>();
  const likes: { userId: string; postId: string; createdAt: Date }[] = [];
  const NUM_LIKES = NUM_POSTS * 8; // likes vastly outnumber comments, as IRL
  let attempts = 0;
  while (likes.length < NUM_LIKES && attempts < NUM_LIKES * 3) {
    attempts++;
    const userId = userIds[Math.floor(Math.random() * userIds.length)];
    const postId = postIds[weightedIndex(postIds.length)]; // viral posts get way more likes
    const key = `${userId}:${postId}`;
    if (likePairs.has(key)) continue;
    likePairs.add(key);
    likes.push({ userId, postId, createdAt: faker.date.past({ years: 2 }) });
  }
  await batchInsert("Likes", likes, (chunk) =>
    prisma.like.createMany({ data: chunk, skipDuplicates: true })
  );

  // -------------------------------------------------------------------
  // 7. BOOKMARKS — lower volume than likes
  // -------------------------------------------------------------------
  console.log("Generating bookmarks...");
  const bookmarkPairs = new Set<string>();
  const bookmarks: { userId: string; postId: string; createdAt: Date }[] = [];
  const NUM_BOOKMARKS = Math.floor(NUM_POSTS * 1.5);
  attempts = 0;
  while (bookmarks.length < NUM_BOOKMARKS && attempts < NUM_BOOKMARKS * 3) {
    attempts++;
    const userId = userIds[Math.floor(Math.random() * userIds.length)];
    const postId = postIds[Math.floor(Math.random() * postIds.length)]; // no skew here, on purpose
    const key = `${userId}:${postId}`;
    if (bookmarkPairs.has(key)) continue;
    bookmarkPairs.add(key);
    bookmarks.push({ userId, postId, createdAt: faker.date.past({ years: 2 }) });
  }
  await batchInsert("Bookmarks", bookmarks, (chunk) =>
    prisma.bookmark.createMany({ data: chunk, skipDuplicates: true })
  );

  console.timeEnd("total seed time");
  console.log(`
Seed summary:
  Users:      ${userIds.length}
  Tags:       ${tagIds.length}
  Posts:      ${postIds.length}
  PostTags:   ${postTags.length}
  Comments:   ${comments.length}
  Likes:      ${likes.length}
  Bookmarks:  ${bookmarks.length}
`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });