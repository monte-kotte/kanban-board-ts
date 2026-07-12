export interface CreateCommentRequest {
  body: string;
}

export interface CommentResponse {
  id: string;
  ticketId: string;
  authorId: string;
  author: { id: string; email: string };
  body: string;
  createdAt: string;
}
