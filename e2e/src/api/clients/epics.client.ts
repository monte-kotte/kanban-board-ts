import type { APIRequestContext } from '@playwright/test';
import { toApiResult } from './base.client';
import type { ApiResult, CreateEpicRequest, EpicResponse, UpdateEpicRequest } from '../models';

export class EpicsClient {
  constructor(private readonly request: APIRequestContext) {}

  async list(teamId?: string): Promise<ApiResult<EpicResponse[]>> {
    const query = teamId ? `?teamId=${teamId}` : '';
    const response = await this.request.get(`epics${query}`);
    return toApiResult<EpicResponse[]>(response);
  }

  async get(id: string): Promise<ApiResult<EpicResponse>> {
    const response = await this.request.get(`epics/${id}`);
    return toApiResult<EpicResponse>(response);
  }

  async create(body: CreateEpicRequest): Promise<ApiResult<EpicResponse>> {
    const response = await this.request.post('epics', { data: body });
    return toApiResult<EpicResponse>(response);
  }

  async update(id: string, body: UpdateEpicRequest): Promise<ApiResult<EpicResponse>> {
    const response = await this.request.patch(`epics/${id}`, { data: body });
    return toApiResult<EpicResponse>(response);
  }

  async delete(id: string): Promise<ApiResult<undefined>> {
    const response = await this.request.delete(`epics/${id}`);
    return toApiResult<undefined>(response);
  }
}
