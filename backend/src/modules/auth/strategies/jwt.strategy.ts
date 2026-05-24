import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

export interface JwtPayload {
  readonly sub: string;
  readonly email: string;
  readonly rol: string;
}

export interface AdminJwtUser {
  readonly id: string;
  readonly email: string;
  readonly rol: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env['JWT_SECRET'] ?? 'default-secret-change-in-production',
    });
  }

  validate(payload: JwtPayload): AdminJwtUser {
    return {
      id: payload.sub,
      email: payload.email,
      rol: payload.rol,
    };
  }
}
