// Room and Session Types
export interface Room {
  id: string;
  createdAt: Date;
  expiresAt: Date;
  participants: Participant[];
  supervisorConsent: boolean;
  status: RoomStatus;
}

export interface Participant {
  id: string;
  nickname: string;
  publicKey: string;
  role: ParticipantRole;
  joinedAt: Date;
}

export enum RoomStatus {
  ACTIVE = 'active',
  EXPIRED = 'expired',
  ENDED = 'ended'
}

export enum ParticipantRole {
  USER = 'user',
  COUNSELOR = 'counselor',
  ADMIN = 'admin'
}

// Message Types
export interface Message {
  id: string;
  roomId: string;
  senderId: string;
  senderNickname: string;
  type: MessageType;
  content: string; // 암호화된 내용
  metadata: MessageMetadata;
  timestamp: Date;
  encrypted: boolean;
}

export interface MessageMetadata {
  iv: string;
  tag: string;
  keyId: string;
  fileInfo?: FileInfo;
  linkPreview?: LinkPreview;
}

export enum MessageType {
  TEXT = 'text',
  IMAGE = 'image',
  FILE = 'file',
  SYSTEM = 'system'
}

export interface FileInfo {
  id: string;
  name: string;
  size: number;
  mimeType: string;
  url: string; // S3 signed URL
}

export interface LinkPreview {
  url: string;
  title?: string;
  description?: string;
  image?: string;
}

// Encryption Types
export interface EncryptionKey {
  id: string;
  publicKey: string;
  privateKey?: string; // 클라이언트에서만 사용
}

export interface WrappedKey {
  keyId: string;
  wrappedKey: string;
  recipientPublicKey: string;
}

export interface EncryptedData {
  data: string;
  iv: string;
  tag: string;
  keyId: string;
}

// Socket Events
export interface SocketEvents {
  // Room Events
  'room:join': (data: JoinRoomData) => void;
  'room:leave': (data: LeaveRoomData) => void;
  'room:extend': (data: ExtendRoomData) => void;
  'room:end': (data: EndRoomData) => void;
  
  // Message Events
  'message:send': (data: SendMessageData) => void;
  'message:received': (data: Message) => void;
  'message:typing': (data: TypingData) => void;
  'message:read': (data: ReadReceiptData) => void;
  
  // File Events
  'file:upload': (data: FileUploadData) => void;
  'file:meta': (data: FileMetaData) => void;
  
  // System Events
  'system:room-expired': (data: RoomExpiredData) => void;
  'system:participant-joined': (data: ParticipantJoinedData) => void;
  'system:participant-left': (data: ParticipantLeftData) => void;
}

export interface JoinRoomData {
  roomId: string;
  nickname: string;
  publicKey: string;
  supervisorConsent: boolean;
}

export interface LeaveRoomData {
  roomId: string;
  participantId: string;
}

export interface ExtendRoomData {
  roomId: string;
  additionalMinutes: number;
}

export interface EndRoomData {
  roomId: string;
  reason: 'user_request' | 'timeout' | 'admin_action';
}

export interface SendMessageData {
  roomId: string;
  content: string;
  metadata: MessageMetadata;
}

export interface TypingData {
  roomId: string;
  participantId: string;
  isTyping: boolean;
}

export interface ReadReceiptData {
  roomId: string;
  messageId: string;
  participantId: string;
  readAt: Date;
}

export interface FileUploadData {
  roomId: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
}

export interface FileMetaData {
  roomId: string;
  fileId: string;
  metadata: MessageMetadata;
}

export interface RoomExpiredData {
  roomId: string;
  expiredAt: Date;
}

export interface ParticipantJoinedData {
  roomId: string;
  participant: Participant;
}

export interface ParticipantLeftData {
  roomId: string;
  participantId: string;
  leftAt: Date;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface UploadSignedUrlResponse {
  uploadUrl: string;
  fileId: string;
  expiresIn: number;
}

// Admin Console Types
export interface AdminRoomView {
  roomId: string;
  participants: number;
  timeRemaining: number;
  supervisorConsent: boolean;
  status: RoomStatus;
  createdAt: Date;
}

export interface AdminLogEntry {
  id: string;
  roomId: string;
  timestamp: Date;
  action: string;
  data: any;
  encrypted: boolean;
}

// Consent and Privacy Types
export interface ConsentData {
  supervisorMonitoring: boolean;
  dataProcessing: boolean;
  privacyPolicy: boolean;
  termsOfService: boolean;
  timestamp: Date;
}

export interface PrivacySettings {
  dataRetention: boolean;
  anonymization: boolean;
  encryption: boolean;
}

// Error Types
export interface AppError {
  code: string;
  message: string;
  details?: any;
}

export enum ErrorCodes {
  ROOM_NOT_FOUND = 'ROOM_NOT_FOUND',
  ROOM_EXPIRED = 'ROOM_EXPIRED',
  INVALID_PARTICIPANT = 'INVALID_PARTICIPANT',
  ENCRYPTION_ERROR = 'ENCRYPTION_ERROR',
  FILE_UPLOAD_ERROR = 'FILE_UPLOAD_ERROR',
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED'
}
