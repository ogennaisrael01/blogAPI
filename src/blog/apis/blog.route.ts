import{ Router }from 'express';
import { create, listPost, retreiveBlog , updateBlog, destroyBlog, search, feed, userBlogs, blogInteractions, summarize } from '../controllers/blog.ct';
import { checkAuth } from '../../middlewares/auth';
import { isBlogOwner, isCommentOwner } from '../security';
import { upload } from '../cloudinaryConfig';
import { likePost, unlikePost } from '../controllers/likes.ctl';
import { blogIdRequired, commentIdRequired } from '../../middlewares/validators';
import { addComment, createNestedReply, deleteComment, list, listNestedResplies, update, userComments } from '../controllers/comment.ct';
import { bookmarkPost, clearBookmark, listBookmarks, removeBookmark } from '../controllers/bookmark.ctl';

export const router = Router();

router.post("/blogs", upload.array("files", 10),checkAuth, create)
router.get("/blogs-user", checkAuth, userBlogs)
router.post("/blogs/:blogId/interact", blogIdRequired, checkAuth, blogInteractions)
router.get("/blogs", listPost)
router.get('/blogs/search', search)
router.get('/blogs/feed', feed)
router.get("/blogs/feed/user", checkAuth, feed)
router.get("/blogs/:blogId", retreiveBlog)
router.put("/blogs/:blogId", checkAuth, isBlogOwner, updateBlog)
router.delete("/blogs/:blogId", checkAuth, isBlogOwner, destroyBlog)
router.get("/blogs/:blogId/summarize", blogIdRequired, summarize)

// likes
router.post("/blogs/:blogId/like", checkAuth, likePost)
router.delete("/blogs/:blogId/unlike", checkAuth, unlikePost)

//comments
router.get("/comments-user", checkAuth, userComments)
router.post("/blogs/:blogId/comments", blogIdRequired, checkAuth, addComment)
router.get("/blogs/:blogId/comments", blogIdRequired, checkAuth, list)
router.put("/blogs/:blogId/comments/:commentId", blogIdRequired, commentIdRequired, checkAuth, isCommentOwner, update)
router.delete("/blogs/:blogId/comments/:commentId", blogIdRequired, commentIdRequired, checkAuth, isCommentOwner, deleteComment)
router.post("/blogs/:blogId/comments/:commentId/replies", blogIdRequired, commentIdRequired, checkAuth, createNestedReply)
router.get("/blogs/:blogId/comments/:commentId/replies", blogIdRequired, commentIdRequired, checkAuth, listNestedResplies)

//bookmarks 
router.post("/blogs/:blogId/bookmark", blogIdRequired, checkAuth, bookmarkPost)
router.post("/blogs/:blogId/bookmark/:bookmarkId", blogIdRequired, checkAuth, removeBookmark)
router.delete("/blogs/bookmarks", checkAuth, clearBookmark)
router.get("/blogs/bookmarks", checkAuth, listBookmarks)