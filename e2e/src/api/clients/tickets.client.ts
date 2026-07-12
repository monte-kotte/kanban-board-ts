import type { APIRequestContext } from '@playwright/test';
import { toApiResult } from './base.client';
import type {
  ApiResult,
  CreateTicketRequest,
  TicketQuery,
  TicketResponse,
  UpdateTicketRequest,
} from '../models';

export class TicketsClient {
  constructor(private readonly request: APIRequestContext) {}

  async list(query: TicketQuery): Promise<ApiResult<TicketResponse[]>> {
    const params = new URLSearchParams({ teamId: query.teamId });
    if (query.type) params.set('type', query.type);
    if (query.epicId) params.set('epicId', query.epicId);
    if (query.search) params.set('search', query.search);

    const response = await this.request.get(`tickets?${params.toString()}`);
    return toApiResult<TicketResponse[]>(response);
  }

  async get(id: string): Promise<ApiResult<TicketResponse>> {
    const response = await this.request.get(`tickets/${id}`);
    return toApiResult<TicketResponse>(response);
  }

  async create(body: CreateTicketRequest): Promise<ApiResult<TicketResponse>> {
    const response = await this.request.post('tickets', { data: body });
    return toApiResult<TicketResponse>(response);
  }

  async update(id: string, body: UpdateTicketRequest): Promise<ApiResult<TicketResponse>> {
    const response = await this.request.patch(`tickets/${id}`, { data: body });
    return toApiResult<TicketResponse>(response);
  }

  async delete(id: string): Promise<ApiResult<undefined>> {
    const response = await this.request.delete(`tickets/${id}`);
    return toApiResult<undefined>(response);
  }
}
