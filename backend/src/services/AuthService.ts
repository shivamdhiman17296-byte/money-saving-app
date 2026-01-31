/**
 * JWT Authentication Service
 * Handles JWT token creation, validation, and refresh
 */

import jwt from 'jsonwebtoken';

export interface JWTPayload {
  user_id: string;
  email: string;
  phone_number: string;
  account_status: string;
  device_id?: string;
  session_id: string;
  iat?: number;
  exp?: number;
}

export class AuthService {
  private readonly jwtSecret = process.env.JWT_SECRET || '';
  private readonly jwtExpiry = process.env.JWT_EXPIRY || '24h';
  private readonly refreshSecret = process.env.JWT_REFRESH_SECRET || '';
  private readonly refreshExpiry = process.env.JWT_REFRESH_EXPIRY || '30d';

  constructor() {
    if (!this.jwtSecret || !this.refreshSecret) {
      throw new Error('JWT secrets not configured');
    }
  }

  /**
   * Generate access token
   */
  generateAccessToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): string {
    try {
      return jwt.sign(payload, this.jwtSecret, {
        expiresIn: this.jwtExpiry,
        algorithm: 'RS256', // In production, use RSA key pair
      });
    } catch (error) {
      throw new Error(`Failed to generate access token: ${error}`);
    }
  }

  /**
   * Generate refresh token
   */
  generateRefreshToken(payload: { user_id: string; session_id: string }): string {
    try {
      return jwt.sign(payload, this.refreshSecret, {
        expiresIn: this.refreshExpiry,
        algorithm: 'HS256',
      });
    } catch (error) {
      throw new Error(`Failed to generate refresh token: ${error}`);
    }
  }

  /**
   * Verify access token
   */
  verifyAccessToken(token: string): JWTPayload {
    try {
      return jwt.verify(token, this.jwtSecret) as JWTPayload;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new Error('Token expired');
      }
      if (error instanceof jwt.JsonWebTokenError) {
        throw new Error('Invalid token');
      }
      throw error;
    }
  }

  /**
   * Verify refresh token
   */
  verifyRefreshToken(token: string): { user_id: string; session_id: string } {
    try {
      return jwt.verify(token, this.refreshSecret) as {
        user_id: string;
        session_id: string;
      };
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new Error('Refresh token expired');
      }
      throw new Error('Invalid refresh token');
    }
  }

  /**
   * Decode token without verification (for inspection)
   */
  decodeToken(token: string): any {
    return jwt.decode(token);
  }

  /**
   * Check if token is expired
   */
  isTokenExpired(token: string): boolean {
    try {
      const decoded = jwt.decode(token) as any;
      if (!decoded || !decoded.exp) return true;
      return decoded.exp * 1000 < Date.now();
    } catch {
      return true;
    }
  }

  /**
   * Get remaining time for token (in seconds)
   */
  getTokenExpiryTime(token: string): number {
    try {
      const decoded = jwt.decode(token) as any;
      if (!decoded || !decoded.exp) return 0;
      return Math.max(0, decoded.exp - Math.floor(Date.now() / 1000));
    } catch {
      return 0;
    }
  }
}

export const authService = new AuthService();
