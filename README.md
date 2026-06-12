# [Video link](https://www.loom.com/share/95f69ae0ff2f41e38f36fdab1e939b91)



# 📦 AssetIQ - Smart Asset Management Platform

![MERN Stack](https://img.shields.io/badge/Stack-MERN-blue)
![React](https://img.shields.io/badge/Frontend-React_18_%2B_Vite-61DAFB)
![Docker](https://img.shields.io/badge/Deployment-Docker_Compose-2496ED)

AssetIQ is a containerized, enterprise-grade asset management platform built to track, request, and manage shared resources. Designed with a robust Role-Based Access Control (RBAC) system, it provides seamless inventory tracking, an automated booking workflow, and real-time analytics.

---

## ✨ Key Features

* **🔐 Role-Based Access Control (RBAC):** Distinct workflows for `Consumers` (requesting assets) and `Administrators` (managing inventory and approvals).
* **📦 Dynamic Inventory Management:** Full CRUD operations for assets, including dynamic categorization and real-time quantity tracking.
* **🤝 Automated Booking Workflow:** A state-machine approval system preventing double-booking. When admins approve requests, inventory is automatically deducted. Upon return, inventory is restored.
* **📊 Real-Time Dashboard Analytics:** Dynamic visualization of asset distribution and system utilization using Recharts.
* **🕒 Comprehensive Audit Trails:** Filterable borrowing history separating personal user activity from system-wide administrative tracking.
* **🐳 1-Click Docker Deployment:** Fully containerized architecture isolating the Node.js backend, React frontend, and MongoDB database for guaranteed cross-platform compatibility.

---

## 🛠️ Tech Stack

**Frontend:**
* React 18 (Bootstrapped with Vite)
* Tailwind CSS (Styling)
* Lucide React (Iconography)
* Recharts (Data Visualization)
* Axios (API Communication)

**Backend:**
* Node.js (v22)
* Express.js
* MongoDB & Mongoose (Database & ORM)
* JSON Web Tokens (JWT Authentication)

**DevOps:**
* Docker & Docker Compose

---

## 🚀 Quick Start (Recommended)

This project is fully containerized. You do not need to install Node.js, npm, or MongoDB locally to run the application. 

### Prerequisites
* [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running.

### 1-Click Installation
1. Clone the repository:
   ```bash
   git clone [https://github.com/Parijat1072005/asset-management-platform.git](https://github.com/Parijat1072005/asset-management-platform.git)
   cd asset-management-platform
   ```
2. Spin up the entire environment:
  ```bash
  docker compose up --build -d
  ```
3. Access the application:

Frontend UI: [http://localhost:5173](http://localhost:5173)

Backend API: [http://localhost:5000](http://localhost:5000)

To stop the application and clean up resources, run: ```docker compose down```

## 🔐 Environment Variables
For convenience during evaluation, development secrets and database URIs have been integrated directly into the docker-compose.yml network configuration. No .env file configuration is required to run the Dockerized environment. The application provisions its own internal MongoDB container instance upon startup.

## 📂 Project Structure
```bash
Plaintext
├── backend/
│   ├── controllers/      # API Route logic (Assets, Bookings, Auth)
│   ├── middleware/       # JWT and Admin protection gates
│   ├── models/           # Mongoose Database Schemas
│   ├── routes/           # Express URL routing
│   ├── server.js         # Entry point
│   └── Dockerfile        # Backend container blueprint
├── frontend/
│   ├── src/
│   │   ├── components/   # Reusable UI (Sidebar, Layout, Modals)
│   │   ├── pages/        # Main Views (Dashboard, Inventory, Approvals)
│   │   ├── App.jsx       # Routing and RBAC logic
│   │   └── main.jsx      # React entry point
│   ├── vite.config.js    # Vite builder configuration
│   └── Dockerfile        # Frontend container blueprint
└── docker-compose.yml    # Master orchestration file
```
