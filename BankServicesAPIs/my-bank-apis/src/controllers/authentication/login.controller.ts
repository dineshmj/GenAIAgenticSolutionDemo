import { Controller, Post, Body, Res, HttpStatus } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { JWT_SIGNING_KEY } from 'src/config/secrets';

@Controller('auth')
export class AuthenticationController {
  private static users = [
    { userName: 'tom', password: 'tom123', roles: ['api.read'] },
    { userName: 'jerry', password: 'jerry123', roles: ['api.read', 'api.createOrModify'] },
    { userName: 'spike', password: 'spike123', roles: ['api.read', 'api.createOrModify', 'api.deleteOrPurge'] },
  ];

  // Access URL: POST /auth/login
  @Post('login')
  async login(
    @Body('userName') userName: string,
    @Body('password') password: string,
    @Res() response,
  ) {
    // Find matching user for supplied credentials.
    const matchingUser
        = AuthenticationController.users.find((u) =>
            u.userName === userName && u.password === password);

    if (!matchingUser) {
      // Credentials are not matching - 401 Unauthorized.
      return response.status(HttpStatus.UNAUTHORIZED).json({
        status: 'Unauthenticated',
        message: 'Invalid user name or password',
      });
    }

    // Credentials are matching. Prepare JWT.
    const payload = { userName: matchingUser.userName, roles: matchingUser.roles };
    const jwtToken = jwt.sign(payload, JWT_SIGNING_KEY, { expiresIn: '1h' });

    return response.status(HttpStatus.OK).json({
      status: 'Authenticated',
      message: 'Authentication successful',
      token: jwtToken,
    });
  }
}