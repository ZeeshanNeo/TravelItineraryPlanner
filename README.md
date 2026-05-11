# Voyager Pro: Travel Itinerary Planner

Voyager Pro is a modern, full-stack travel itinerary planning application designed for explorers and travel managers. It features a robust .NET backend and a responsive React frontend, providing seamless trip management, budget tracking, and collaborative planning.

## 🚀 Key Features

- **Dynamic Itineraries**: Plan your journey day-by-day with intuitive drag-and-drop scheduling.
- **Budget Tracking**: Real-time expense logging and budget monitoring.
- **Document Vault**: Securely store and access travel documents (Flights, Accommodations, Visas).
- **Collaboration**: Invite companions to view and edit trip details.
- **Memory Gallery**: Capture and organize trip photos into a chronological timeline.
- **Progressive Web App (PWA)**: Installable on mobile for offline access to critical travel data.

## 🛠️ Technology Stack

### Backend
- **Core**: .NET 8 / ASP.NET Core
- **Architecture**: Clean Architecture (Domain, Application, Infrastructure, API)
- **Database**: Microsoft SQL Server with Entity Framework Core
- **Security**: JWT Authentication with Refresh Token Rotation
- **Validation**: FluentValidation

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Data Fetching**: Axios & React Query
- **State Management**: React Context & Hooks

## 📂 Project Structure

```text
├── backend/            # ASP.NET Core Web API
├── frontend/           # React + Vite application
├── docs/               # System documentation
│   ├── architecture/   # Architecture Decision Records (ADR)
│   ├── features/       # Feature-specific design docs
│   └── testing/        # Test reports and strategies
└── deployment/         # Dockerfiles and orchestration
```

## 🏁 Getting Started

To get the project running locally, please refer to the **[Development Guide](DEVELOPMENT.md)**.

## 📖 Documentation

- **[User Guide](UserGuide.md)**: How to use the application.
- **[Contributing Guide](CONTRIBUTING.md)**: Coding standards and how to contribute.
- **[Architecture ADRs](docs/architecture/)**: Why we made certain technical decisions.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.
