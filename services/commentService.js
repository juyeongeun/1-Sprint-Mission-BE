import prisma from "../models/index.js";

const parseId = (id) => parseInt(id, 10);

const getCursorOptions = (cursor) => {
  const parsedCursor = parseInt(cursor, 10);
  if (!cursor || isNaN(parsedCursor)) return {};
  return {
    cursor: { id: parsedCursor },
    skip: 1,
  };
};

const getCommentOptions = (limit, cursor, entityId, entityType) => ({
  take: limit,
  orderBy: { createdAt: "desc" },
  include: { writer: true },
  where: {
    [entityType]: entityId,
  },
  ...getCursorOptions(cursor),
});

const createComment = async (content, userId, entityId, entityType) => {
  const data = { content, userId };
  data[entityType] = entityId;

  const newComment = await prisma.comment.create({
    data,
    include: { writer: true },
  });

  return newComment;
};

const getComments = async (limit, cursor, entityId, entityType) => {
  const queryOptions = getCommentOptions(limit, cursor, entityId, entityType);
  const list = await prisma.comment.findMany(queryOptions);
  const nextCursor = list.length === limit ? list[list.length - 1].id : null;

  return { list, nextCursor };
};

export const createProductComment = async (content, userId, productId) => {
  return createComment(content, userId, parseId(productId), "productId");
};

export const createArticleComment = async (content, userId, articleId) => {
  return createComment(content, userId, parseId(articleId), "articleId");
};

export const getProductComments = async (limit, cursor, productId) => {
  return getComments(limit, cursor, productId, "productId");
};

export const getArticleComments = async (limit, cursor, articleId) => {
  return getComments(limit, cursor, articleId, "articleId");
};

export const updateComment = async (commentId, content) => {
  return prisma.comment.update({
    where: { id: parseId(commentId) },
    data: { content },
    include: { writer: true },
  });
};

export const deleteComment = async (commentId) => {
  await prisma.comment.delete({ where: { id: parseId(commentId) } });
};
