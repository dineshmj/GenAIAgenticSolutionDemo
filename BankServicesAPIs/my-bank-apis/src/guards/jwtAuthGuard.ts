import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { JWT_SIGNING_KEY } from 'src/config/secrets';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    // Get Authorization header.
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    // Ensure Bearer token.
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing or invalid Authorization header');
    }

    // Get the second element - payload part.
    const token = authHeader.split(' ')[1];
    
    try {
      // Base64-decode the JWT after verifying signature.
      const decoded = jwt.verify(token, JWT_SIGNING_KEY);

      // Get the user part.
      request.user = decoded; // Attach user details to the request object
      return true;
      
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}