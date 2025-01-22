import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { SetMetadata } from '@nestjs/common';

export const Roles = (...roles: string[]) => SetMetadata('roles', roles);

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    // Extract the roles specified using Reflector.
    const requiredRoles = this.reflector.get<string[]>('roles', context.getHandler());

    if (!requiredRoles) {
      return true; // No roles defined, allow by default
    }

    // Compare user's roles with role required.
    const { user } = context.switchToHttp().getRequest();
    // return user && user.roles ? requiredRoles.some(role => user.roles.includes(role)) : false;

    if (user && user.roles) {
      console.log(`User roles = [${user.roles.join(", ")}]`)
      console.log(`Required roles = [${requiredRoles.join(", ")}]`)
      return requiredRoles.some(role => user.roles.includes(role))
    }
    else {
      return false;
    }
  }
}