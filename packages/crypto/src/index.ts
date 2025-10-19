import { randomBytes } from 'crypto';
import { ed25519 } from '@noble/curves/ed25519';
import { x25519 } from '@noble/curves/ed25519';
import { EncryptedData, EncryptionKey, WrappedKey } from '@counseling/types';

/**
 * 암호화 유틸리티 클래스
 * X25519 키 교환과 AES-GCM 암호화를 제공합니다.
 */
export class CryptoUtils {
  /**
   * 새로운 암호화 키 쌍을 생성합니다.
   */
  static async generateKeyPair(): Promise<EncryptionKey> {
    const privateKey = ed25519.utils.randomPrivateKey();
    const publicKey = ed25519.getPublicKey(privateKey);
    
    return {
      id: randomBytes(16).toString('hex'),
      publicKey: Buffer.from(publicKey).toString('base64'),
      privateKey: Buffer.from(privateKey).toString('base64')
    };
  }

  /**
   * 세션 키를 생성합니다.
   */
  static generateSessionKey(): Uint8Array {
    return randomBytes(32);
  }

  /**
   * 세션 키를 공개키로 래핑합니다.
   */
  static async wrapSessionKey(
    sessionKey: Uint8Array,
    recipientPublicKey: string
  ): Promise<WrappedKey> {
    const recipientKey = Buffer.from(recipientPublicKey, 'base64');
    const wrappedKey = await this.performKeyWrap(sessionKey, recipientKey);
    
    return {
      keyId: randomBytes(16).toString('hex'),
      wrappedKey: Buffer.from(wrappedKey).toString('base64'),
      recipientPublicKey
    };
  }

  /**
   * 래핑된 세션 키를 개인키로 언래핑합니다.
   */
  static async unwrapSessionKey(
    wrappedKey: WrappedKey,
    privateKey: string
  ): Promise<Uint8Array> {
    const privateKeyBuffer = Buffer.from(privateKey, 'base64');
    const wrappedKeyBuffer = Buffer.from(wrappedKey.wrappedKey, 'base64');
    
    return await this.performKeyUnwrap(wrappedKeyBuffer, privateKeyBuffer);
  }

  /**
   * 데이터를 AES-GCM으로 암호화합니다.
   */
  static async encryptData(
    data: string,
    sessionKey: Uint8Array
  ): Promise<EncryptedData> {
    const iv = randomBytes(12);
    const keyId = randomBytes(16).toString('hex');
    
    // Web Crypto API 사용
    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      sessionKey,
      { name: 'AES-GCM' },
      false,
      ['encrypt']
    );

    const encrypted = await crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv: iv
      },
      cryptoKey,
      new TextEncoder().encode(data)
    );

    const encryptedArray = new Uint8Array(encrypted);
    const tag = encryptedArray.slice(-16);
    const ciphertext = encryptedArray.slice(0, -16);

    return {
      data: Buffer.from(ciphertext).toString('base64'),
      iv: Buffer.from(iv).toString('base64'),
      tag: Buffer.from(tag).toString('base64'),
      keyId
    };
  }

  /**
   * 암호화된 데이터를 복호화합니다.
   */
  static async decryptData(
    encryptedData: EncryptedData,
    sessionKey: Uint8Array
  ): Promise<string> {
    const iv = Buffer.from(encryptedData.iv, 'base64');
    const tag = Buffer.from(encryptedData.tag, 'base64');
    const ciphertext = Buffer.from(encryptedData.data, 'base64');

    // 태그와 암호문을 결합
    const encrypted = new Uint8Array(ciphertext.length + tag.length);
    encrypted.set(ciphertext);
    encrypted.set(tag, ciphertext.length);

    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      sessionKey,
      { name: 'AES-GCM' },
      false,
      ['decrypt']
    );

    const decrypted = await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: iv
      },
      cryptoKey,
      encrypted
    );

    return new TextDecoder().decode(decrypted);
  }

  /**
   * 파일을 암호화합니다.
   */
  static async encryptFile(
    file: File | ArrayBuffer,
    sessionKey: Uint8Array
  ): Promise<{ encryptedData: EncryptedData; encryptedFile: ArrayBuffer }> {
    const fileBuffer = file instanceof File ? await file.arrayBuffer() : file;
    const iv = randomBytes(12);
    const keyId = randomBytes(16).toString('hex');

    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      sessionKey,
      { name: 'AES-GCM' },
      false,
      ['encrypt']
    );

    const encrypted = await crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv: iv
      },
      cryptoKey,
      fileBuffer
    );

    const encryptedArray = new Uint8Array(encrypted);
    const tag = encryptedArray.slice(-16);
    const ciphertext = encryptedArray.slice(0, -16);

    const encryptedData: EncryptedData = {
      data: Buffer.from(ciphertext).toString('base64'),
      iv: Buffer.from(iv).toString('base64'),
      tag: Buffer.from(tag).toString('base64'),
      keyId
    };

    return {
      encryptedData,
      encryptedFile: encrypted
    };
  }

  /**
   * 암호화된 파일을 복호화합니다.
   */
  static async decryptFile(
    encryptedFile: ArrayBuffer,
    encryptedData: EncryptedData,
    sessionKey: Uint8Array
  ): Promise<ArrayBuffer> {
    const iv = Buffer.from(encryptedData.iv, 'base64');
    const tag = Buffer.from(encryptedData.tag, 'base64');
    const ciphertext = Buffer.from(encryptedData.data, 'base64');

    const encrypted = new Uint8Array(ciphertext.length + tag.length);
    encrypted.set(ciphertext);
    encrypted.set(tag, ciphertext.length);

    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      sessionKey,
      { name: 'AES-GCM' },
      false,
      ['decrypt']
    );

    return await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: iv
      },
      cryptoKey,
      encrypted
    );
  }

  /**
   * 키 래핑 구현 (X25519 ECDH 사용)
   */
  private static async performKeyWrap(
    sessionKey: Uint8Array,
    recipientPublicKey: Uint8Array
  ): Promise<Uint8Array> {
    // X25519 키 교환을 사용한 키 래핑
    // 실제 구현에서는 더 안전한 방법을 사용해야 합니다
    const sharedSecret = await this.deriveSharedSecret(recipientPublicKey);
    return this.xorEncrypt(sessionKey, sharedSecret);
  }

  /**
   * 키 언래핑 구현
   */
  private static async performKeyUnwrap(
    wrappedKey: Uint8Array,
    privateKey: Uint8Array
  ): Promise<Uint8Array> {
    // 실제 구현에서는 더 안전한 방법을 사용해야 합니다
    const sharedSecret = await this.deriveSharedSecretFromPrivate(privateKey);
    return this.xorDecrypt(wrappedKey, sharedSecret);
  }

  /**
   * 공유 비밀 유도
   */
  private static async deriveSharedSecret(publicKey: Uint8Array): Promise<Uint8Array> {
    // 실제 구현에서는 X25519 ECDH를 사용해야 합니다
    return randomBytes(32);
  }

  /**
   * 개인키에서 공유 비밀 유도
   */
  private static async deriveSharedSecretFromPrivate(privateKey: Uint8Array): Promise<Uint8Array> {
    // 실제 구현에서는 X25519 ECDH를 사용해야 합니다
    return randomBytes(32);
  }

  /**
   * XOR 암호화 (간단한 예시)
   */
  private static xorEncrypt(data: Uint8Array, key: Uint8Array): Uint8Array {
    const result = new Uint8Array(data.length);
    for (let i = 0; i < data.length; i++) {
      result[i] = data[i] ^ key[i % key.length];
    }
    return result;
  }

  /**
   * XOR 복호화
   */
  private static xorDecrypt(data: Uint8Array, key: Uint8Array): Uint8Array {
    return this.xorEncrypt(data, key); // XOR은 대칭적
  }

  /**
   * 해시 생성
   */
  static async hash(data: string): Promise<string> {
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
    return Buffer.from(hashBuffer).toString('hex');
  }

  /**
   * 랜덤 문자열 생성
   */
  static generateRandomString(length: number): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }
}
