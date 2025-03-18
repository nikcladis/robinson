# Robinson Hotel Reservation System

A modern hotel reservation platform built with Next.js, TypeScript, Prisma, and PostgreSQL. This application allows users to browse hotels, view room availability, make bookings, and leave reviews.

## Features

- **User Authentication**: Secure login and registration system with role-based access (Customer/Admin)
- **Hotel Listings**: Browse and search available hotels with detailed information
- **Room Management**: View available rooms with pricing, amenities, and availability
- **Booking System**: Make reservations with date selection and special requests
- **User Reviews**: Leave ratings and reviews for hotels
- **Admin Dashboard**: Manage hotels, rooms, bookings, and users
- **Responsive Design**: Optimized for all device sizes

## Tech Stack

- **Frontend**: Next.js 15, React 19, TailwindCSS 4
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js
- **Form Handling**: React Hook Form with Zod validation
- **Date Handling**: Date-fns and React DatePicker

## Prerequisites

- Node.js 18+ and npm/yarn
- PostgreSQL database

## Getting Started

1. **Clone the repository**

```bash
git clone https://github.com/yourusername/robinson.git
cd robinson
```

2. **Install dependencies**

```bash
npm install
```

3. **Set up environment variables**

Create a `.env` file in the root directory with the following variables:

```
DATABASE_URL="postgresql://username:password@localhost:5432/hotel_reservation"
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"
```

4. **Set up the database**

```bash
npm run prisma:migrate:dev
npm run prisma:seed
```

5. **Start the development server**

```bash
npm run dev
```

6. **Open your browser**

Navigate to [http://localhost:3000](http://localhost:3000) to see the application.

## Available Scripts

- `npm run dev` - Start the development server with Turbopack
- `npm run build` - Build the application for production
- `npm run start` - Start the production server
- `npm run lint` - Run ESLint to check code quality
- `npm run prisma:studio` - Open Prisma Studio to manage database
- `npm run prisma:generate` - Generate Prisma client
- `npm run prisma:migrate:dev` - Create and apply migrations
- `npm run prisma:migrate:reset` - Reset database and apply migrations
- `npm run prisma:db:push` - Push schema changes to database
- `npm run prisma:seed` - Seed the database with initial data

## Project Structure

```
├── prisma/            # Database schema and migrations
├── public/            # Static assets
├── src/
│   ├── app/           # App router pages and layouts
│   ├── controllers/   # Business logic controllers
│   ├── errors/        # Error handling utilities
│   ├── helpers/       # Helper functions
│   ├── middleware/    # Request middleware
│   ├── models/        # Data models
│   ├── repositories/  # Data access layer
│   ├── services/      # Service layer
│   ├── shared/        # Shared components and utilities
│   ├── types/         # TypeScript type definitions
│   └── validations/   # Input validation schemas
└── scripts/           # Utility scripts
```

## License

This project is licensed under the MIT License.

## Acknowledgements

- [Next.js](https://nextjs.org/) - The React Framework
- [Prisma](https://www.prisma.io/) - Next-generation ORM
- [TailwindCSS](https://tailwindcss.com/) - Utility-first CSS framework
- [NextAuth.js](https://next-auth.js.org/) - Authentication for Next.js
