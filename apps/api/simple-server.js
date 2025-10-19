const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: ["http://localhost:3000", "http://localhost:3002"],
    credentials: true,
  },
});

// 미들웨어
app.use(helmet());
app.use(cors({
  origin: ["http://localhost:3000", "http://localhost:3002"],
  credentials: true,
}));
app.use(express.json());

// 메모리 저장소
const rooms = new Map();
const participants = new Map();
const messages = new Map();

// API 엔드포인트
app.get('/', (req, res) => {
  res.json({ message: 'Counseling Center API Server', status: 'running' });
});

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    rooms: rooms.size,
  });
});

// 파일 업로드 URL 생성
app.post('/files/upload/sign', (req, res) => {
  const { roomId, fileName, fileSize, mimeType } = req.body;
  
  const fileId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const uploadUrl = `http://localhost:3001/files/upload/${fileId}`;
  
  res.json({
    uploadUrl,
    fileId,
    expiresIn: 3600,
  });
});

// Socket.IO 이벤트 처리
io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`);

  // 룸 참여
  socket.on('room:join', (data) => {
    try {
      const { roomId, nickname, publicKey, supervisorConsent } = data;
      
      // 룸 생성 또는 가져오기
      if (!rooms.has(roomId)) {
        rooms.set(roomId, {
          id: roomId,
          createdAt: new Date(),
          expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15분
          participants: [],
          supervisorConsent,
          status: 'active',
        });
        participants.set(roomId, []);
        messages.set(roomId, []);
        
        // 15분 후 자동 삭제
        setTimeout(() => {
          rooms.delete(roomId);
          participants.delete(roomId);
          messages.delete(roomId);
          io.to(roomId).emit('system:room-expired', { roomId, expiredAt: new Date() });
        }, 15 * 60 * 1000);
      }

      const room = rooms.get(roomId);
      const participant = {
        id: socket.id,
        nickname,
        publicKey,
        role: 'user',
        joinedAt: new Date(),
      };

      // 참여자 추가
      participants.get(roomId).push(participant);
      room.participants.push(participant);

      // 룸에 조인
      socket.join(roomId);

      // 다른 참여자들에게 알림
      socket.to(roomId).emit('system:participant-joined', { roomId, participant });

      // 클라이언트에게 응답
      socket.emit('room:joined', { roomId, participant, room });

      console.log(`Participant ${nickname} joined room ${roomId}`);
    } catch (error) {
      console.error('Error joining room:', error);
      socket.emit('error', { message: 'Failed to join room' });
    }
  });

  // 룸 나가기
  socket.on('room:leave', (data) => {
    const { roomId } = data;
    
    if (rooms.has(roomId)) {
      const roomParticipants = participants.get(roomId);
      const room = rooms.get(roomId);
      
      // 참여자 제거
      const filteredParticipants = roomParticipants.filter(p => p.id !== socket.id);
      participants.set(roomId, filteredParticipants);
      room.participants = filteredParticipants;

      socket.leave(roomId);
      socket.to(roomId).emit('system:participant-left', {
        roomId,
        participantId: socket.id,
        leftAt: new Date(),
      });

      console.log(`Participant ${socket.id} left room ${roomId}`);
    }
  });

  // 세션 연장
  socket.on('room:extend', (data) => {
    const { roomId, additionalMinutes = 15 } = data;
    
    if (rooms.has(roomId)) {
      const room = rooms.get(roomId);
      const additionalMs = additionalMinutes * 60 * 1000;
      
      room.expiresAt = new Date(Date.now() + additionalMs);
      
      io.to(roomId).emit('room:extended', {
        roomId,
        additionalMinutes,
        newExpiresAt: room.expiresAt,
      });

      console.log(`Room ${roomId} extended by ${additionalMinutes} minutes`);
    }
  });

  // 메시지 전송
  socket.on('message:send', (data) => {
    try {
      const { roomId, content, metadata } = data;
      
      if (!rooms.has(roomId)) {
        socket.emit('error', { message: 'Room not found' });
        return;
      }

      const room = rooms.get(roomId);
      const participant = room.participants.find(p => p.id === socket.id);
      
      if (!participant) {
        socket.emit('error', { message: 'Not a participant of this room' });
        return;
      }

      const message = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        roomId,
        senderId: socket.id,
        senderNickname: participant.nickname,
        type: 'text',
        content,
        metadata,
        timestamp: new Date(),
        encrypted: true,
      };

      // 메시지 저장
      messages.get(roomId).push(message);

      // 모든 참여자에게 전송
      io.to(roomId).emit('message:received', message);

      console.log(`Message sent in room ${roomId} by ${participant.nickname}`);
    } catch (error) {
      console.error('Error sending message:', error);
      socket.emit('error', { message: 'Failed to send message' });
    }
  });

  // 타이핑 상태
  socket.on('message:typing', (data) => {
    const { roomId, isTyping } = data;
    socket.to(roomId).emit('message:typing', {
      roomId,
      participantId: socket.id,
      isTyping,
    });
  });

  // 파일 업로드
  socket.on('file:upload', (data) => {
    const { roomId, fileName, fileSize, mimeType } = data;
    
    const fileId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const uploadUrl = `http://localhost:3001/files/upload/${fileId}`;
    
    socket.emit('file:upload-url', {
      uploadUrl,
      fileId,
      expiresIn: 3600,
    });
  });

  // 연결 해제
  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
    
    // 모든 룸에서 참여자 제거
    for (const [roomId, roomParticipants] of participants.entries()) {
      const filteredParticipants = roomParticipants.filter(p => p.id !== socket.id);
      if (filteredParticipants.length !== roomParticipants.length) {
        participants.set(roomId, filteredParticipants);
        
        const room = rooms.get(roomId);
        if (room) {
          room.participants = filteredParticipants;
        }
        
        socket.to(roomId).emit('system:participant-left', {
          roomId,
          participantId: socket.id,
          leftAt: new Date(),
        });
      }
    }
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`🚀 API Server is running on: http://localhost:${PORT}`);
  console.log(`📡 Socket.IO namespace: /`);
  console.log(`🔐 Security headers enabled`);
  console.log(`🌐 CORS enabled for: http://localhost:3000, http://localhost:3002`);
});
