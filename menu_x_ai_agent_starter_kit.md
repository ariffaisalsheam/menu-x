**📦 Menu.X — Developer AI Agent Starter Kit (Version 1.0)**

---

### ✅ 1. High-Level Summary

> **Goal:** Build Menu.X, a smart digital menu and ordering system for restaurants with AI-enhanced features.\
> **Target:** Fully working MVP (Version 1.0) for Therap Java Fest.

---

### 📚 Included Docs for Reference


### 🛠️ Stack Requirements

| Layer      | Technology                             |
| ---------- | -------------------------------------- |
| Frontend   | React.js + MUI + Firebase Hosting      |
| Backend    | Java (Spring Boot) on Render           |
| Database   | PostgreSQL (free tier on Render)       |
| Auth       | Firebase Auth with custom claims       |
| AI Service | Google Gemini API (text only for v1.0) |

---

### 🔐 Auth & Role Handling

- Firebase Auth for login
- Use custom claims: `"role": "admin"` or `"role": "owner"`
- Super Admin panel is role-gated

---

### 🧠 AI Agent Tasks

You (the AI agent) should be capable of:

#### Frontend (React):

-

#### Backend (Java Spring Boot):

-

#### Database (PostgreSQL):

-

#### Admin Panel:

-

---

### 📥 File Directory Suggestion

```
MenuX/
├── backend/
│   ├── src/controllers/
│   ├── src/models/
│   └── src/security/FirebaseAuthFilter.java
├── frontend/
│   ├── src/pages/
│   ├── src/components/
│   └── src/routes/
├── firebase/
│   ├── firebase.json
│   ├── airules.md
├── docs/
│   ├── Feature_Document.md
│   ├── User_Dev_Stories.md
│   ├── Database_Schema.png
│   ├── API_Endpoints.java
│   └── Frontend_Route_Map.jsx
```

---

### 🔚 Final Instructions

Once Version 1.0 is complete and deployed:

- Demo user: `testowner@menux.com` / testpass
- Admin user: `admin@menux.com` / adminpass
- Firebase project & domain: `menux-app.web.app`

---

> This kit ensures the developer or AI agent has everything needed to start and deliver Menu.X efficiently. All referenced files should be synchronized into your repo or Firebase Studio environment.

