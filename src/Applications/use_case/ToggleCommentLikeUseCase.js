class ToggleCommentLikeUseCase {
  constructor({ threadRepository, commentRepository, commentLikeRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._commentLikeRepository = commentLikeRepository;
  }

  async execute(threadId, commentId, owner) {
    await this._threadRepository.verifyThreadExists(threadId);
    await this._commentRepository.verifyCommentExists(commentId);
    
    const isLiked = await this._commentLikeRepository.verifyLikeExists(commentId, owner);
    
    if (isLiked) {
      await this._commentLikeRepository.deleteLike(commentId, owner);
    } else {
      await this._commentLikeRepository.addLike(commentId, owner);
    }
  }
}

module.exports = ToggleCommentLikeUseCase;