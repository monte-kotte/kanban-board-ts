import type { CreateEpicRequest } from '../models';
import { unique } from '../../common/utils';

/** Builder for a {@link CreateEpicRequest}. A team id is required up front. */
export class EpicRequestBuilder {
  private model: CreateEpicRequest;

  constructor(teamId: string) {
    this.model = { teamId, title: unique('Epic') };
  }

  withTitle(title: string): this {
    this.model.title = title;
    return this;
  }

  withDescription(description: string): this {
    this.model.description = description;
    return this;
  }

  build(): CreateEpicRequest {
    return { ...this.model };
  }
}
