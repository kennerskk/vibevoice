# แชทออนไลน์กับเพื่อน - WebSocket Chat App

แอปพลิเคชันแชทแบบเรียลไทม์ที่ใช้ WebSocket สำหรับการสื่อสารกับเพื่อนๆ ออนไลน์

## ฟีเจอร์หลัก

- 💬 แชทแบบเรียลไทม์ (Real-time messaging)
- 👥 ระบบห้องแชท (Chat rooms)
- 🟢 สถานะออนไลน์ (Online status)
- ⌨️ แสดงสถานะการพิมพ์ (Typing indicators)
- 📱 รองรับมือถือ (Mobile responsive)
- 🎨 ดีไซน์สวยงาม (Modern UI)

## การติดตั้งและรันในเครื่อง

### 1. Clone หรือสร้างโปรเจคใหม่

```bash
mkdir websocket-chat-app
cd websocket-chat-app
```

### 2. สร้างไฟล์ตาม structure

```
websocket-chat-app/
├── server.js
├── package.json
├── render.yaml
├── README.md
└── public/
    └── index.html
```

### 3. ติดตั้ง dependencies

```bash
npm install
```

### 4. รันแอพพลิเคชัน

```bash
# Development mode
npm run dev

# หรือ Production mode
npm start
```

แอพจะรันที่ `http://localhost:3000`

## การ Deploy บน Render

### วิธีที่ 1: Deploy ผ่าน GitHub

1. **อัพโหลดโค้ดไป GitHub**
   - สร้าง repository ใหม่บน GitHub
   - อัพโหลดไฟล์ทั้งหมดไปยัง repository

2. **เชื่อมต่อกับ Render**
   - เข้าไปที่ [render.com](https://render.com)
   - สมัครสมาชิก/เข้าสู่ระบบ
   - คลิก "New +" → "Web Service"
   - เชื่อมต่อ GitHub repository ของคุณ

3. **ตั้งค่า Deployment**
   - **Name**: ตั้งชื่อตามต้องการ
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - คลิก "Create Web Service"

### วิธีที่ 2: Deploy ด้วย render.yaml

1. อัพโหลดโค้ดพร้อมไฟล์ `render.yaml` ไป GitHub
2. บน Render Dashboard เลือก "New +" → "Blueprint"
3. เชื่อมต่อ repository และ Render จะใช้การตั้งค่าจาก `render.yaml` โดยอัตโนมัติ

## การใช้งาน

### สำหรับผู้ใช้

1. **เข้าสู่ระบบ**
   - กรอกชื่อผู้ใช้
   - กรอกชื่อห้องแชท (เช่น "เพื่อน", "งาน", "ครอบครัว")
   - คลิก "เข้าร่วมแชท"

2. **แชท**
   - พิมพ์ข้อความในช่องด้านล่าง
   - กด Enter หรือคลิกปุ่ม "ส่ง"
   - ดูรายชื่อผู้ใช้ออนไลน์ด้านซ้าย

3. **ออกจากห้อง**
   - คลิกปุ่ม "ออกจากห้อง" ด้านบนขวา

### สำหรับผู้ใช้หลายคน

- ผู้ใช้ที่ใช้ชื่อห้องเดียวกันจะสามารถแชทด้วยกันได้
- สามารถมีหลายห้องพร้อมกันได้
- แต่ละคนสามารถอยู่ได้ห้องละ 1 ห้องในเวลาเดียวกัน

## โครงสร้างโค้ด

### Backend (server.js)
- **Express.js**: Web server
- **Socket.IO**: WebSocket communication
- **Room Management**: จัดการห้องแชท
- **User Management**: จัดการผู้ใช้ออนไลน์

### Frontend (public/index.html)
- **Responsive Design**: รองรับทุกอุปกรณ์
- **Real-time Updates**: อัพเดทแบบเรียลไทม์
- **Modern UI**: ดีไซน์สมัยใหม่

## การปรับแต่ง

### เพิ่มฟีเจอร์

```javascript
// ในไฟล์ server.js เพิ่มฟีเจอร์ใหม่
socket.on('custom-event', (data) => {
  // Handle custom functionality
});
```

### เปลี่ยนสี/ธีม

แก้ไข CSS ในไฟล์ `public/index.html` ส่วน `<style>`

### เพิ่มการรักษาความปลอดภัย

```javascript
// Rate limiting
const rateLimit = require('express-rate-limit');
app.use(rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
}));
```
