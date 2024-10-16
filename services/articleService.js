import prisma from "../models/index.js";

const includeRelations = (userId) => ({
  writer: true,
  favorites: {
    where: { userId: parseInt(userId) },
    select: { id: true },
  },
});

const generateWhereCondition = (keyword) => {
  return keyword
    ? {
        OR: [
          { title: { contains: keyword, mode: "insensitive" } },
          { content: { contains: keyword, mode: "insensitive" } },
        ],
      }
    : {};
};

const generateOrderCondition = (orderBy) => {
  if (orderBy === "favorite") {
    return [{ likeCount: "desc" }, { createdAt: "desc" }];
  }
  return { createdAt: "desc" };
};

export const createArticle = async (images, content, title, userId) => {
  return prisma.article.create({
    data: { images, content, title, userId },
    include: includeRelations(userId),
  });
};

export const getArticles = async (
  page = 1,
  pageSize = 10,
  keyword = "",
  orderBy = "recent"
) => {
  const offset = (page - 1) * pageSize;

  const [list, totalCount] = await prisma.$transaction([
    prisma.article.findMany({
      where: generateWhereCondition(keyword),
      skip: offset,
      take: pageSize,
      orderBy: generateOrderCondition(orderBy),
      include: { writer: true },
    }),
    prisma.article.count({
      where: generateWhereCondition(keyword),
    }),
  ]);

  const listWithLikeStatus = list.map((article) => ({
    ...article,
  }));

  return { list: listWithLikeStatus, totalCount, page, pageSize };
};

export const getArticleById = async (articleId, userId) => {
  const article = await prisma.article.findUnique({
    where: { id: parseInt(articleId) },
    include: includeRelations(userId),
  });

  if (!article) throw new Error("Article not found");

  const isLiked = article.favorites.length > 0;

  return { ...article, isLiked };
};

export const updateArticle = async (articleId, images, title, content) => {
  return prisma.article.update({
    where: { id: parseInt(articleId) },
    data: { images, title, content },
    include: { writer: true },
  });
};

export const deleteArticle = async (articleId) => {
  await prisma.article.delete({ where: { id: parseInt(articleId) } });
};

export const addLike = async (articleId, userId) => {
  await prisma.favorite.create({
    data: { articleId: parseInt(articleId), userId: parseInt(userId) },
  });

  return prisma.article.update({
    where: { id: parseInt(articleId) },
    data: {
      likeCount: { increment: 1 },
    },
    include: includeRelations(userId),
  });
};

export const deleteLike = async (articleId, userId) => {
  await prisma.favorite.deleteMany({
    where: { articleId: parseInt(articleId), userId: parseInt(userId) },
  });

  return prisma.article.update({
    where: { id: parseInt(articleId) },
    data: {
      likeCount: { decrement: 1 },
    },
    include: includeRelations(userId),
  });
};
