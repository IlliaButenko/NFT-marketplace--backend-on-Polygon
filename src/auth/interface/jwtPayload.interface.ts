import { ID } from '../../global/interfaces/id.interface';

export interface JwtPayload {
  username: string;
  id: ID;
  address: string;
}
