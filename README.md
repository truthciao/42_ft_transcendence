*This project has been created as part of the 42 curriculum by yshi, yanzhao, helin, zhwu, hanwang.*

# ft_transcendence

## Description

### Project Name

**ft_transcendence** is a web-based collaborative platform inspired by tools such as Notion and modern team communication platforms.

### Goal

The goal of the project is to build a complete web application where users can communicate, manage workspaces, collaborate on documents in real time, and manage their profiles, relationships, notifications, and permissions.

The project was developed as a team following the 42 curriculum and focuses on full-stack development, real-time communication, authentication, collaboration, and a modular permission system.

### Overview

The application provides a unified environment where users can:

* Create an account and authenticate securely.
* Sign in using standard authentication or Google OAuth.
* Enable two-factor authentication.
* Manage their profile and avatar.
* Search for and interact with other users.
* Send and manage friendship requests.
* Communicate through direct messages and group conversations.
* Create and manage workspaces.
* Invite users to workspaces and assign workspace roles.
* Create and manage workspace channels.
* Receive real-time notifications.
* Configure notification preferences.
* Upload and manage files and message attachments.
* Create and edit collaborative documents.
* Collaborate on documents in real time.
* Use the application in English, French, or Chinese.
* Access the application using supported additional browsers.
* Use a consistent custom design system and reusable UI components.

### Key Features

The main features of the application include:

* User registration and authentication
* Google OAuth 2.0 authentication
* Two-factor authentication (2FA)
* User profiles and avatar management
* User search and interaction
* Friendship management
* Direct and group communication
* Workspace and organization management
* Workspace invitations and roles
* Advanced workspace permissions
* Real-time presence and communication
* Real-time collaborative document editing
* Notification system
* Notification preferences
* File upload and management
* Multilingual interface
* Custom reusable design system
* Additional browser support
* HTTPS development environment

---

# Instructions

## Prerequisites

The following software is required to run the project locally:

* **Node.js** `>= 22`
* **pnpm** `11.x`
* **PostgreSQL** `17`
* **Docker** and **Docker Compose**

The project uses a pnpm workspace/monorepo structure.

You can verify your installed versions with:

```bash
node --version
pnpm --version
docker --version
docker compose version
```

## Installation

Clone the repository:

```bash
git clone https://github.com/truthciao/42_ft_transcendence.git
cd 42_ft_transcendence
```

Install dependencies:

```bash
pnpm install
```

Generate the Prisma client:

```bash
pnpm --filter api prisma generate
```

## Environment Configuration

Create the required environment configuration according to the example provided by the project.

The application uses environment variables for authentication, database access, OAuth, and optional email functionality.

A typical configuration includes:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/transcendence"

JWT_SECRET="your-secret"

GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GOOGLE_CALLBACK_URL="http://localhost:3000/auth/google/callback"
```

### Optional Email Configuration

Email functionality can be configured using SMTP:

```env
MAIL_HOST="smtp.gmail.com"
MAIL_PORT="587"
MAIL_SECURE="false"
MAIL_USER="your-email@gmail.com"
MAIL_PASS="your-app-password"
MAIL_FROM="noreply@yourdomain.com"
```

Email configuration is optional. If SMTP is not configured, email notifications are skipped.

When using Gmail, `MAIL_PASS` should normally be a Gmail **App Password**, rather than the account's regular password.

For the complete list of environment variables and development configuration, see the project development documentation.

## Database Setup

Start PostgreSQL and make sure the configured database is available.

Run Prisma migrations:

```bash
pnpm --filter api prisma migrate dev
```

Generate the Prisma client:

```bash
pnpm --filter api prisma generate
```

If the project seed is available, the database can also be populated using the project's seed workflow.

## Running the Application

Start the frontend and backend in development mode:

```bash
pnpm dev
```

The project uses the following main applications:

```text
apps/web   → React frontend
apps/api   → NestJS backend
```

The frontend communicates with the backend through HTTP APIs and WebSocket connections.

## Docker Development

The project also provides a Docker Compose environment.

Start the services with:

```bash
docker compose up --build
```

Stop the services with:

```bash
docker compose down
```

To remove containers and associated volumes:

```bash
docker compose down -v
```

## HTTPS

The project supports HTTPS through an Nginx reverse proxy.

Development certificates can be generated using:

```bash
make certs
```

The HTTPS development environment can then be started using the project's Makefile/Compose workflow.

HTTPS is used to reproduce a production-like secure connection and to support browser features that require a secure context.

For more detailed development commands and troubleshooting information, see:

`docs/DEVELOPMENT.md`

---

# Team Information

The project was developed by a five-person team.

| Member      | Role            | Main Responsibilities                                                                                                            |
| ----------- | --------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| **yshi**    | Product Owner   | Product planning and priorities, custom design system, advanced permissions, real-time functionality                             |
| **yanzhao** | Project Manager | Project coordination, task distribution, progress tracking, user management and authentication, OAuth 2.0, 2FA, user interaction |
| **helin**   | Tech Lead       | Technical architecture, framework integration, ORM/database, technical decisions and code review                                 |
| **zhwu**    | Developer       | Notification system, real-time collaborative features, multilingual support/i18n                                                 |
| **hanwang** | Developer       | File upload and management system, related application development and integration                                               |

The responsibilities listed above describe the primary ownership of the corresponding features. Development was collaborative and team members also contributed to integration, testing, review, and other project tasks.

---

# Project Management

The project is managed collaboratively using GitHub and Notion, with Discord as the main communication channel.

## Task Management

* **GitHub Issues** are used to create, track, and discuss development tasks, bugs, and feature requests.
* **Notion** is used for project organization, planning, documentation, and project-related information.

## Communication

* **Discord** is the main communication channel for day-to-day discussions, coordination, technical questions, and team communication.
* **Weekly meetings** are held to review progress, discuss ongoing work, identify blockers, and coordinate upcoming tasks.

## Development Workflow

The team follows a feature-based Git workflow:

1. Tasks and features are tracked through GitHub Issues.
2. Developers create dedicated feature branches.
3. Changes are committed to the corresponding branch.
4. A Pull Request is opened when the work is ready for review.
5. Team members perform code reviews before changes are merged.
6. Weekly meetings and Discord discussions are used to coordinate work and resolve blockers.

This workflow keeps responsibilities clear and ensures that changes are reviewed before being integrated into the main codebase.

---

# Technical Stack

## Frontend

| Technology                  | Purpose                                         |
| --------------------------- | ----------------------------------------------- |
| **React**                   | Component-based frontend application            |
| **TypeScript**              | Static typing and safer application development |
| **Vite**                    | Development server and frontend build tooling   |
| **React Router**            | Client-side routing                             |
| **TanStack Query**          | Server-state management and API data fetching   |
| **i18next / react-i18next** | Internationalization                            |
| **Tailwind CSS**            | Utility-based styling                           |
| **shadcn/UI / Base UI**     | Reusable interface components                   |
| **Sonner**                  | Toast notifications                             |

### Why React and TypeScript?

React provides a component-based architecture that fits the application's large number of reusable UI elements.

TypeScript is used throughout the frontend to make component interfaces, API data, and shared types more explicit and easier to maintain.

Vite provides a fast development environment and efficient production builds.

## Backend

| Technology                   | Purpose                                         |
| ---------------------------- | ----------------------------------------------- |
| **NestJS**                   | Backend framework                               |
| **TypeScript**               | Type-safe backend development                   |
| **Prisma**                   | ORM and database access                         |
| **Zod**                      | Runtime schema validation                       |
| **nestjs-zod**               | Integration between Zod schemas and NestJS DTOs |
| **Socket.IO**                | Real-time communication                         |
| **JWT**                      | Authentication                                  |
| **OAuth 2.0 / Google OAuth** | Remote authentication                           |

### Why NestJS?

NestJS provides a modular backend architecture based on controllers, services, modules, and dependency injection. This structure is suitable for separating authentication, profiles, workspaces, conversations, notifications, documents, and other application domains.

Using TypeScript on both frontend and backend also provides a consistent development environment.

## Database

### PostgreSQL

PostgreSQL is used as the relational database.

It was chosen because the application contains many structured relationships between users, workspaces, conversations, messages, friendships, notifications, documents, and attachments.

A relational database is well suited to these relationships and provides foreign keys, unique constraints, indexes, and transactional consistency.

### Prisma

Prisma is used as the ORM.

It provides:

* Type-safe database access
* Database migrations
* Schema-based data modeling
* Generated TypeScript database client
* Clear relationships between entities

## Real-Time Communication

**Socket.IO** is used for real-time communication.

It supports the application's real-time requirements, including:

* Online presence
* Notifications
* Communication events
* Workspace-related events
* Collaborative document events

## Infrastructure

| Technology         | Purpose                               |
| ------------------ | ------------------------------------- |
| **Docker**         | Containerization                      |
| **Docker Compose** | Multi-service development environment |
| **Nginx**          | Reverse proxy and HTTPS               |
| **GitHub**         | Source control and collaboration      |

---

# Database Schema

The project uses PostgreSQL with Prisma ORM.

The database is centered around users, profiles, workspaces, conversations, friendships, notifications, attachments, and collaborative documents.

## Main Entities

| Entity                   | Purpose                               | Key Fields                                                                                |
| ------------------------ | ------------------------------------- | ----------------------------------------------------------------------------------------- |
| `User`                   | User account and authentication data  | `id`, `email`, `username`, `passwordHash`, `isTwoFactorEnabled`, `createdAt`, `updatedAt` |
| `Profile`                | User profile information              | `id`, `userId`, `displayName`, `bio`, `avatarUrl`, `preferredLanguage`                    |
| `OAuthAccount`           | External OAuth account associations   | `id`, `userId`, `provider`, `providerId`                                                  |
| `Workspace`              | Organization/workspace                | `id`, `name`, `slug`, `description`, `icon`, `ownerId`                                    |
| `WorkspaceMember`        | Workspace membership and role         | `id`, `workspaceId`, `userId`, `role`, `joinedAt`                                         |
| `WorkspaceInvite`        | Workspace invitation management       | `id`, `workspaceId`, `inviterId`, `inviteeId`, `role`, `status`, `token`, `expiresAt`     |
| `Conversation`           | Direct, group, or workspace channel   | `id`, `type`, `name`, `workspaceId`, `isDefault`                                          |
| `ConversationMember`     | User membership in conversations      | `id`, `conversationId`, `userId`, `joinedAt`, `lastReadMessageId`                         |
| `Message`                | Messages sent in conversations        | `id`, `conversationId`, `senderId`, `content`, `createdAt`                                |
| `Friendship`             | Friendship requests and relationships | `id`, `requesterId`, `addresseeId`, `status`, `createdAt`, `updatedAt`                    |
| `Notification`           | User and workspace notifications      | `id`, `recipientId`, `actorId`, `type`, `read`, `createdAt`                               |
| `NotificationPreference` | Per-user notification preferences     | `id`, `userId`, `type`, `viaInApp`, `viaEmail`                                            |
| `Attachment`             | Uploaded file metadata                | `id`, `uploaderId`, `messageId`, `fileName`, `fileUrl`, `fileType`, `fileSize`            |
| `Document`               | Collaborative workspace documents     | `id`, `title`, `content`, `yjsState`, `workspaceId`, `creatorId`                          |

## Main Relationships

* A `User` can have one optional `Profile`.
* A `User` can have multiple `OAuthAccount` records.
* A `User` can own multiple `Workspace` records.
* `WorkspaceMember` creates a many-to-many relationship between `User` and `Workspace` and stores the user's role.
* A `Workspace` can contain multiple `WorkspaceInvite` records.
* A `Workspace` can contain multiple conversations/channels.
* A `Workspace` can contain multiple collaborative documents.
* `ConversationMember` creates a many-to-many relationship between `User` and `Conversation`.
* A `Conversation` contains multiple `Message` records.
* Each `Message` belongs to a `User` as its sender.
* A `Message` can have multiple `Attachment` records.
* `Friendship` connects two users through requester and addressee relationships.
* `Notification` belongs to a recipient and can optionally reference an actor, friendship, or workspace.
* `NotificationPreference` stores notification settings for each user and notification type.
* An `Attachment` belongs to its uploader and can optionally be associated with a message.
* A `Document` belongs to a `Workspace` and has a creator represented by a `User`.

## Enums

The schema defines the following enums:

* `PreferredLanguage`: `en`, `fr`, `zh`
* `WorkspaceRole`: `OWNER`, `ADMIN`, `MEMBER`
* `WorkspaceInviteStatus`: `PENDING`, `ACCEPTED`, `REJECTED`, `REVOKED`
* `ConversationType`: `DIRECT`, `GROUP`, `CHANNEL`
* `FriendshipStatus`: `PENDING`, `ACCEPTED`, `BLOCKED`
* `NotificationType`: notification events related to friendships and workspaces

## Database Constraints and Indexes

The schema uses primary keys, foreign keys, unique constraints, indexes, and cascading rules.

Examples include:

* `User.email` and `User.username` are unique.
* `Profile.userId` is unique, enforcing a one-to-one relationship between `User` and `Profile`.
* `OAuthAccount` has a unique constraint on `(provider, providerId)`.
* `Workspace.slug` is unique.
* `WorkspaceMember` has a unique constraint on `(workspaceId, userId)`.
* `ConversationMember` has a unique constraint on `(conversationId, userId)`.
* `Friendship` has a unique constraint on `(requesterId, addresseeId)`.
* `NotificationPreference` has a unique constraint on `(userId, type)`.
* Notification and workspace membership queries use dedicated indexes.
* Several relationships use cascading deletes to maintain referential integrity.

### Entity Relationship Overview

```text
                                  ┌──────────────┐
                                  │     User     │
                                  └──────┬───────┘
             ┌──────────────────────────┼──────────────────────────┐
             │             │            │             │            │
             ▼             ▼            ▼             ▼            ▼
         Profile     OAuthAccount   Workspace     Friendship   Notification
                                      │
                         ┌────────────┼──────────────┐
                         │            │              │
                         ▼            ▼              ▼
                  WorkspaceMember  Invite       Document
                         │
                         ▼
                       User

Workspace
   │
   └── Conversation
          │
          ├── ConversationMember ── User
          │
          └── Message
                │
                └── Attachment

User
 ├── NotificationPreference
 └── Attachment
```

---

# Features List

The following table summarizes the main implemented features and their primary contributors.

| Feature                    | Primary Contributor(s) | Description                                        |
| -------------------------- | ---------------------- | -------------------------------------------------- |
| User Registration          | yanzhao                | Standard account creation                          |
| User Authentication        | yanzhao                | Login, logout, and authenticated sessions          |
| Google OAuth 2.0           | yanzhao                | Remote authentication through Google               |
| Two-Factor Authentication  | yanzhao                | Additional authentication security                 |
| User Profiles              | zhwu                   | Profile information and account-related UI         |
| Avatar Upload              | zhwu                   | Upload and serve user avatars                      |
| User Search                | yanzhao / team         | Search for other users                             |
| Friendship System          | yanzhao                | Send, accept, reject, and remove friendships       |
| Online Presence            | yshi                   | Real-time online user presence                     |
| Direct Communication       | yanzhao / yshi         | User-to-user communication                         |
| Group Communication        | yanzhao / team         | Group conversations                                |
| Workspace Management       | All                    | Create and manage organizations/workspaces         |
| Workspace Invitations      | All                    | Invite users and manage invitation status          |
| Workspace Roles            | yshi                   | OWNER, ADMIN, and MEMBER permissions               |
| Advanced Permissions       | yshi                   | Role-based workspace access control                |
| Workspace Channels         | All                    | Create and manage workspace communication channels |
| Notifications              | zhwu                   | Notification creation, retrieval, and lifecycle    |
| Notification Preferences   | zhwu                   | Configure notification delivery preferences        |
| Real-Time Notifications    | zhwu / yshi            | Deliver relevant events without page refresh       |
| Collaborative Documents    | zhwu                   | Workspace document creation and management         |
| Real-Time Collaboration    | zhwu                   | Real-time collaborative document functionality     |
| File Upload and Management | hanwang                | Upload and manage application files                |
| Message Attachments        | hanwang                | Attach files to messages                           |
| Internationalization       | zhwu                   | English, French, and Chinese interfaces            |
| Browser Compatibility      | All                    | Support for additional browsers                    |
| Custom Design System       | yshi                   | Reusable components and consistent visual language |
| HTTPS                      | Team                   | Secure development environment using Nginx/TLS     |

---

# Modules

The project includes the following modules selected from the 42 ft_transcendence subject.

Points are calculated according to the subject:

* **Major module = 2 points**
* **Minor module = 1 point**

## Web

| Module                                                                        | Type  | Points | Contributor(s) | Implementation                                                                  |
| ----------------------------------------------------------------------------- | ----- | -----: | -------------- | ------------------------------------------------------------------------------- |
| Use a framework for both the frontend and backend                             | Major |      2 | helin          | React is used for the frontend and NestJS for the backend                       |
| Implement real-time features using WebSockets or similar technology           | Major |      2 | yshi           | Socket.IO is used for real-time events and presence                             |
| Allow users to interact with other users                                      | Major |      2 | yanzhao        | User search, friendships, communication, and interaction features               |
| Use an ORM for the database                                                   | Minor |      1 | helin          | Prisma is used for PostgreSQL database access                                   |
| A complete notification system for all creation, update, and deletion actions | Minor |      1 | zhwu           | Notification models, services, preferences, and real-time notification delivery |
| Real-time collaborative features                                              | Minor |      1 | zhwu           | Collaborative workspace document functionality                                  |
| Custom-made design system with reusable components                            | Minor |      1 | yshi           | Custom reusable UI components and consistent design tokens                      |
| File upload and management system                                             | Minor |      1 | hanwang        | File upload, metadata management, and message attachments                       |

**Web subtotal: 11 points**

## Accessibility and Internationalization

| Module                          | Type  | Points | Contributor(s) | Implementation                                                                                                              |
| ------------------------------- | ----- | -----: | -------------- | --------------------------------------------------------------------------------------------------------------------------- |
| Support for multiple languages  | Minor |      1 | zhwu           | The application supports English, French, and Chinese using i18next/react-i18next.                                          |
| Support for additional browsers | Minor |      1 | All            | The application is developed and tested with multiple modern browsers to ensure consistent functionality and compatibility. |

**Accessibility & Internationalization subtotal: 2 points**

## User Management

| Module                                                                    | Type  | Points | Contributor(s) | Implementation                                                   |
| ------------------------------------------------------------------------- | ----- | -----: | -------------- | ---------------------------------------------------------------- |
| Standard user management and authentication                               | Major |      2 | yanzhao        | Registration, login, logout, sessions, and account management    |
| Advanced permissions system                                               | Major |      2 | yshi           | Workspace roles and role-based access control                    |
| An organization system                                                    | Major |      2 | All            | Workspaces, members, invitations, roles, channels, and documents |
| Implement remote authentication with OAuth 2.0                            | Minor |      1 | yanzhao        | Google OAuth 2.0 integration                                     |
| Implement a complete 2FA (Two-Factor Authentication) system for the users | Minor |      1 | yanzhao        | Two-factor authentication workflow and account security          |

**User Management subtotal: 8 points**

## Total

| Category                             | Points |
| ------------------------------------ | -----: |
| Web                                  |     11 |
| Accessibility & Internationalization |      2 |
| User Management                      |      8 |
| **Total**                            | **21** |

The module implementations were developed as part of the overall application and integrated across frontend, backend, database, and real-time services where required.

---

# Individual Contributions

## yshi — Product Owner

### Responsibilities

* Product planning and feature priorities
* Custom-made design system
* Advanced permissions system
* Real-time functionality
* Product-level technical and UX decisions

### Main Contributions

* Custom reusable UI components and design system
* Workspace permission and role-based access control
* Real-time presence and related real-time functionality
* Product coordination and feature prioritization

### Challenges

One of the main challenges was maintaining consistent permissions across workspace-related features while keeping the application easy to use.

The solution was to establish a common workspace role system based on:

```text
OWNER
ADMIN
MEMBER
```

and reuse the same permission mechanism across workspace operations.

---

## yanzhao — Project Manager

### Responsibilities

* Project coordination
* Task distribution
* Progress tracking
* User management and authentication
* User interaction
* OAuth 2.0
* Two-factor authentication

### Main Contributions

* Standard user authentication
* User interaction features
* Friendship functionality
* Google OAuth 2.0
* Two-factor authentication
* Project coordination and task organization

### Challenges

Authentication required coordination between frontend and backend, including authenticated sessions and protected API access.

The implementation separates authentication responsibilities between the frontend authentication state and backend authentication/authorization mechanisms.

---

## helin — Tech Lead

### Responsibilities

* Technical architecture
* Frontend/backend framework integration
* ORM and database architecture
* Technical decisions
* Code review and technical coordination
* HTTPS infrastructure

### Main Contributions

* React and NestJS application architecture
* Prisma ORM integration
* PostgreSQL database integration
* Shared frontend/backend development structure
* HTTPS configuration using Nginx and TLS
* Technical decisions and code review

---

## zhwu — Developer

### Responsibilities

* User profiles
* Notification system
* Real-time collaborative features
* Internationalization

### Main Contributions

* User profile functionality
* Profile information management
* Notification system
* Notification preferences
* Real-time notification-related functionality
* Collaborative document functionality
* Multilingual support
* English, French, and Chinese localization

### Challenges

Real-time collaboration requires changes made by one user to be propagated to other connected users without requiring a page refresh.

The project uses Socket.IO-based real-time communication together with document state management to synchronize collaborative activity.

Internationalization also requires keeping translated resources consistent across supported languages. Translation keys are maintained separately for English, French, and Chinese.

---

## hanwang — Developer

### Responsibilities

* File upload and management system
* File-related application integration
* General development and feature integration

### Main Contributions

* File upload functionality
* Attachment management
* Message attachments
* Integration of uploaded files into application features

### Challenges

Uploaded files require both file-system handling and database metadata.

The implementation separates the stored file from its database metadata, allowing the application to track information such as:

```text
fileName
fileUrl
fileType
fileSize
uploaderId
messageId
```

---

# Project Structure

The repository is organized as a pnpm monorepo:

```text
42_ft_transcendence/
├── apps/
│   ├── web/                 # React frontend
│   └── api/                 # NestJS backend
│
├── packages/
│   └── shared-types/        # Shared TypeScript/Zod types and schemas
│
├── docs/                    # Project and development documentation
├── infra/                   # Infrastructure configuration
├── scripts/                 # Development and validation scripts
│
├── compose.yaml             # Docker Compose configuration
├── Makefile                 # Common project commands
├── package.json             # Root workspace configuration
├── pnpm-workspace.yaml      # pnpm workspace definition
└── README.md
```

---

# Architecture Overview

The application follows a full-stack architecture:

```text
┌──────────────────────┐
│      Browser         │
│                      │
│ React + TypeScript   │
└──────────┬───────────┘
           │
      HTTP / WebSocket
      (Socket.IO)
           │
           ▼
┌──────────────────────┐
│      NestJS API      │
│                      │
│ Controllers/Services │
└──────────┬───────────┘
           │
        Prisma ORM
           │
           ▼
┌──────────────────────┐
│     PostgreSQL       │
└──────────────────────┘
```

For HTTPS deployments/development, Nginx is used as a reverse proxy:

```text
Browser
   │
 HTTPS
   ▼
 Nginx
   │
   ├── Frontend
   │
   └── NestJS API
```

Real-time communication is handled through Socket.IO alongside the HTTP API.

---

# Resources

## Documentation and References

The project was developed using official documentation and technical references, including:

* React documentation
* TypeScript documentation
* Vite documentation
* React Router documentation
* TanStack Query documentation
* NestJS documentation
* Prisma documentation
* PostgreSQL documentation
* Socket.IO documentation
* Zod documentation
* i18next documentation
* Docker documentation
* Docker Compose documentation
* Nginx documentation
* OAuth 2.0 / Google OAuth documentation

These resources were used to understand APIs, frameworks, configuration, database operations, authentication, real-time communication, and development best practices.

## AI Usage

AI tools were used as development assistants during the project.

AI assistance was mainly used for:

* Understanding unfamiliar technical concepts and APIs.
* Explaining React, TypeScript, NestJS, Prisma, WebSocket, and authentication concepts.
* Investigating and debugging frontend/backend integration issues.
* Reviewing database schemas and Prisma relationships.
* Helping diagnose TypeScript and dependency errors.
* Reviewing internationalization coverage and translation-key usage.
* Assisting with test design and debugging.
* Reviewing security-related implementation details.
* Improving technical documentation and README organization.
* Discussing implementation approaches before writing or modifying code.

AI was used as an assistant for research, explanation, debugging, and review. The team remained responsible for the final implementation, integration, testing, and code decisions.

---

# Evaluation Guide

For evaluation, the application can be started using the installation and development instructions above.

The main areas to explore are:

### Authentication

* Registration
* Login/logout
* Google OAuth
* Two-factor authentication

### User Interaction

* User search
* Friend requests
* Friendship management
* Direct and group communication
* Online presence

### Workspaces

* Workspace creation
* Workspace members
* Workspace invitations
* Workspace roles
* Permission checks
* Workspace channels

### Notifications

* Notification creation
* Notification display
* Read/unread state
* Notification preferences
* Real-time notification updates

### Collaboration

* Workspace documents
* Document editing
* Real-time collaborative functionality

### Files

* File upload
* File metadata
* Message attachments

### Internationalization

The interface supports:

* English
* French
* Chinese

### Design System

The application uses reusable UI components and shared design tokens to maintain visual consistency across pages.

---

# Development Documentation

Additional technical information, including detailed development commands, Prisma workflows, database operations, Docker usage, HTTPS configuration, and troubleshooting, is available in:

`docs/DEVELOPMENT.md`

---

# License

This project was created as part of the **42 curriculum**.

Unless otherwise specified by the project repository, the source code is intended for educational purposes within the context of the 42 curriculum.
