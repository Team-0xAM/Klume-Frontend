# Klume Backend API Guide for Frontend Developers

> 프론트엔드 개발을 위한 Klume 백엔드 API 가이드
> 최종 업데이트: 2025-11-11

---

## 📚 목차

1. [프로젝트 개요](#프로젝트-개요)
2. [인증 및 권한](#인증-및-권한)
3. [폴더 구조](#폴더-구조)
4. [도메인별 API](#도메인별-api)
   - [Member (회원)](#1-member-회원)
   - [Organization (조직)](#2-organization-조직)
   - [Room (물리적 공간)](#3-room-물리적-공간)
   - [Chat (채팅)](#4-chat-채팅)
5. [WebSocket 실시간 채팅](#websocket-실시간-채팅)
6. [데이터 모델](#데이터-모델)
7. [에러 처리](#에러-처리)

---

## 프로젝트 개요

### 기술 스택
- **Framework**: Spring Boot 3.x
- **Language**: Java 17+
- **Database**:
  - MySQL (관계형 데이터 - Member, Organization, Room)
  - MongoDB (문서형 데이터 - ChatRoom, ChatMessage)
- **Authentication**: JWT (JSON Web Token)
- **Real-time Communication**: WebSocket (STOMP + SockJS)
- **File Storage**: AWS S3
- **Cache**: Redis

### Base URL
```
http://localhost:8080
```

### 공통 헤더
모든 인증이 필요한 API는 다음 헤더를 포함해야 합니다:
```http
Authorization: Bearer {JWT_TOKEN}
Content-Type: application/json
```

---

## 인증 및 권한

### 권한 레벨

#### 1. 회원 (Member)
- 기본적인 사용자 엔티티
- 이메일, 비밀번호로 로그인
- 여러 조직에 가입 가능

#### 2. 조직 회원 (OrganizationMember)
- 특정 조직 내에서의 회원 정보
- 조직마다 다른 닉네임 사용 가능
- 역할: `MEMBER` 또는 `ADMIN`

#### 3. 조직 관리자 (OrganizationRole.ADMIN)
- 조직 내 관리자 권한
- 초대 코드 발급 가능
- 모든 채팅방 조회 가능
- 채팅방 담당 가능

### JWT 토큰 구조
```json
{
  "sub": "user@example.com",
  "memberId": 123,
  "exp": 1234567890,
  "iat": 1234567890
}
```

### 권한 확인 방법

**프론트엔드에서 사용자의 조직 내 역할 확인:**

```javascript
// API 요청
GET /organizations/{organizationId}/members/me

// 응답
{
  "id": 456,
  "role": "ADMIN",  // 또는 "MEMBER"
  "nickname": "관리자A",
  "organizationId": 1,
  "memberId": 123
}
```

---

## 폴더 구조

```
src/main/java/com/oxam/klume/
├── member/                          # 회원 도메인
│   ├── controller/
│   │   └── MemberController.java
│   ├── service/
│   │   ├── MemberService.java
│   │   └── MemberServiceImpl.java
│   ├── repository/
│   │   └── MemberRepository.java
│   ├── entity/
│   │   └── Member.java
│   ├── dto/
│   │   ├── MemberRequestDTO.java
│   │   └── MemberResponseDTO.java
│   └── exception/
│       └── MemberNotFoundException.java
│
├── organization/                    # 조직 도메인
│   ├── controller/
│   │   └── OrganizationController.java
│   ├── service/
│   │   ├── OrganizationService.java
│   │   └── OrganizationServiceImpl.java
│   ├── repository/
│   │   ├── OrganizationRepository.java
│   │   ├── OrganizationMemberRepository.java
│   │   └── OrganizationGroupRepository.java
│   ├── entity/
│   │   ├── Organization.java           # 조직 엔티티
│   │   ├── OrganizationMember.java     # 조직-회원 매핑 (역할 포함)
│   │   ├── OrganizationGroup.java      # 조직 내 그룹
│   │   └── enums/
│   │       └── OrganizationRole.java   # MEMBER, ADMIN
│   ├── dto/
│   │   ├── OrganizationRequestDTO.java
│   │   ├── OrganizationMemberRequestDTO.java
│   │   └── OrganizationGroupResponseDTO.java
│   └── exception/
│       ├── OrganizationNotFoundException.java
│       ├── OrganizationNotAdminException.java
│       └── OrganizationMemberAccessDeniedException.java
│
├── room/                            # 물리적 공간 도메인
│   ├── controller/
│   │   └── RoomController.java
│   ├── service/
│   │   ├── RoomService.java
│   │   └── RoomServiceImpl.java
│   ├── repository/
│   │   └── RoomRepository.java
│   ├── entity/
│   │   └── Room.java                   # 물리적 공간 (회의실 등)
│   ├── dto/
│   │   ├── RoomRequestDTO.java
│   │   └── RoomResponseDTO.java
│   └── exception/
│       ├── RoomNotFoundException.java
│       ├── RoomCapacityInvalidException.java
│       └── RoomNameDuplicationException.java
│
├── chat/                            # 채팅 도메인 (MongoDB)
│   ├── controller/
│   │   ├── ChatRoomController.java     # REST API
│   │   └── ChatController.java         # WebSocket
│   ├── service/
│   │   ├── ChatService.java
│   │   ├── ChatServiceImpl.java
│   │   └── SequenceGeneratorService.java  # MongoDB 자동증가 ID
│   ├── repository/
│   │   ├── ChatRepository.java         # ChatRoom CRUD
│   │   └── ChatMessageRepository.java  # ChatMessage CRUD
│   ├── document/                       # MongoDB Documents
│   │   ├── ChatRoom.java
│   │   ├── ChatMessage.java
│   │   └── Sequence.java
│   ├── dto/
│   │   ├── ChatListDTO.java            # 채팅방 목록용
│   │   ├── ChatCreateRequest.java
│   │   ├── ChatCreateResponse.java
│   │   ├── MessageRequestDTO.java      # WebSocket 메시지
│   │   └── MessageResponseDTO.java
│   └── interceptor/
│       └── JwtChannelInterceptor.java  # WebSocket JWT 인증
│
├── file/                            # 파일 업로드
│   ├── FileValidator.java
│   └── infra/
│       └── S3Uploader.java
│
├── config/                          # 설정
│   ├── WebSocketConfig.java        # WebSocket 설정
│   ├── SecurityConfig.java          # Spring Security
│   └── MongoConfig.java             # MongoDB 설정
│
└── common/                          # 공통 유틸리티
    └── redis/
        └── RedisService.java
```

---

## 도메인별 API

## 1. Member (회원)

### 1.1 회원가입
```http
POST /members/signup
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "name": "홍길동"
}
```

**응답:**
```json
{
  "id": 123,
  "email": "user@example.com",
  "name": "홍길동",
  "createdAt": "2024-01-15T10:00:00"
}
```

### 1.2 로그인
```http
POST /members/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**응답:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "memberId": 123,
  "email": "user@example.com",
  "name": "홍길동"
}
```

### 1.3 내 정보 조회
```http
GET /members/me
Authorization: Bearer {JWT_TOKEN}
```

**응답:**
```json
{
  "id": 123,
  "email": "user@example.com",
  "name": "홍길동",
  "organizations": [
    {
      "organizationId": 1,
      "organizationName": "ABC 회사",
      "role": "ADMIN",
      "nickname": "관리자A"
    },
    {
      "organizationId": 2,
      "organizationName": "XYZ 팀",
      "role": "MEMBER",
      "nickname": "팀원B"
    }
  ]
}
```

---

## 2. Organization (조직)

### 2.1 조직 생성
```http
POST /organizations
Authorization: Bearer {JWT_TOKEN}
Content-Type: multipart/form-data

file: (이미지 파일)
name: "우리 회사"
description: "회사 설명"
nickname: "관리자"
```

**응답:**
```json
{
  "id": 1,
  "name": "우리 회사",
  "description": "회사 설명",
  "imageUrl": "https://s3.amazonaws.com/bucket/organization/image.jpg",
  "createdAt": "2024-01-15T10:00:00"
}
```

**참고:**
- 조직을 생성한 회원은 자동으로 `ADMIN` 역할을 가짐
- `nickname`은 해당 조직에서 사용할 닉네임

### 2.2 초대 코드 생성 (관리자만)
```http
POST /organizations/{organizationId}/invitation-code
Authorization: Bearer {JWT_TOKEN}
```

**응답:**
```json
{
  "code": "aBc123",
  "expiresIn": 1800  // 30분 (초 단위)
}
```

**참고:**
- 관리자만 호출 가능
- 초대 코드는 30분간 유효
- Redis에 저장됨
- 6자리 영숫자 코드

### 2.3 초대 코드 검증
```http
GET /organizations/invitation-code/{code}
Authorization: Bearer {JWT_TOKEN}
```

**응답:**
```json
{
  "organizationId": 1,
  "organizationName": "우리 회사",
  "organizationDescription": "회사 설명",
  "imageUrl": "https://s3.amazonaws.com/...",
  "valid": true
}
```

**에러:**
- 404: 만료되었거나 존재하지 않는 코드
- 409: 이미 해당 조직에 가입된 회원

### 2.4 조직 가입
```http
POST /organizations/{organizationId}/members
Authorization: Bearer {JWT_TOKEN}
Content-Type: application/json

{
  "nickname": "팀원A",
  "organizationGroupId": 5  // 선택사항
}
```

**응답:**
```json
{
  "id": 456,
  "memberId": 123,
  "organizationId": 1,
  "role": "MEMBER",
  "nickname": "팀원A",
  "organizationGroupId": 5,
  "joinedAt": "2024-01-15T10:30:00"
}
```

### 2.5 내 조직 권한 조회
```http
GET /organizations/{organizationId}/members/me
Authorization: Bearer {JWT_TOKEN}
```

**응답:**
```json
{
  "id": 456,
  "role": "ADMIN",  // 또는 "MEMBER"
  "nickname": "관리자A",
  "organizationId": 1,
  "memberId": 123,
  "organizationGroupId": null
}
```

**사용 예시:**
```javascript
// 프론트엔드에서 관리자 권한 확인
const response = await fetch(`/organizations/${orgId}/members/me`, {
  headers: { 'Authorization': `Bearer ${token}` }
});
const data = await response.json();

if (data.role === 'ADMIN') {
  // 관리자 전용 UI 표시
  showAdminFeatures();
}
```

### 2.6 조직 그룹 목록 조회
```http
GET /organizations/{organizationId}/groups
Authorization: Bearer {JWT_TOKEN}
```

**응답:**
```json
[
  {
    "id": 1,
    "name": "개발팀",
    "description": "개발 부서",
    "memberCount": 10  // 관리자만 볼 수 있음, 일반 회원은 null
  },
  {
    "id": 2,
    "name": "마케팅팀",
    "description": "마케팅 부서",
    "memberCount": 5
  }
]
```

**참고:**
- `memberCount`는 관리자만 조회 가능
- 일반 회원이 조회하면 `null` 반환

---

## 3. Room (물리적 공간)

### 3.1 방 생성 (관리자만)
```http
POST /organizations/{organizationId}/rooms
Authorization: Bearer {JWT_TOKEN}
Content-Type: multipart/form-data

file: (이미지 파일)
name: "회의실 A"
description: "10인실 회의실"
capacity: 10
```

**응답:**
```json
{
  "id": 1,
  "name": "회의실 A",
  "description": "10인실 회의실",
  "capacity": 10,
  "imageUrl": "https://s3.amazonaws.com/...",
  "organizationId": 1,
  "createdAt": "2024-01-15T10:00:00"
}
```

**제약사항:**
- `capacity`는 1 이상이어야 함
- 같은 조직 내에서 방 이름 중복 불가

### 3.2 방 목록 조회
```http
GET /organizations/{organizationId}/rooms
Authorization: Bearer {JWT_TOKEN}
```

**응답:**
```json
[
  {
    "id": 1,
    "name": "회의실 A",
    "description": "10인실 회의실",
    "capacity": 10,
    "imageUrl": "https://s3.amazonaws.com/...",
    "organizationId": 1
  },
  {
    "id": 2,
    "name": "회의실 B",
    "description": "5인실 회의실",
    "capacity": 5,
    "imageUrl": "https://s3.amazonaws.com/...",
    "organizationId": 1
  }
]
```

### 3.3 방 상세 조회
```http
GET /organizations/{organizationId}/rooms/{roomId}
Authorization: Bearer {JWT_TOKEN}
```

**응답:**
```json
{
  "id": 1,
  "name": "회의실 A",
  "description": "10인실 회의실",
  "capacity": 10,
  "imageUrl": "https://s3.amazonaws.com/...",
  "organizationId": 1,
  "createdAt": "2024-01-15T10:00:00"
}
```

---

## 4. Chat (채팅)

### 4.1 채팅방 생성 (일반 회원)
```http
POST /organizations/{organizationId}/chat-rooms
Authorization: Bearer {JWT_TOKEN}
Content-Type: application/json

{
  "content": "문의 드립니다. 회의실 예약은 어떻게 하나요?"
}
```

**응답:**
```json
{
  "roomId": 1,
  "organizationId": 1,
  "createdById": 123,
  "createdByEmail": "user@example.com",
  "assignedToId": null,
  "assignedToName": null,
  "createdAt": "2024-01-15T10:30:00",
  "firstMessage": "문의 드립니다. 회의실 예약은 어떻게 하나요?"
}
```

**참고:**
- 일반 회원이 문의를 시작할 때 사용
- 생성 시 첫 메시지를 함께 전송
- `assignedToId`는 null (아직 담당 관리자 없음)
- 한 회원은 조직당 하나의 채팅방만 생성 가능 (기존 채팅방이 있으면 재사용)

### 4.2 채팅방 목록 조회 (관리자만)
```http
GET /organizations/{organizationId}/chat-rooms
Authorization: Bearer {JWT_TOKEN}
```

**응답:**
```json
[
  {
    "roomId": 1,
    "createdByEmail": "user1@example.com",
    "assignedToName": null,  // 아직 담당자 없음
    "lastMessageAt": "2024-01-15T10:30:00"
  },
  {
    "roomId": 2,
    "createdByEmail": "user2@example.com",
    "assignedToName": "관리자A",  // 담당자 있음
    "lastMessageAt": "2024-01-15T11:00:00"
  },
  {
    "roomId": 3,
    "createdByEmail": "user3@example.com",
    "assignedToName": "관리자B",
    "lastMessageAt": "2024-01-15T09:45:00"
  }
]
```

**정렬:**
- `lastMessageAt` 기준 내림차순 (최신 메시지가 있는 채팅방이 먼저)

**권한:**
- `ADMIN` 역할만 조회 가능
- 일반 `MEMBER`가 호출하면 403 에러

**UI 활용 예시:**
```javascript
// 담당자가 없는 채팅방을 필터링
const unassignedChats = chatRooms.filter(chat => !chat.assignedToName);

// 내가 담당한 채팅방 필터링
const myChats = chatRooms.filter(chat => chat.assignedToName === myNickname);
```

### 4.3 채팅방 담당하기 (관리자만)
```http
POST /organizations/{organizationId}/chat-rooms/{roomId}/assign
Authorization: Bearer {JWT_TOKEN}
```

**응답:**
```json
{
  "roomId": 1,
  "organizationId": 1,
  "createdById": 123,
  "createdByEmail": "user@example.com",
  "assignedToId": 456,  // OrganizationMember ID
  "assignedToName": "관리자A",
  "createdAt": "2024-01-15T10:30:00",
  "lastMessageAt": "2024-01-15T10:30:00"
}
```

**동작:**
- 현재 로그인한 관리자를 해당 채팅방의 담당자로 설정
- `assignedToId`는 `OrganizationMember`의 ID (Member ID 아님!)
- `assignedToName`은 조직 내 닉네임

**제약:**
- 이미 다른 관리자가 담당 중이면 400 에러
- 관리자 권한이 없으면 403 에러

### 4.4 채팅방 담당 해제 (담당 관리자만)
```http
DELETE /organizations/{organizationId}/chat-rooms/{roomId}/assign
Authorization: Bearer {JWT_TOKEN}
```

**응답:**
```json
{
  "roomId": 1,
  "organizationId": 1,
  "createdById": 123,
  "createdByEmail": "user@example.com",
  "assignedToId": null,  // 담당자 해제됨
  "assignedToName": null,
  "createdAt": "2024-01-15T10:30:00",
  "lastMessageAt": "2024-01-15T11:00:00"
}
```

**제약:**
- 현재 담당자만 해제 가능
- 다른 관리자는 해제 불가 (400 에러)

### 4.5 채팅 메시지 조회
```http
GET /organizations/{organizationId}/chat-rooms/{roomId}/messages
Authorization: Bearer {JWT_TOKEN}
```

**응답:**
```json
[
  {
    "id": "507f1f77bcf86cd799439011",
    "roomId": 1,
    "senderId": "user@example.com",
    "admin": false,
    "content": "문의 드립니다. 회의실 예약은 어떻게 하나요?",
    "createdAt": "2024-01-15T10:30:00"
  },
  {
    "id": "507f1f77bcf86cd799439012",
    "roomId": 1,
    "senderId": "admin@example.com",
    "admin": true,
    "content": "안녕하세요. 회의실 예약은 시스템에서 가능합니다.",
    "createdAt": "2024-01-15T10:31:00"
  },
  {
    "id": "507f1f77bcf86cd799439013",
    "roomId": 1,
    "senderId": "user@example.com",
    "admin": false,
    "content": "감사합니다!",
    "createdAt": "2024-01-15T10:32:00"
  }
]
```

**정렬:**
- `createdAt` 기준 오름차순 (오래된 메시지부터)

**권한:**
- 채팅방 생성자 (일반 회원)
- 조직의 관리자 (모든 채팅방 조회 가능)
- 그 외에는 403 에러

**페이지네이션:**
- 현재는 전체 메시지 반환
- 향후 `offset`, `limit` 파라미터 추가 예정

---

## WebSocket 실시간 채팅

### 연결 설정

#### 1. SockJS 클라이언트 설치
```bash
npm install sockjs-client @stomp/stompjs
```

#### 2. WebSocket 연결
```javascript
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';

// SockJS 소켓 생성
const socket = new SockJS('http://localhost:8080/ws');

// STOMP 클라이언트 생성
const stompClient = new Client({
  webSocketFactory: () => socket,

  // JWT 토큰을 헤더에 포함
  connectHeaders: {
    Authorization: `Bearer ${jwtToken}`
  },

  // 연결 성공 시
  onConnect: (frame) => {
    console.log('WebSocket 연결 성공', frame);

    // 특정 채팅방 구독
    stompClient.subscribe(`/topic/chat-room/${roomId}`, (message) => {
      const data = JSON.parse(message.body);
      console.log('새 메시지:', data);

      // UI 업데이트
      addMessageToUI(data);
    });
  },

  // 연결 실패 시
  onStompError: (frame) => {
    console.error('STOMP 에러:', frame);
  },

  // 디버그 로그
  debug: (str) => {
    console.log('STOMP debug:', str);
  }
});

// 연결 시작
stompClient.activate();
```

### 메시지 전송

```javascript
// 메시지 전송 함수
function sendMessage(roomId, content, isAdmin) {
  const message = {
    roomId: roomId,
    content: content,
    isAdmin: isAdmin  // 관리자 여부
  };

  stompClient.publish({
    destination: '/app/chat',
    body: JSON.stringify(message)
  });
}

// 사용 예시
sendMessage(1, '안녕하세요!', false);  // 일반 회원
sendMessage(1, '문의 주셔서 감사합니다.', true);  // 관리자
```

### 메시지 수신

```javascript
// 채팅방 구독
stompClient.subscribe(`/topic/chat-room/${roomId}`, (message) => {
  const data = JSON.parse(message.body);

  // 수신된 메시지 구조
  console.log({
    senderId: data.senderId,      // "user@example.com"
    content: data.content,         // "안녕하세요!"
    createdAt: data.createdAt,     // "2024-01-15T10:30:00"
    admin: data.admin              // true 또는 false
  });

  // UI에 메시지 추가
  addMessageToUI(data);
});
```

### 연결 종료

```javascript
// WebSocket 연결 종료
function disconnect() {
  if (stompClient && stompClient.connected) {
    stompClient.deactivate();
    console.log('WebSocket 연결 종료');
  }
}

// 페이지 이탈 시 자동 종료
window.addEventListener('beforeunload', disconnect);
```

### 전체 예제 (React)

```javascript
import { useEffect, useState } from 'react';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';

function ChatRoom({ roomId, jwtToken, isAdmin }) {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [stompClient, setStompClient] = useState(null);

  // WebSocket 연결
  useEffect(() => {
    const socket = new SockJS('http://localhost:8080/ws');

    const client = new Client({
      webSocketFactory: () => socket,
      connectHeaders: {
        Authorization: `Bearer ${jwtToken}`
      },
      onConnect: () => {
        console.log('연결됨');

        // 채팅방 구독
        client.subscribe(`/topic/chat-room/${roomId}`, (message) => {
          const newMessage = JSON.parse(message.body);
          setMessages(prev => [...prev, newMessage]);
        });
      },
      onStompError: (frame) => {
        console.error('에러:', frame);
      }
    });

    client.activate();
    setStompClient(client);

    // 클린업
    return () => {
      if (client) {
        client.deactivate();
      }
    };
  }, [roomId, jwtToken]);

  // 메시지 전송
  const handleSend = () => {
    if (stompClient && stompClient.connected && inputMessage.trim()) {
      stompClient.publish({
        destination: '/app/chat',
        body: JSON.stringify({
          roomId: roomId,
          content: inputMessage,
          isAdmin: isAdmin
        })
      });
      setInputMessage('');
    }
  };

  return (
    <div>
      <div className="messages">
        {messages.map((msg, idx) => (
          <div key={idx} className={msg.admin ? 'admin-message' : 'user-message'}>
            <span>{msg.senderId}</span>
            <p>{msg.content}</p>
            <small>{msg.createdAt}</small>
          </div>
        ))}
      </div>

      <div className="input-area">
        <input
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          placeholder="메시지를 입력하세요..."
        />
        <button onClick={handleSend}>전송</button>
      </div>
    </div>
  );
}
```

### 메시지 전송 권한

**백엔드에서 검증하는 규칙:**

1. **일반 회원 (isAdmin: false)**
   - 자신이 생성한 채팅방에만 메시지 전송 가능
   - 다른 회원의 채팅방에는 전송 불가

2. **관리자 (isAdmin: true)**
   - 자신이 담당한 채팅방에만 메시지 전송 가능
   - 담당하지 않은 채팅방에는 전송 불가

**권한 없으면:**
- 메시지가 저장되지 않음
- 다른 사용자에게 브로드캐스트되지 않음
- 에러 메시지 반환

---

## 데이터 모델

### Member (MySQL)
```json
{
  "id": 123,                              // PK, Auto Increment
  "email": "user@example.com",            // Unique
  "password": "hashed_password",          // BCrypt
  "name": "홍길동",
  "createdAt": "2024-01-15T10:00:00",
  "updatedAt": "2024-01-15T10:00:00"
}
```

### Organization (MySQL)
```json
{
  "id": 1,                                // PK, Auto Increment
  "name": "우리 회사",
  "description": "회사 설명",
  "imageUrl": "https://s3.amazonaws.com/...",
  "createdAt": "2024-01-15T10:00:00",
  "updatedAt": "2024-01-15T10:00:00"
}
```

### OrganizationMember (MySQL)
```json
{
  "id": 456,                              // PK, Auto Increment (ChatRoom.assignedToId로 사용됨)
  "memberId": 123,                        // FK -> Member
  "organizationId": 1,                    // FK -> Organization
  "role": "ADMIN",                        // ADMIN 또는 MEMBER
  "nickname": "관리자A",                   // 조직 내 닉네임 (ChatRoom.assignedToName으로 사용됨)
  "organizationGroupId": 5,               // FK -> OrganizationGroup (nullable)
  "joinedAt": "2024-01-15T10:00:00"
}
```

**중요:**
- `id` 필드가 `ChatRoom.assignedToId`로 사용됨
- `nickname` 필드가 `ChatRoom.assignedToName`으로 복사됨

### OrganizationGroup (MySQL)
```json
{
  "id": 5,                                // PK, Auto Increment
  "organizationId": 1,                    // FK -> Organization
  "name": "개발팀",
  "description": "개발 부서",
  "createdAt": "2024-01-15T10:00:00"
}
```

### Room (MySQL)
```json
{
  "id": 1,                                // PK, Auto Increment
  "organizationId": 1,                    // FK -> Organization
  "name": "회의실 A",
  "description": "10인실 회의실",
  "capacity": 10,
  "imageUrl": "https://s3.amazonaws.com/...",
  "createdAt": "2024-01-15T10:00:00"
}
```

### ChatRoom (MongoDB)
```json
{
  "_id": "507f1f77bcf86cd799439011",      // MongoDB ObjectId
  "roomId": 1,                            // 논리적 ID (자동 증가)
  "organizationId": 1,                    // 어느 조직의 채팅인지
  "createdById": 123,                     // Member ID (문의 생성한 회원)
  "createdByEmail": "user@example.com",   // 회원 이메일
  "assignedToId": 456,                    // OrganizationMember ID (담당 관리자, null 가능)
  "assignedToName": "관리자A",             // 담당 관리자 닉네임 (null 가능)
  "createdAt": "2024-01-15T10:30:00",     // 채팅방 생성 시간
  "lastMessageAt": "2024-01-15T11:00:00"  // 마지막 메시지 시간 (정렬용)
}
```

**ID 생성 방식:**
- `_id`: MongoDB가 자동 생성하는 ObjectId
- `roomId`: `SequenceGeneratorService`를 통한 자동 증가 (1, 2, 3, ...)

### ChatMessage (MongoDB)
```json
{
  "_id": "507f1f77bcf86cd799439012",      // MongoDB ObjectId
  "roomId": 1,                            // ChatRoom의 roomId
  "senderId": "user@example.com",         // 발신자 이메일
  "admin": false,                         // 관리자 여부
  "content": "안녕하세요!",                // 메시지 내용
  "createdAt": "2024-01-15T10:30:00"      // 전송 시간
}
```

### Sequence (MongoDB)
```json
{
  "_id": "chat_room_sequence",            // 시퀀스 이름
  "seq": 1                                // 현재 시퀀스 번호
}
```

**참고:**
- MongoDB에는 MySQL의 AUTO_INCREMENT가 없음
- `SequenceGeneratorService`가 이를 대체
- Atomic한 `findAndModify` 연산으로 동시성 보장

---

## 에러 처리

### HTTP 상태 코드

| 코드 | 설명 | 예시 |
|------|------|------|
| 200 | 성공 | GET 요청 성공 |
| 201 | 생성 성공 | POST 요청으로 리소스 생성 |
| 400 | 잘못된 요청 | 유효성 검증 실패 |
| 401 | 인증 실패 | JWT 토큰 없음 또는 만료 |
| 403 | 권한 없음 | 관리자 권한 필요한데 일반 회원이 요청 |
| 404 | 리소스 없음 | 존재하지 않는 ID로 조회 |
| 409 | 충돌 | 중복된 데이터 (이메일, 방 이름 등) |
| 500 | 서버 에러 | 예상치 못한 에러 |

### 에러 응답 형식

```json
{
  "timestamp": "2024-01-15T10:30:00",
  "status": 403,
  "error": "Forbidden",
  "message": "관리자만 조회할 수 있습니다.",
  "path": "/organizations/1/chat-rooms"
}
```

### 주요 예외 상황

#### 1. Member 관련
| 예외 | 상태 코드 | 메시지 |
|------|-----------|--------|
| MemberNotFoundException | 404 | "회원을 찾을 수 없습니다." |
| MemberEmailDuplicationException | 409 | "이미 사용 중인 이메일입니다." |
| MemberPasswordInvalidException | 401 | "비밀번호가 일치하지 않습니다." |

#### 2. Organization 관련
| 예외 | 상태 코드 | 메시지 |
|------|-----------|--------|
| OrganizationNotFoundException | 404 | "조직을 찾을 수 없습니다." |
| OrganizationNotAdminException | 403 | "관리자 권한이 필요합니다." |
| OrganizationMemberAccessDeniedException | 403 | "조직 멤버가 아닙니다." |
| OrganizationMemberAlreadyExistsException | 409 | "이미 가입된 조직입니다." |
| OrganizationInvitationCodeInvalidException | 404 | "유효하지 않거나 만료된 초대 코드입니다." |
| OrganizationGroupNotFoundException | 404 | "조직 그룹을 찾을 수 없습니다." |

#### 3. Room 관련
| 예외 | 상태 코드 | 메시지 |
|------|-----------|--------|
| RoomNotFoundException | 404 | "방을 찾을 수 없습니다." |
| RoomCapacityInvalidException | 400 | "수용 인원은 1명 이상이어야 합니다." |
| RoomNameDuplicationException | 409 | "이미 사용 중인 방 이름입니다." |

#### 4. Chat 관련
| 예외 | 상태 코드 | 메시지 |
|------|-----------|--------|
| ChatRoomNotFoundException | 404 | "채팅방을 찾을 수 없습니다." |
| ChatRoomAlreadyExistsException | 409 | "이미 생성된 채팅방이 있습니다." |
| ChatRoomAccessDeniedException | 403 | "채팅방에 접근할 수 없습니다." |
| ChatRoomAlreadyAssignedException | 400 | "이미 담당자가 있는 채팅방입니다." |
| ChatRoomNotAssignedException | 400 | "담당하지 않은 채팅방입니다." |

### 에러 핸들링 예시 (JavaScript)

```javascript
async function getChatRooms(organizationId, token) {
  try {
    const response = await fetch(
      `http://localhost:8080/organizations/${organizationId}/chat-rooms`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) {
      const error = await response.json();

      switch (response.status) {
        case 401:
          // JWT 토큰 만료 또는 없음 -> 로그인 페이지로
          window.location.href = '/login';
          break;

        case 403:
          // 권한 없음 -> 관리자 전용 기능
          alert('관리자만 사용할 수 있는 기능입니다.');
          break;

        case 404:
          // 조직을 찾을 수 없음
          alert('조직을 찾을 수 없습니다.');
          break;

        default:
          alert(`에러 발생: ${error.message}`);
      }

      throw new Error(error.message);
    }

    return await response.json();

  } catch (error) {
    console.error('API 호출 실패:', error);
    throw error;
  }
}
```

---

## 부록: 개발 팁

### 1. JWT 토큰 디버깅
```javascript
// JWT 토큰 디코딩 (검증은 안 함)
function parseJwt(token) {
  const base64Url = token.split('.')[1];
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const jsonPayload = decodeURIComponent(
    atob(base64).split('').map(c =>
      '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
    ).join('')
  );
  return JSON.parse(jsonPayload);
}

const payload = parseJwt(jwtToken);
console.log('Member ID:', payload.memberId);
console.log('Email:', payload.sub);
console.log('만료 시간:', new Date(payload.exp * 1000));
```

### 2. 관리자 권한 확인 플로우
```javascript
// 1. 페이지 로드 시 권한 확인
async function checkAdminRole(organizationId, token) {
  const response = await fetch(
    `/organizations/${organizationId}/members/me`,
    { headers: { 'Authorization': `Bearer ${token}` } }
  );
  const data = await response.json();
  return data.role === 'ADMIN';
}

// 2. 컴포넌트에서 사용
const isAdmin = await checkAdminRole(orgId, token);

if (isAdmin) {
  // 관리자 UI 렌더링
  renderAdminDashboard();
} else {
  // 일반 회원 UI 렌더링
  renderMemberDashboard();
}
```

### 3. 채팅방 상태 관리 (React)
```javascript
import { create } from 'zustand';

const useChatStore = create((set) => ({
  chatRooms: [],
  currentRoomId: null,
  messages: {},

  // 채팅방 목록 설정
  setChatRooms: (rooms) => set({ chatRooms: rooms }),

  // 현재 채팅방 선택
  setCurrentRoom: (roomId) => set({ currentRoomId: roomId }),

  // 메시지 추가
  addMessage: (roomId, message) => set((state) => ({
    messages: {
      ...state.messages,
      [roomId]: [...(state.messages[roomId] || []), message]
    }
  })),

  // 담당자 업데이트
  updateAssignee: (roomId, assignedToName) => set((state) => ({
    chatRooms: state.chatRooms.map(room =>
      room.roomId === roomId ? { ...room, assignedToName } : room
    )
  }))
}));
```

### 4. 파일 업로드 (이미지)
```javascript
async function uploadOrganizationImage(formData, token) {
  const response = await fetch('/organizations', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
      // Content-Type은 자동으로 multipart/form-data로 설정됨
    },
    body: formData
  });

  return await response.json();
}

// 사용 예시
const formData = new FormData();
formData.append('file', imageFile);
formData.append('name', '우리 회사');
formData.append('description', '회사 설명');
formData.append('nickname', '관리자');

const result = await uploadOrganizationImage(formData, token);
```

### 5. WebSocket 재연결 로직
```javascript
function createReconnectingStompClient(url, token, roomId, onMessage) {
  let client = null;
  let reconnectAttempts = 0;
  const MAX_RECONNECT_ATTEMPTS = 5;
  const RECONNECT_DELAY = 3000; // 3초

  function connect() {
    const socket = new SockJS(url);

    client = new Client({
      webSocketFactory: () => socket,
      connectHeaders: { Authorization: `Bearer ${token}` },

      onConnect: () => {
        console.log('WebSocket 연결 성공');
        reconnectAttempts = 0;

        client.subscribe(`/topic/chat-room/${roomId}`, (message) => {
          onMessage(JSON.parse(message.body));
        });
      },

      onDisconnect: () => {
        console.log('WebSocket 연결 해제');
        attemptReconnect();
      },

      onStompError: (frame) => {
        console.error('STOMP 에러:', frame);
        attemptReconnect();
      }
    });

    client.activate();
  }

  function attemptReconnect() {
    if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
      reconnectAttempts++;
      console.log(`재연결 시도 ${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS}`);

      setTimeout(() => {
        connect();
      }, RECONNECT_DELAY);
    } else {
      console.error('최대 재연결 시도 횟수 초과');
      alert('서버와의 연결이 끊어졌습니다. 페이지를 새로고침해주세요.');
    }
  }

  connect();

  return {
    send: (message) => {
      if (client && client.connected) {
        client.publish({
          destination: '/app/chat',
          body: JSON.stringify(message)
        });
      }
    },
    disconnect: () => {
      if (client) {
        client.deactivate();
      }
    }
  };
}
```

---

## 연락처

- **백엔드 개발자**: [담당자 이름]
- **API 이슈 보고**: [이슈 트래커 URL]
- **슬랙 채널**: #klume-backend

---

**마지막 업데이트**: 2025-11-11
**API 버전**: 1.0.0
**백엔드 버전**: Spring Boot 3.x
