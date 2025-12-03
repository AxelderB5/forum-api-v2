const Comment = require('../../Domains/comments/entities/Comment');
const Reply = require('../../Domains/replies/entities/Reply');

class GetThreadUseCase {
  constructor({ threadRepository, commentRepository, replyRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._replyRepository = replyRepository;
  }

  async execute(threadId) {
    await this._threadRepository.verifyThreadExists(threadId);
    const thread = await this._threadRepository.getThreadById(threadId);
    const commentsData = await this._commentRepository.getCommentsByThreadId(threadId);

    const commentsWithReplies = await Promise.all(
      commentsData.map(async (commentData) => {
        const comment = new Comment({
          id: commentData.id,
          username: commentData.username,
          date: commentData.date,
          content: commentData.content,
          isDelete: commentData.is_delete,
        });

        const repliesData = await this._replyRepository.getRepliesByCommentId(comment.id);
        const replies = repliesData.map((replyData) => {
          const reply = new Reply({
            id: replyData.id,
            content: replyData.content,
            date: replyData.date,
            username: replyData.username,
            isDelete: replyData.is_delete,
          });

          return {
            id: reply.id,
            content: reply.isDelete ? '**balasan telah dihapus**' : reply.content,
            date: reply.date,
            username: reply.username,
          };
        });

        return {
          id: comment.id,
          username: comment.username,
          date: comment.date,
          content: comment.isDelete ? '**komentar telah dihapus**' : comment.content,
          likeCount: parseInt(commentData.like_count || 0, 10),
          replies,
        };
      }),
    );

    return {
      ...thread,
      comments: commentsWithReplies,
    };
  }
}

module.exports = GetThreadUseCase;
