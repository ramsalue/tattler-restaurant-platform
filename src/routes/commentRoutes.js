// src/routes/commentRoutes.js
const express = require('express');
const commentController = require('../controllers/commentController');
const { commentValidation, validateObjectId } = require('../middleware/validators');

// Again, { mergeParams: true } is required to access :restaurantId from the parent router.
const router = express.Router({ mergeParams: true });

// Define routes for comments.
router.route('/')
  .get(commentController.getCommentsByRestaurant)
  .post(commentValidation.create, commentController.createComment);

router.route('/:commentId')
  .get(validateObjectId('commentId'), commentController.getCommentById)
  .put(commentValidation.update, commentController.updateComment)
  .delete(validateObjectId('commentId'), commentController.deleteComment);

module.exports = router;