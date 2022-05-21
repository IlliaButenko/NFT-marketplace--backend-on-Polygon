import { Request as HttpRequest } from 'express';
import { JwtPayload } from './jwtPayload.interface';

export type AuthRequest = HttpRequest & { user: JwtPayload };
