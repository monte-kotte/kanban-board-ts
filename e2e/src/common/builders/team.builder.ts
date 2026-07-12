import type { TeamModel } from '../models';
import { unique } from '../utils';

/** Fluent builder for a {@link TeamModel} with a unique default name. */
export class TeamBuilder {
  private model: TeamModel = {
    name: unique('Team'),
  };

  withName(name: string): this {
    this.model.name = name;
    return this;
  }

  build(): TeamModel {
    return { ...this.model };
  }
}
