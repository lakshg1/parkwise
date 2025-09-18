# ParkWise - Smart Parking Management

Welcome to ParkWise, a modern, feature-rich smart parking management system built with Next.js and powered by AI. This application provides a seamless experience for both users looking for a parking spot and administrators managing the facilities.

## ✨ Features

- **Real-time Availability**: Users can see live availability for both car and bike parking spots across multiple lots.
- **Smart Slot Allocation**: Our system intelligently allows bikes to be parked in available car slots, maximizing space utilization.
- **Dynamic Pricing**: Set peak and off-peak pricing rules for different vehicle types in each lot. Prices are calculated automatically for users.
- **User & Admin Roles**:
  - **Users**: Can find available spots, book them for a specific duration, view their booking history, and cancel bookings.
  - **Admins**: Have access to a dedicated dashboard to manage parking lots, toggle slots for maintenance, configure pricing rules, and generate insightful reports.
- **AI-Powered Reports**: Admins can generate fictional occupancy and revenue reports for any date range, complete with AI-driven analysis and suggestions for improvement.
- **Component-Based UI**: Built with modern, reusable components from ShadCN UI for a clean and consistent user experience.

## 🚀 Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (with App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) & [ShadCN UI](https://ui.shadcn.com/)
- **State Management**: React Context & Hooks
- **AI/Generative**: [Google's Genkit](https://firebase.google.com/docs/genkit)
- **Icons**: [Lucide React](https://lucide.dev/)

## 🏁 Getting Started

To get the application running locally, follow these steps:

1.  **Install dependencies**:
    ```bash
    npm install
    ```

2.  **Run the development server**:
    ```bash
    npm run dev
    ```
    The application will be available at [http://localhost:9002](http://localhost:9002).

## 🧑‍💻 Demo Accounts

The application is pre-populated with mock data for users, lots, and bookings. To test the different roles, navigate to the `/login` page:

- **Login as a User**: Click on "Login as John Doe" or "Login as Jane Smith" to access the user dashboard, find spots, and make bookings.
- **Login as an Admin**: Click on "Login as Admin" to access the admin-specific pages for managing lots, pricing, and reports.

This starter project provides a solid foundation for building a full-stack, AI-powered web application. Feel free to explore and modify the code!
