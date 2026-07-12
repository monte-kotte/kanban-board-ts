import type { UserModel } from '../models';
import { unique } from './unique';

/** Fluent builder for a {@link UserModel} with sensible, valid defaults. */
export class UserBuilder {
  private model: UserModel = {
    email: `${unique('user')}@example.com`,
    password: 'password123',
  };

  withEmail(email: string): this {
    this.model.email = email;
    return this;
  }

  withPassword(password: string): this {
    this.model.password = password;
    return this;
  }

  build(): UserModel {
    return { ...this.model };
  }
}
