const express = require('express');
const http = require('http');

const app = express();
const server = http.createServer(app);

// 공개 접속을 위한 CORS 설정
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

app.use(express.json());

// 메모리 저장소
const rooms = new Map();
const participants = new Map();
const messages = new Map();

// API 엔드포인트
app.get('/', (req, res) => {
  res.json({ 
    message: 'Counseling Center API Server - Public Access', 
    status: 'running',
    version: '1.0.0',
    publicAccess: true,
    rooms: rooms.size,
    participants: participants.size,
    serverTime: new Date().toISOString()
  });
});

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    rooms: rooms.size,
    publicAccess: true,
    serverIP: '223.39.246.133'
  });
});

// 룸 생성
app.post('/rooms', (req, res) => {
  const roomId = `room_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const room = {
    id: roomId,
    createdAt: new Date(),
    expiresAt: new Date(Date.now() + 15 * 60 * 1000),
    participants: [],
    status: 'active',
    publicAccess: true
  };
  
  rooms.set(roomId, room);
  participants.set(roomId, []);
  messages.set(roomId, []);
  
  res.json(room);
});

// 룸 조회
app.get('/rooms/:id', (req, res) => {
  const room = rooms.get(req.params.id);
  if (!room) {
    return res.status(404).json({ error: 'Room not found' });
  }
  res.json(room);
});

// 룸 참여
app.post('/rooms/:id/join', (req, res) => {
  const { nickname, publicKey } = req.body;
  const roomId = req.params.id;
  
  let room = rooms.get(roomId);
  if (!room) {
    return res.status(404).json({ error: 'Room not found' });
  }
  
  const participant = {
    id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    nickname,
    publicKey,
    role: 'user',
    joinedAt: new Date(),
  };
  
  participants.get(roomId).push(participant);
  room.participants.push(participant);
  
  res.json({ participant, room });
});

// 메시지 전송
app.post('/rooms/:id/messages', (req, res) => {
  const { content, senderId, senderNickname } = req.body;
  const roomId = req.params.id;
  
  const room = rooms.get(roomId);
  if (!room) {
    return res.status(404).json({ error: 'Room not found' });
  }
  
  const message = {
    id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    roomId,
    senderId,
    senderNickname,
    content,
    timestamp: new Date(),
    encrypted: true,
  };
  
  messages.get(roomId).push(message);
  
  res.json(message);
});

// 메시지 조회
app.get('/rooms/:id/messages', (req, res) => {
  const roomId = req.params.id;
  const roomMessages = messages.get(roomId) || [];
  res.json(roomMessages);
});

// 파일 업로드 URL 생성
app.post('/files/upload/sign', (req, res) => {
  const { roomId, fileName, fileSize, mimeType } = req.body;
  
  const fileId = `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const uploadUrl = `http://223.39.246.133:3001/files/upload/${fileId}`;
  
  res.json({
    uploadUrl,
    fileId,
    expiresIn: 3600,
  });
});

// 서버 정보
app.get('/server/info', (req, res) => {
  res.json({
    serverName: 'Counseling Center Platform',
    version: '1.0.0',
    publicAccess: true,
    serverIP: '223.39.246.133',
    ports: {
      api: 3001,
      web: 3000
    },
    features: [
      'Real-time Chat',
      'Room Management',
      'File Upload',
      'Session Management',
      'Public Access'
    ]
  });
});

const PORT = process.env.PORT || 3001;
const HOST = '0.0.0.0'; // 모든 인터페이스에서 접속 허용

server.listen(PORT, HOST, () => {
  console.log(`🌐 Public API Server is running on: http://223.39.246.133:${PORT}`);
  console.log(`📡 REST API endpoints available`);
  console.log(`🌍 Public access enabled for all origins`);
  console.log(`🔗 Access URL: http://223.39.246.133:${PORT}`);
});
