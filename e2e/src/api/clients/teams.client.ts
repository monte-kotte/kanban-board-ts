import type { APIRequestContext } from '@playwright/test';
import { toApiResult } from './base.client';
import type { ApiResult, CreateTeamRequest, TeamResponse, UpdateTeamRequest } from '../models';

export class TeamsClient {
  constructor(private readonly request: APIRequestContext) {}

  async list(): Promise<ApiResult<TeamResponse[]>> {
    const response = await this.request.get('teams');
    return toApiResult<TeamResponse[]>(response);
  }

  async get(id: string): Promise<ApiResult<TeamResponse>> {
    const response = await this.request.get(`teams/${id}`);
    return toApiResult<TeamResponse>(response);
  }

  async create(body: CreateTeamRequest): Promise<ApiResult<TeamResponse>> {
    const response = await this.request.post('teams', { data: body });
    return toApiResult<TeamResponse>(response);
  }

  async update(id: string, body: UpdateTeamRequest): Promise<ApiResult<TeamResponse>> {
    const response = await this.request.patch(`teams/${id}`, { data: body });
    return toApiResult<TeamResponse>(response);
  }

  async delete(id: string): Promise<ApiResult<undefined>> {
    const response = await this.request.delete(`teams/${id}`);
    return toApiResult<undefined>(response);
  }
}
