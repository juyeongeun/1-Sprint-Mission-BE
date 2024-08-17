import express from "express";
import {
  createComment,
  getComments,
  updateComment,
  deleteComment,
} from "../service/articleCommentService.js";

const router = express.Router();

router.post("/:articleId", createComment);
router.get("/:articleId", getComments);
router.put("/:id", updateComment);
router.delete("/:id", deleteComment);

export default router;
