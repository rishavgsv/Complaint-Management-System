<h1 align="center">🚀 Resolve</h1>
<h3 align="center">Complaint Management System</h3>

<p align="center">
  A full-stack platform to streamline complaint reporting, tracking, and resolution.
</p>

<p align="center">
  <a href="https://complaint-management-system-6rfnq83sx-rishav-dev1.vercel.app/">🌐 Live Demo</a>
  •
  <a href="https://complaint-management-system-2qp9.onrender.com">🔗 Backend API</a>
</p>

---

<p align="center">
  <img src="https://img.shields.io/badge/Frontend-React-blue?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Backend-Node.js-green?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Database-MongoDB-brightgreen?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Deployment-Vercel%20%7C%20Render-black?style=for-the-badge" />
</p>

---

## 📌 Overview

> Built to solve real-world complaint management inefficiencies in institutional environments.

Resolve enables users to submit complaints, track progress, and ensures efficient resolution through worker assignment and admin verification.

---

## ✨ Features

### 👨‍🎓 User
- Submit complaints with description
- Upload image evidence (optional)
- Get unique complaint ID
- Track complaint status
- Reopen complaints
- Provide feedback

---

### 🛠️ Worker
- View assigned complaints
- Update status
- Mark work as completed
- Add comments

---

### 👨‍💼 Admin
- View all complaints
- Assign complaints to workers
- Verify completion
- Monitor performance statistics

---

## ⚡ Key Highlights

- 🔐 JWT-based authentication
- 📧 Email notifications via Resend API
- 🖼️ Image compression using Sharp
- 🚀 Rate limiting for API protection
- 📊 Scalable REST architecture

---

## 🏗️ Tech Stack

| Layer | Technology |
|------|----------|
| Frontend | React, Tailwind CSS |
| Backend | Node.js, Express |
| Database | MongoDB Atlas |
| Email | Resend API |
| Deployment | Vercel, Render |

---

## 🌐 Live Links

- Frontend: https://complaint-management-system-6rfnq83sx-rishav-dev1.vercel.app/
- Backend: https://complaint-management-system-2qp9.onrender.com

---

## ⚙️ Environment Variables

Create a `.env` file inside the backend folder:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
RESEND_API_KEY=your_resend_api_key
