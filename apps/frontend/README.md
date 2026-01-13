# PMD Management System - Frontend

A premium management dashboard built with Next.js 14, React, TypeScript, and TailwindCSS.

## Features

- 🔐 Authentication & Authorization
- 👥 Role-based access control (Direction, Supervisor, Administration, Operator)
- 📊 Multiple dashboards for different roles
- 💰 Cashbox & Expenses management
- 📈 Income tracking
- 🔨 Works/Projects management
- 🏢 Supplier management
- 📄 Contract management
- 🔔 Alerts system
- 📋 Audit logging

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **State Management**: Zustand
- **HTTP Client**: Axios
- **Code Quality**: ESLint + Prettier

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create a `.env.local` file in the root directory:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
/app
  /auth          # Authentication pages
  /dashboard     # Role-based dashboards
  /cash          # Cashbox & Expenses
  /expenses      # Expenses module
  /incomes       # Incomes module
  /works         # Works/Projects module
  /suppliers     # Suppliers module
  /contracts     # Contracts module
  /alerts        # Alerts module
  /audit         # Audit log module

/components
  /ui            # Reusable UI components
  /layout        # Layout components (Sidebar, Topbar)
  /auth          # Authentication components
  /forms         # Form components

/hooks           # Custom React hooks
/store           # Zustand stores
/lib             # Utilities and API client
```

## PMD Branding

The application follows PMD's premium brand identity:

- **Colors**: Dark Blue (#0f1f3d), Medium Blue (#1f3a68), Gold Accent (#d4af37)
- **Typography**: Inter/Manrope fonts
- **Style**: Clean, minimal, elegant with subtle shadows

## Authentication

The application uses JWT tokens for authentication. Tokens are stored in Zustand with persistence and automatically refreshed via Axios interceptors.

## Role-Based Access

Different user roles have access to different features:

- **Direction**: Full access to all modules and analytics
- **Supervisor**: Work management and oversight
- **Administration**: Financial management and administrative tasks
- **Operator**: Daily operations and assigned tasks

## API Integration

The frontend is configured to integrate with the PMD backend API. Update `NEXT_PUBLIC_API_URL` in your `.env.local` file to point to your backend server.

## Development

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run test:login` - Test login endpoint connectivity

## Testing

### Login Endpoint Test

Para verificar que el endpoint de login funciona correctamente sin depender de la UI:

```bash
npm run test:login
```

Este script:
- Lee la configuración de `NEXT_PUBLIC_API_URL` desde `.env.local` o variables de entorno
- Hace una petición POST a `/api/auth/login` con credenciales de prueba
- Muestra el status code y la respuesta del servidor
- Indica si el endpoint está funcionando correctamente (200/201) o si hay problemas (404/500)

**Nota**: El script usa credenciales de prueba (`test@example.com` / `password123`). Si estas credenciales no existen en tu base de datos, espera un 401 (Unauthorized), lo cual indica que el endpoint está funcionando pero las credenciales son inválidas.

## License

Proprietary - PMD Management System

