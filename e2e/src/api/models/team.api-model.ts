export interface CreateTeamRequest {
  name: string;
}

export type UpdateTeamRequest = CreateTeamRequest;

export interface TeamResponse {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}
