import type { APIRequestContext } from '@playwright/test';
import { toApiResult } from './base.client';
import type { ApiResult, CommentResponse, CreateCommentRequest } from '../models';

export class CommentsClient {
  constructor(private readonly request: APIRequestContext) {}

  async list(ticketId: string): Promise<ApiResult<CommentResponse[]>> {
    const response = await this.request.get(`tickets/${ticketId}/comments`);
    return toApiResult<CommentResponse[]>(response);
  }

  async create(ticketId: string, body: CreateCommentRequest): Promise<ApiResult<CommentResponse>> {
    const response = await this.request.post(`tickets/${ticketId}/comments`, { data: body });
    return toApiResult<CommentResponse>(response);
  }
}
