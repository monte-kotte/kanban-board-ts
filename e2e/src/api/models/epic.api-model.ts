export interface CreateEpicRequest {
  teamId: string;
  title: string;
  description?: string;
}

export interface UpdateEpicRequest {
  title?: string;
  description?: string;
}

export interface EpicResponse {
  id: string;
  teamId: string;
  title: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}
