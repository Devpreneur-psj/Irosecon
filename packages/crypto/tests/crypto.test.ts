import { CryptoUtils } from '../src/index';

describe('CryptoUtils', () => {
  describe('generateKeyPair', () => {
    it('should generate a valid key pair', async () => {
      const keyPair = await CryptoUtils.generateKeyPair();
      
      expect(keyPair).toHaveProperty('id');
      expect(keyPair).toHaveProperty('publicKey');
      expect(keyPair).toHaveProperty('privateKey');
      expect(keyPair.id).toBeDefined();
      expect(keyPair.publicKey).toBeDefined();
      expect(keyPair.privateKey).toBeDefined();
    });
  });

  describe('generateSessionKey', () => {
    it('should generate a 32-byte session key', () => {
      const sessionKey = CryptoUtils.generateSessionKey();
      
      expect(sessionKey).toBeInstanceOf(Uint8Array);
      expect(sessionKey.length).toBe(32);
    });
  });

  describe('encryptData and decryptData', () => {
    it('should encrypt and decrypt data correctly', async () => {
      const originalData = 'Hello, World!';
      const sessionKey = CryptoUtils.generateSessionKey();
      
      const encryptedData = await CryptoUtils.encryptData(originalData, sessionKey);
      const decryptedData = await CryptoUtils.decryptData(encryptedData, sessionKey);
      
      expect(decryptedData).toBe(originalData);
      expect(encryptedData.data).not.toBe(originalData);
      expect(encryptedData.iv).toBeDefined();
      expect(encryptedData.tag).toBeDefined();
      expect(encryptedData.keyId).toBeDefined();
    });
  });

  describe('hash', () => {
    it('should generate consistent hash', async () => {
      const data = 'test data';
      const hash1 = await CryptoUtils.hash(data);
      const hash2 = await CryptoUtils.hash(data);
      
      expect(hash1).toBe(hash2);
      expect(hash1).toHaveLength(64); // SHA-256 hex length
    });
  });

  describe('generateRandomString', () => {
    it('should generate random string of specified length', () => {
      const length = 10;
      const randomString = CryptoUtils.generateRandomString(length);
      
      expect(randomString).toHaveLength(length);
      expect(typeof randomString).toBe('string');
    });
  });
});
