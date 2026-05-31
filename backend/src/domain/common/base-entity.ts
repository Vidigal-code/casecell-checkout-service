import { randomUUID } from 'crypto';

export abstract class BaseEntity<Props> {
  protected readonly props: Props;
  private readonly _id: string;

  protected constructor(props: Props, id?: string) {
    this.props = props;
    this._id = id ?? randomUUID();
  }

  get id(): string {
    return this._id;
  }

  equals(entity?: BaseEntity<Props>): boolean {
    if (!entity) {
      return false;
    }
    return this._id === entity._id;
  }
}
