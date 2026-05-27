import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

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
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') ?? 'default-secret-change-in-production',
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