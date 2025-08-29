# 🏓 **Born2Pong** - Transcendence

<div align="center">

*A 3D Pong game with tournaments, live chat, and social features*

[![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)
[![Django](https://img.shields.io/badge/Django-092E20?style=for-the-badge&logo=django&logoColor=white)](https://djangoproject.com/)
[![Three.js](https://img.shields.io/badge/Three.js-000000?style=for-the-badge&logo=three.js&logoColor=white)](https://threejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://postgresql.org/)

</div>

---

## 🎯 **Overview**

A sophisticated web application that reimagines the classic Pong experience through **immersive 3D graphics**, **real-time multiplayer tournaments**, and **comprehensive social features**. Built with modern web technologies and inspired by the original 1972 Pong arcade board aesthetics.

**🔥 Technical Achievement**: Full-stack single-page application with WebGL 3D rendering, real-time WebSocket communication, and containerized microservices architecture.

---

## ✨ **Features**

### 🎮 **Advanced 3D Game Engine**
- **WebGL-Powered Environment**: Fully immersive 3D arcade room with authentic retro aesthetics
- **Local Multiplayer Gaming**: Simultaneous two-player action with responsive controls
- **Custom Shader Pipeline**: Real-time post-processing effects (pixelation, invert shaders, FXAA)
- **Physics & Collision**: Precise paddle movement and ball physics simulation

### 🏆 **Tournament System**
- **Multi-player Tournaments**: Create and join tournaments with bracket visualization
- **Real-time Updates**: Live tournament progression via WebSocket
- **Match Organization**: Automated player pairing and round management

### 💬 **Social Platform**
- **Live Chat**: Real-time private messaging between users
- **Friend System**: Add/remove friends with online status
- **Game Invitations**: Send and receive game invites through notifications
- **User Profiles**: Avatar upload and profile customization

### 🔐 **Authentication**
- **OAuth 2.0**: Login with 42 School API
- **Traditional Auth**: Username/password registration
- **Secure Sessions**: Token-based authentication

### 📊 **Statistics**
- **Game History**: Track wins, losses, and performance
- **User Statistics**: Personal dashboards with game analytics
- **Leaderboards**: Compare performance with other players

### 🛡️ **Privacy & Security**
- **GDPR Compliance**: Account deletion and data export
- **Secure Data**: Encrypted passwords and protected user data
- **Privacy Controls**: Block users and manage visibility

---

## 🚀 **Tech Stack**

**Backend Architecture:**
- **Django 4.2.9** + **Django REST Framework** - Robust API development
- **Django Channels** + **ASGI** - Real-time WebSocket communication
- **PostgreSQL** - Relational database with complex queries
- **Redis** - High-performance WebSocket channel layer & caching

**Frontend Technologies:**
- **Vanilla JavaScript SPA** - Custom single-page application routing
- **Three.js + WebGL** - Hardware-accelerated 3D graphics rendering
- **Bootstrap 5** - Responsive design framework
- **WebSocket API** - Bidirectional real-time communication

**DevOps & Infrastructure:**
- **Docker Compose** - Containerized microservices architecture
- **Nginx** - Production-grade reverse proxy with SSL termination
- **Daphne ASGI Server** - Async Python web server

---

## ⚡ **Technical Highlights**

- **🎨 Custom 3D Engine**: Built from scratch using Three.js with advanced rendering pipeline
- **📡 Real-time Architecture**: WebSocket-based communication handling multiple concurrent connections  
- **🔒 Enterprise Security**: OAuth 2.0 integration, token authentication, HTTPS encryption
- **🏗️ Scalable Design**: Microservices architecture with separated concerns and containerization
- **📊 Complex Data Models**: Advanced PostgreSQL schemas with relationships and constraints
- **🎯 Modern Web Standards**: SPA with custom routing, responsive design, WebGL support

---

## 🚀 **Quick Start**

### Prerequisites
- Docker & Docker Compose
- Modern web browser with WebGL support

### Installation

1. **Clone and setup**
```bash
git clone https://github.com/lgeniaux/transcendence.git
cd transcendence
cp .env.example .env
# Configure your .env file with proper values
```

2. **Launch**
```bash
make all
# or: docker compose up --build -d
```

3. **Access**
- Application: https://localhost:8443
- Accept the self-signed SSL certificate

### Development Commands
```bash
make all      # Start all services
make clean    # Stop services  
make fclean   # Clean everything (including volumes)
make build    # Rebuild without cache

# Django commands
docker compose exec web python backend/manage.py [command]

# Run tests
docker compose exec web python -m pytest
```

---

## 🎮 **How to Play**

1. **Register** or login with 42 OAuth
2. **Local Game**: Play immediately with a friend on the same keyboard
3. **Tournament**: Create or join tournaments for competitive play
4. **Chat**: Message other players and build your friend network
5. **Statistics**: Track your progress and compare with others

---

## 🏗️ **Architecture**

```
🌐 Nginx (SSL, Static Files)
    ↓
🐍 Django (API, Authentication)
    ↓
📡 Django Channels (WebSocket: Chat, Notifications)
    ↓
🗄️ PostgreSQL (Data) + ⚡ Redis (WebSocket)
```

**WebSocket Usage:**
- Real-time chat messaging
- Live notifications (friend requests, game invites)
- Tournament updates and match announcements

---

## 📱 **Browser Support**

| Browser | Version | Status |
|---------|---------|--------|
| Chrome  | 80+     | ✅ Full Support |
| Firefox | 75+     | ✅ Full Support |
| Safari  | 13+     | ✅ Full Support |
| Edge    | 80+     | ✅ Full Support |

*Requires WebGL support for 3D graphics*

---

## 🎨 **Design Inspiration**

The UI design draws inspiration from the original 1972 Pong arcade board, featuring:
- Retro color schemes and typography
- Authentic arcade cabinet aesthetics  
- Modern web standards with nostalgic visual elements
- 3D environment that recreates the arcade experience

---

## 📄 **License**

Educational project for 42 School curriculum.

---

<div align="center">

**🎮 Ready to play some 3D Pong? 🏓**

*Built by 42 School students*

</div>