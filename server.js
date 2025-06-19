const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 3000;

// เก็บข้อมูลผู้ใช้ออนไลน์
const users = new Map();
const rooms = new Map();
const voiceUsers = new Map(); // เก็บผู้ใช้ที่เปิดไมค์

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// WebSocket connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // ผู้ใช้เข้าร่วม
  socket.on('join', (userData) => {
    const { username, room } = userData;
    
    // เก็บข้อมูลผู้ใช้
    users.set(socket.id, { username, room, id: socket.id });
    
    // เข้าร่วมห้อง
    socket.join(room);
    
    // เพิ่มผู้ใช้ในห้อง
    if (!rooms.has(room)) {
      rooms.set(room, new Set());
    }
    rooms.get(room).add(socket.id);
    
    // แจ้งผู้ใช้ในห้องว่ามีคนเข้าใหม่
    socket.to(room).emit('user-joined', {
      username,
      message: `${username} เข้าร่วมห้องแชท`,
      timestamp: new Date().toLocaleString('th-TH')
    });
    
    // ส่งรายชื่อผู้ใช้ออนไลน์ในห้อง
    const roomUsers = Array.from(rooms.get(room) || [])
      .map(id => users.get(id))
      .filter(user => user);
    
    io.to(room).emit('users-update', roomUsers);
    
    console.log(`${username} joined room: ${room}`);
  });

  // รับข้อความ
  socket.on('send-message', (messageData) => {
    const user = users.get(socket.id);
    if (user) {
      const message = {
        id: Date.now() + Math.random(),
        username: user.username,
        message: messageData.message,
        timestamp: new Date().toLocaleString('th-TH'),
        userId: socket.id
      };
      
      // ส่งข้อความไปยังทุกคนในห้อง
      io.to(user.room).emit('receive-message', message);
      console.log(`Message from ${user.username}: ${messageData.message}`);
    }
  });

  // ผู้ใช้กำลังพิมพ์
  socket.on('typing', (data) => {
    const user = users.get(socket.id);
    if (user) {
      socket.to(user.room).emit('user-typing', {
        username: user.username,
        isTyping: data.isTyping
      });
    }
  });

  // Voice Chat Events
  socket.on('voice-join', (data) => {
    const user = users.get(socket.id);
    if (user) {
      voiceUsers.set(socket.id, {
        userId: socket.id,
        username: user.username,
        room: user.room
      });
      
      // แจ้งผู้ใช้ในห้องว่ามีคนเปิดไมค์
      socket.to(user.room).emit('voice-user-joined', {
        userId: socket.id,
        username: user.username
      });
      
      // ส่งรายชื่อผู้ใช้ที่เปิดไมค์อยู่แล้วให้ผู้ใช้ใหม่
      const roomVoiceUsers = Array.from(voiceUsers.values())
        .filter(voiceUser => voiceUser.room === user.room);
      
      socket.emit('voice-users-list', roomVoiceUsers);
      
      console.log(`${user.username} joined voice chat in room: ${user.room}`);
    }
  });

  socket.on('voice-leave', () => {
    const user = users.get(socket.id);
    if (user && voiceUsers.has(socket.id)) {
      voiceUsers.delete(socket.id);
      
      // แจ้งผู้ใช้ในห้องว่ามีคนปิดไมค์
      socket.to(user.room).emit('voice-user-left', {
        userId: socket.id,
        username: user.username
      });
      
      console.log(`${user.username} left voice chat`);
    }
  });

  socket.on('voice-offer', (data) => {
    socket.to(data.targetUserId).emit('voice-offer', {
      fromUserId: socket.id,
      offer: data.offer
    });
  });

  socket.on('voice-answer', (data) => {
    socket.to(data.targetUserId).emit('voice-answer', {
      fromUserId: socket.id,
      answer: data.answer
    });
  });

  socket.on('voice-ice-candidate', (data) => {
    socket.to(data.targetUserId).emit('voice-ice-candidate', {
      fromUserId: socket.id,
      candidate: data.candidate
    });
  });

  socket.on('speaking-status', (data) => {
    const user = users.get(socket.id);
    if (user) {
      socket.to(user.room).emit('user-speaking', {
        userId: socket.id,
        username: data.username,
        isSpeaking: data.isSpeaking
      });
    }
  });

  // ผู้ใช้ออกจากระบบ
  socket.on('disconnect', () => {
    const user = users.get(socket.id);
    if (user) {
      const { username, room } = user;
      
      // ลบผู้ใช้จากห้อง
      if (rooms.has(room)) {
        rooms.get(room).delete(socket.id);
        if (rooms.get(room).size === 0) {
          rooms.delete(room);
        }
      }
      
      // ลบผู้ใช้จาก voice chat
      if (voiceUsers.has(socket.id)) {
        voiceUsers.delete(socket.id);
        io.to(room).emit('voice-user-left', {
          userId: socket.id,
          username: username
        });
      }
      
      // ลบผู้ใช้
      users.delete(socket.id);
      
      // แจ้งผู้ใช้ในห้องว่ามีคนออก
      io.to(room).emit('user-left', {
        username,
        message: `${username} ออกจากห้องแชท`,
        timestamp: new Date().toLocaleString('th-TH')
      });
      
      // อัพเดทรายชื่อผู้ใช้ออนไลน์
      const roomUsers = Array.from(rooms.get(room) || [])
        .map(id => users.get(id))
        .filter(user => user);
      
      io.to(room).emit('users-update', roomUsers);
      
      console.log(`${username} disconnected from room: ${room}`);
    }
  });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});