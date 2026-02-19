# Arya Vyshya Community Portal

A comprehensive community platform designed to connect members, promote businesses, manage events, and provide career opportunities within the Arya Vyshya community.

## Key Features

### 🛠 Moderation Hub
The **Moderation Hub** (formerly Verification Hub) serves as a unified command center for administrators.
-   **Unified Moderation**: Manage pending Jobs, Help Requests, and Support Tickets in one place.
-   **User Reports**: A dedicated system for reviewing community-flagged content with options to dismiss reports or delete content.
-   **Content Actions**: Direct "Create Post" shortcut for admins and bulk approval/rejection capabilities.

### 🗑 Soft Delete System
Implemented a robust **Soft Delete** functionality across all major modules:
-   Replaced permanent "Rejected" statuses with a "Deleted" status.
-   Items marked as deleted are removed from public views but retained in the admin panel for auditing.
-   Supported in Businesses, Events, Jobs, Scholarships, and Mentorships.

### 🏢 Business & Event Management
-   **Listing Verification**: Streamlined flow for approving and managing community contributions.
-   **Public Previews**: Integrated "View" links in the admin panel to quickly inspect listings on public pages.
-   **Refactored UI**: Improved layout with consistent filters and search bars across all management pages.

### 🎓 Career & Support
-   **Scholarship Management**: Simplified moderation for educational opportunities.
-   **Job Board**: Comprehensive platform for community-driven job listings and mentorship programs.
-   **Direct Support**: Integrated ticket system for handling member inquiries and technical help.

## Technology Stack
-   **Frontend**: Next.js (App Router), React, Tailwind CSS
-   **Database**: Prisma ORM with PostgreSQL/MySQL
-   **Authentication**: JWT-based secure sessions
-   **UI Components**: Radix UI, Lucide Icons, Shadcn/UI

## Getting Started

### Prerequisites
-   Node.js (v18 or higher)
-   npm / yarn / pnpm

### Installation

1.  Install dependencies:
    ```bash
    npm install
    ```
2.  Set up your `.env` file with database credentials and JWT secrets.
3.  Generate Prisma client:
    ```bash
    npx prisma generate
    ```
4.  Run the development server:
    ```bash
    npm run dev
    ```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
