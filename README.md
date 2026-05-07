# ✈️ Voyager Pro: Luxury Travel Itinerary Planner

![Voyager Pro Banner](https://lh3.googleusercontent.com/aida-public/AB6AXuB8ri38B0P14R7hFv1_fh6xokOgZUQSe8xmgYXPZNHt3Pzd5tPQqnVpdpSGPkv9GtPLZeJcayI2flgxTCzj_Lu9EK2FOH9JVJsaEUh5HZf1sLgTywEQ4qb9xBTAU-stmA-mmFvtMAt5sBYx2iV14BxA4MIRNcz7KxSjy9b351BrzggqE9kj5Pk8GovM5ttuJuckta9cVvDbFWed5kTgvQoK66z_QwpHAxYVIHxJzhwpW9xyTNT9H3nWVX3I3LnTjRHdp6TIcdi7EPEU)

Voyager Pro is an enterprise-grade travel itinerary planner designed for modern explorers and luxury travel managers. It blends high-performance logistics with a premium **Horizon Glass** aesthetic to provide a seamless, immersive planning experience.

---

## ✨ Key Features

- **📍 Dynamic Itinerary**: Day-by-day scheduling with intuitive drag-and-drop activity reordering.
- **🏨 Unified Bookings**: Manage flights, accommodations, and transportation in one centralized hub.
- **💰 Budget Intelligence**: Real-time expense tracking with category breakdowns and multi-currency support.
- **📂 Document Vault**: Securely store and access digital copies of passports, visas, and booking confirmations.
- **💬 Seamless Collaboration**: Invite travel buddies, assign tasks, and discuss plans via integrated group chat.
- **📸 Memory Gallery**: Capture and organize trip photos into a chronological timeline of your journey.
- **🌓 Adaptive UI**: Fully responsive design with optimized Light and Dark modes.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 19 + TypeScript
- **Styling**: Tailwind CSS + Custom Design System
- **Animations**: Framer Motion
- **State Management**: Context API
- **Build Tool**: Vite

### Backend
- **Core**: .NET 10 (Clean Architecture)
- **Database**: Microsoft SQL Server
- **ORM**: Entity Framework Core
- **Security**: JWT Authentication + BCrypt Hashing

### Infrastructure
- **Containerization**: Docker & Docker Compose
- **Web Server**: Nginx (Reverse Proxy)

---

## 🚀 Installation & Setup

### Prerequisites
- [Node.js](https://nodejs.org/) (v18+)
- [.NET SDK](https://dotnet.microsoft.com/download) (v10.0+)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)

### Option 1: Docker (Recommended)
The fastest way to get Voyager Pro running is using Docker Compose.

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/ZeeshanNeo/TravelItineraryPlanner.git
    cd TravelItineraryPlanner
    ```

2.  **Launch the stack**:
    ```bash
    docker-compose -f deployment/docker-compose.yml up --build
    ```

3.  **Access the application**:
    - **Frontend**: [http://localhost:5173](http://localhost:5173)
    - **Backend API**: [http://localhost:5000/swagger](http://localhost:5000/swagger)

---

### Option 2: Local Development

#### Backend Setup
1.  Navigate to the backend directory:
    ```bash
    cd backend
    ```
2.  Restore dependencies and run:
    ```bash
    dotnet restore
    dotnet run --project API/API.csproj
    ```

#### Frontend Setup
1.  Navigate to the frontend directory:
    ```bash
    cd frontend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Start the development server:
    ```bash
    npm run dev
    ```

---

## 📂 Project Structure

```text
TravelItineraryPlanner/
├── backend/            # .NET 10 API & Business Logic
├── frontend/           # React + Vite Frontend
├── deployment/         # Docker, Nginx, and Orchestration
├── plans/              # Implementation & Hardening Blueprints
└── AI-Agent/           # Quality Assurance & KPI Documentation
```

---

## 🟢 Production Status
Voyager Pro is currently **🟢 PRODUCTION READY** and has passed 100% of the Enterprise KPI validation tests.

- **Unit Tests**: Verified
- **Hardening**: Completed
- **Aesthetics**: Horizon Glass Standard

---

## 📄 License
This project is for assessment purposes. All rights reserved.

*Voyager Pro - Travel Smarter.*
