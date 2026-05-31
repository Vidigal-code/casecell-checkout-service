import { BaseEntity } from '../common/base-entity';
import { ValidationError } from '../common/errors';
import { Role } from './role.enum';

export interface UserProps {
  email: string;
  passwordHash: string;
  role: Role;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export class User extends BaseEntity<UserProps> {
  get email(): string {
    return this.props.email;
  }

  get passwordHash(): string {
    return this.props.passwordHash;
  }

  get role(): Role {
    return this.props.role;
  }

  get isActive(): boolean {
    return this.props.isActive;
  }

  get createdAt(): Date | undefined {
    return this.props.createdAt;
  }

  get updatedAt(): Date | undefined {
    return this.props.updatedAt;
  }

  public static create(props: UserProps, id?: string): User {
    if (!props.email) {
      throw new ValidationError('Email is required.');
    }
    return new User(props, id);
  }

  public activate(): void {
    this.props.isActive = true;
  }

  public deactivate(): void {
    this.props.isActive = false;
  }
}
