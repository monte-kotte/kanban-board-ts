import type { CommentModel } from '../models';

/** Fluent builder for a {@link CommentModel}. */
export class CommentBuilder {
  private model: CommentModel = {
    body: 'Automated end-to-end test comment.',
  };

  withBody(body: string): this {
    this.model.body = body;
    return this;
  }

  build(): CommentModel {
    return { ...this.model };
  }
}
