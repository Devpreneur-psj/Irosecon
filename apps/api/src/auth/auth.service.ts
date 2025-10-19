import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}

  async login(email: string, password: string) {
    // 실제 구현에서는 데이터베이스에서 사용자 확인 및 비밀번호 검증
    if (email === 'admin@example.com' && password === 'admin123') {
      const payload = { email, role: 'admin' };
      const token = this.jwtService.sign(payload);
      
      return {
        access_token: token,
        user: { email, role: 'admin' },
      };
    }
    
    throw new Error('Invalid credentials');
  }

  async verifyOtp(phone: string, otp: string) {
    // 실제 구현에서는 OTP 검증 로직
    if (otp === '123456') {
      const payload = { phone, role: 'user' };
      const token = this.jwtService.sign(payload);
      
      return {
        access_token: token,
        user: { phone, role: 'user' },
      };
    }
    
    throw new Error('Invalid OTP');
  }
}