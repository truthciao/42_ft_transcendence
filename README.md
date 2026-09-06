*This project has been created as part of the 42 curriculum by yshi, yanzhao, helin, zhwu, hanwang.*

# ft_transcendence

A full-stack web application developed for the 42 School **ft_transcendence** project.

## Overview

ft_transcendence is a collaborative web application providing real-time communication, user profiles, friendships, notifications, workspaces, and internationalization.

The application is built as a monorepo containing a React frontend and a NestJS backend.

---

# Team Information

The project was developed by a five-member team. Each member was assigned a specific role while also contributing to the implementation of the project.

## yshi — Product Owner (PO)

**Responsibilities:**

* Define and prioritize product requirements.
* Coordinate the overall product direction.
* Help define the user experience and feature priorities.
* Contribute to the custom design system and reusable UI components.
* Implement advanced permissions.
* Contribute to real-time functionality.
* Coordinate the team's product-level decisions.

## yanzhao — Project Manager (PM)

**Responsibilities:**

* Coordinate the team's development activities.
* Organize and distribute project tasks.
* Track project progress and deadlines.
* Contribute to user management and authentication.
* Implement user interaction features.
* Implement OAuth 2.0 remote authentication.
* Implement two-factor authentication (2FA).

## helin — Tech Lead

**Responsibilities:**

* Define and maintain the technical architecture.
* Make technical decisions and help ensure consistency across the codebase.
* Contribute to frontend and backend framework integration.
* Implement the ORM-based database layer.
* Review technical implementation and help resolve technical issues.

## zhwu — Developer

**Responsibilities:**

* Implement the notification system.
* Implement real-time collaborative features.
* Implement multilingual support and internationalization.
* Contribute to accessibility and browser compatibility.
* Contribute to frontend and backend development as required.

## hanwang — Developer

**Responsibilities:**

* Implement the file upload and management system.
* Contribute to application development and integration.
* Contribute to accessibility and browser compatibility.

---

## Project Management

The project is managed collaboratively using GitHub and Notion, with Discord as the main communication channel.

### Task Management

* **GitHub Issues** are used to create, track, and discuss development tasks, bugs, and feature requests.
* **Notion** is used for project organization, planning, documentation, and keeping track of project-related information.

### Communication

* **Discord** is the main communication channel for day-to-day discussions, coordination, technical questions, and team communication.
* **Weekly meetings** are held to review progress, discuss ongoing work, identify blockers, and coordinate upcoming tasks.

### Development Workflow

The team follows a feature-based Git workflow:

1. Tasks and features are tracked through **GitHub Issues**.
2. Developers create dedicated **feature branches** for their work.
3. Changes are committed to the corresponding branch.
4. A **Pull Request** is opened when the work is ready for review.
5. Team members perform **code reviews** before changes are merged.
6. Weekly meetings and Discord discussions are used to coordinate work and resolve blockers.

This workflow helps keep responsibilities clear, provides a history of development decisions, and ensures that changes are reviewed before being integrated into the main codebase.


---

# Tech Stack

| Layer                | Technology                    |
| -------------------- | ----------------------------- |
| Frontend             | React, TypeScript, Vite       |
| Backend              | NestJS                        |
| ORM                  | Prisma                        |
| Database             | PostgreSQL                    |
| Realtime             | Socket.IO                     |
| Validation           | Zod / nestjs-zod              |
| Internationalization | i18next / react-i18next       |
| Infrastructure       | Docker, Docker Compose, Nginx |
| Package Manager      | pnpm                          |
| Monorepo             | pnpm Workspace                |

---

## Database Schema

The project uses **PostgreSQL** with **Prisma ORM**. The database is designed around users, profiles, workspaces, conversations, friendships, notifications, file attachments, and collaborative documents.

### Main Entities

| Entity                   | Purpose                                                                 | Key Fields                                                                                |
| ------------------------ | ----------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| `User`                   | Stores account and authentication information                           | `id`, `email`, `username`, `passwordHash`, `isTwoFactorEnabled`, `createdAt`, `updatedAt` |
| `Profile`                | Stores user profile information                                         | `id`, `userId`, `displayName`, `bio`, `avatarUrl`, `preferredLanguage`                    |
| `OAuthAccount`           | Links users to external OAuth providers                                 | `id`, `userId`, `provider`, `providerId`                                                  |
| `Workspace`              | Represents an organization/workspace                                    | `id`, `name`, `slug`, `description`, `ownerId`                                            |
| `WorkspaceMember`        | Associates users with workspaces and stores their roles                 | `id`, `workspaceId`, `userId`, `role`, `joinedAt`                                         |
| `WorkspaceInvite`        | Manages invitations to workspaces                                       | `id`, `workspaceId`, `inviterId`, `inviteeId`, `role`, `status`, `token`, `expiresAt`     |
| `Conversation`           | Represents direct messages, group conversations, and workspace channels | `id`, `type`, `name`, `workspaceId`, `createdById`                                        |
| `ConversationMember`     | Associates users with conversations                                     | `id`, `conversationId`, `userId`, `joinedAt`, `lastReadMessageId`                         |
| `Message`                | Stores messages sent in conversations                                   | `id`, `conversationId`, `senderId`, `content`, `createdAt`                                |
| `Friendship`             | Represents friendship requests and relationships                        | `id`, `requesterId`, `addresseeId`, `status`, `createdAt`, `updatedAt`                    |
| `Notification`           | Stores user and workspace-related notifications                         | `id`, `recipientId`, `actorId`, `type`, `read`, `createdAt`                               |
| `NotificationPreference` | Stores per-user notification delivery preferences                       | `id`, `userId`, `type`, `viaInApp`, `viaEmail`                                            |
| `Attachment`             | Stores uploaded file metadata                                           | `id`, `uploaderId`, `messageId`, `fileName`, `fileUrl`, `fileType`, `fileSize`            |
| `Document`               | Stores collaborative workspace documents and their Yjs state            | `id`, `title`, `content`, `yjsState`, `workspaceId`, `creatorId`                          |

### Main Relationships

* A `User` can have one optional `Profile`.
* A `User` can have multiple `OAuthAccount` records.
* A `User` can own multiple `Workspace` records.
* `WorkspaceMember` creates a many-to-many relationship between `User` and `Workspace` and stores the user's `WorkspaceRole`.
* `WorkspaceInvite` connects a workspace with an inviter and an optional invitee.
* A `Workspace` can contain multiple `Conversation` channels and `Document` records.
* `ConversationMember` creates a many-to-many relationship between `User` and `Conversation`.
* A `Conversation` contains multiple `Message` records.
* Each `Message` belongs to a `User` as its sender and can contain multiple `Attachment` records.
* `Friendship` connects two `User` records through requester/addressee relationships.
* `Notification` belongs to a recipient and can optionally reference an actor, friendship, or workspace.
* `NotificationPreference` stores notification settings for each user and notification type.
* `Attachment` belongs to an uploading user and can optionally be associated with a message.
* A `Document` belongs to a `Workspace` and has a creator represented by a `User`.

### Important Enums

The schema also defines enums for controlled values:

* `PreferredLanguage`: `en`, `fr`, `zh`
* `WorkspaceRole`: `OWNER`, `ADMIN`, `MEMBER`
* `WorkspaceInviteStatus`: `PENDING`, `ACCEPTED`, `REJECTED`, `REVOKED`
* `ConversationType`: `DIRECT`, `GROUP`, `CHANNEL`
* `FriendshipStatus`: `PENDING`, `ACCEPTED`, `BLOCKED`
* `NotificationType`: friendship and workspace notification events

### Database Design

Primary keys are mainly auto-incrementing integers. `Attachment.id` and invitation tokens use UUID/string-based identifiers where appropriate.

The schema uses foreign keys, unique constraints, indexes, and cascading rules to maintain data integrity and support common queries. For example:

* `Profile.userId` is unique, enforcing a one-to-one relationship with `User`.
* `WorkspaceMember` has a unique constraint on `(workspaceId, userId)` to prevent duplicate memberships.
* `ConversationMember` has a unique constraint on `(conversationId, userId)`.
* `NotificationPreference` has a unique constraint on `(userId, type)`.
* `OAuthAccount` has a unique constraint on `(provider, providerId)`.
* Frequently queried fields such as workspace membership, friendship status, and notification state are indexed.

### Entity Relationship Overview

```text
User
├── Profile
├── OAuthAccount
├── Workspace ──< WorkspaceMember >── User
├── WorkspaceInvite
├── Conversation ──< ConversationMember >── User
│                  └── Message ──< Attachment
├── Friendship ── User
├── Notification
├── NotificationPreference
├── Attachment
└── Document ── Workspace
```

For the final submission, an ER diagram can also be included under `docs/` to provide a visual representation of these relationships.

---

# Features List

The following table summarizes the main implemented features and their contributors.

| Feature                    | Description                                                                                       | Contributor(s) |
| -------------------------- | ------------------------------------------------------------------------------------------------- | -------------- |
| User Registration          | Allows users to create an account.                                                                | yanzhao        |
| User Authentication        | Provides login and logout functionality.                                                          | yanzhao        |
| Google OAuth               | Allows authentication through Google OAuth 2.0.                                                   | yanzhao        |
| Two-Factor Authentication  | Provides an additional authentication step for user accounts.                                     | yanzhao        |
| User Profiles              | Allows users to manage profile information and avatars.                                           | yshi           |
| Friend System              | Allows users to search for and interact with other users through friend requests and friendships. | yanzhao        |
| Real-time Presence         | Displays users' online/offline status.                                                            | yshi           |
| Real-time Communication    | Enables real-time communication between users.                                                    | yshi, yanzhao  |
| Notifications              | Provides notifications for relevant application events.                                           | zhwu           |
| Notification Preferences   | Allows users to configure notification behavior.                                                  | zhwu           |
| Workspaces / Organizations | Provides shared organizational and collaborative spaces.                                          | All            |
| Permissions                | Controls access to resources according to user permissions.                                       | yshi           |
| File Uploads               | Allows users to upload and manage files.                                                          | hanwang        |
| Internationalization       | Provides English, French, and Chinese translations.                                               | zhwu           |
| Design System              | Provides reusable UI components and consistent styling.                                           | yshi           |
| Browser Compatibility      | Supports additional browsers and ensures cross-browser compatibility.                             | All            |
| HTTPS                      | Serves the application through HTTPS using Nginx.                                                 | All            |
| Accessibility              | Provides accessible interactions, keyboard navigation, and assistive-technology support.          | All            |

---

# Modules

The following modules were selected for the project. Major modules are worth 2 points and Minor modules are worth 1 point.

## Web

| Module                                                                  | Type  | Points | Contributor(s) |
| ----------------------------------------------------------------------- | ----- | -----: | -------------- |
| Use a framework for both the frontend and backend                       | Major |      2 | helin          |
| Implement real-time features using WebSockets or similar technology     | Major |      2 | yshi           |
| Allow users to interact with other users                                | Major |      2 | yanzhao        |
| Use an ORM for the database                                             | Minor |      1 | helin          |
| Complete notification system for creation, update, and deletion actions | Minor |      1 | zhwu           |
| Real-time collaborative features                                        | Minor |      1 | zhwu           |
| Custom-made design system with reusable components                      | Minor |      1 | yshi           |
| File upload and management system                                       | Minor |      1 | hanwang        |

**Web subtotal: 11 points**

### Framework for Frontend and Backend — Major

The project uses React with TypeScript for the frontend and NestJS for the backend. The frontend is built with Vite, while the backend follows NestJS's modular architecture.

**Contributor:** helin

### Real-time Features — Major

Real-time communication is implemented using Socket.IO/WebSockets. This is used for features such as real-time presence, notifications, and communication between users.

**Contributor:** yshi

### User Interaction — Major

Users can interact with each other through features such as friendships, friend requests, messaging, and other user-to-user interactions.

**Contributor:** yanzhao

### ORM — Minor

Prisma ORM is used to communicate with the PostgreSQL database. It provides type-safe database access and migration management.

**Contributor:** helin

### Notification System — Minor

The application provides a notification system for relevant creation, update, and deletion events. Notifications can be delivered and displayed to users through the application's notification interface.

**Contributor:** zhwu

### Real-time Collaborative Features — Minor

Real-time functionality is used to support collaborative interactions between users, allowing changes and events to be communicated without requiring a manual page refresh.

**Contributor:** zhwu

### Custom Design System — Minor

A custom design system provides reusable UI components and shared styling patterns. Components are designed to maintain visual consistency and reduce duplication across the application.

**Contributor:** yshi

### File Upload and Management — Minor

The application provides file upload and management functionality, including storing file metadata and making uploaded files available to the relevant application features.

**Contributor:** hanwang

---

## Accessibility and Internationalization

| Module                          | Type  | Points | Contributor(s) |
| ------------------------------- | ----- | -----: | -------------- |
| Support for multiple languages  | Minor |      1 | zhwu           |
| Support for additional browsers | Minor |      1 | All            |

**Accessibility and Internationalization subtotal: 2 points**

### Multiple Languages — Minor

The application supports multiple languages through an internationalization system. The currently supported languages are English, French, and Chinese.

**Contributor:** zhwu

### Additional Browser Support — Minor

The team tested and adapted the application to support additional browsers beyond the primary development environment.

**Contributors:** All team members

---

## User Management

| Module                                      | Type  | Points | Contributor(s) |
| ------------------------------------------- | ----- | -----: | -------------- |
| Standard user management and authentication | Major |      2 | yanzhao        |
| Advanced permissions system                 | Major |      2 | yshi           |
| Organization system                         | Major |      2 | All            |
| Remote authentication with OAuth 2.0        | Minor |      1 | yanzhao        |
| Complete 2FA system                         | Minor |      1 | yanzhao        |

**User Management subtotal: 8 points**

### Standard User Management and Authentication — Major

The application provides standard user management and authentication functionality, including account registration, login, logout, and profile-related user management.

**Contributor:** yanzhao

### Advanced Permissions System — Major

An advanced permissions system controls access to application resources and functionality according to user roles and permissions.

**Contributor:** yshi

### Organization System — Major

The application provides an organization/workspace structure allowing users to belong to and interact within shared collaborative spaces.

**Contributors:** All team members

### OAuth 2.0 Remote Authentication — Minor

Google OAuth 2.0 is implemented to allow users to authenticate using their Google account.

**Contributor:** yanzhao

### Two-Factor Authentication — Minor

The application provides a two-factor authentication mechanism to add an additional authentication step and improve account security.

**Contributor:** yanzhao

---

## Module Point Summary

| Category                             | Major Points | Minor Points |  Total |
| ------------------------------------ | -----------: | -----------: | -----: |
| Web                                  |            6 |            5 |     11 |
| Accessibility & Internationalization |            0 |            2 |      2 |
| User Management                      |            6 |            2 |      8 |
| **Total**                            |       **12** |        **9** | **21** |

---

# Requirements

Before running the project, make sure the following are installed:

* Git
* Docker
* Docker Compose

Node.js and pnpm are only required when running the project directly on the host machine.

Verify Docker:

```bash
docker --version
docker compose version
```

---

# Quick Start

## 1. Clone the repository

```bash
git clone <repository-url>
cd transcendence
```

## 2. Configure environment variables

Create:

```text
apps/api/.env
```

At minimum, configure the database connection:

```env
DATABASE_URL="postgresql://transcendence:transcendence@postgres:5432/transcendence?schema=public"
```

### Google OAuth

Google OAuth is required to test Google login.

Add the following variables:

```env
GOOGLE_CLIENT_ID=<your-client-id>
GOOGLE_CLIENT_SECRET=<your-client-secret>
GOOGLE_CALLBACK_URL=https://localhost:8443/api/auth/google/callback
```

The Google OAuth application must have the following Authorized Redirect URI:

```text
https://localhost:8443/api/auth/google/callback
```

Do not commit `.env` files or private credentials.

### Email Configuration

Email functionality is optional.

If email configuration is not provided, email notifications will be skipped and the rest of the application will continue to work normally.

To enable email functionality, add the following variables to:

```text
apps/api/.env
```

```env
# Email Configuration
MAIL_HOST="smtp.gmail.com"
MAIL_PORT="587"
MAIL_SECURE="false"
MAIL_USER="your-email@gmail.com"
MAIL_PASS="your-app-password"
MAIL_FROM="noreply@yourdomain.com"
```

### Configuration

| Variable      | Description                                    |
| ------------- | ---------------------------------------------- |
| `MAIL_HOST`   | SMTP server hostname                           |
| `MAIL_PORT`   | SMTP server port                               |
| `MAIL_SECURE` | Whether to use a secure SMTP connection        |
| `MAIL_USER`   | SMTP account username                          |
| `MAIL_PASS`   | SMTP password or application-specific password |
| `MAIL_FROM`   | Sender address used for outgoing emails        |

For Gmail, `MAIL_PASS` should normally be an **App Password** rather than your regular Google account password.

If these variables are not configured, the application will skip email delivery instead of failing.

Do not commit `.env` files or email credentials to the repository.

## 3. Start the application

```bash
make start
```

The Makefile starts the complete Docker environment.

Alternatively:

```bash
docker compose up --build
```

## 4. Open the application

Open:

```text
https://localhost:8443
```

The application is served through Nginx over HTTPS.

HTTP requests on port `8080` are redirected to HTTPS.

> The development certificate is self-signed. Your browser may display a certificate warning when accessing the application locally.

---

# Project Structure

```text
transcendence/
├── apps/
│   ├── api/                 # NestJS backend
│   └── web/                 # React frontend
├── packages/                # Shared packages and types
├── docs/                    # Project documentation
├── infra/                   # Infrastructure configuration
├── scripts/                 # Development and CI scripts
├── compose.yaml             # Docker Compose configuration
├── Makefile                 # Common development commands
└── pnpm-workspace.yaml      # pnpm workspace configuration
```

---

# Useful Commands

Start the complete application:

```bash
make start
```

Stop the application:

```bash
make stop
```

Restart the application:

```bash
make restart
```

View running containers:

```bash
docker compose ps
```

View logs:

```bash
docker compose logs -f
```

---

# Troubleshooting

### Check the application containers

```bash
docker compose ps
```

### View backend logs

```bash
docker compose logs -f api
```

### View frontend logs

```bash
docker compose logs -f web
```

### View database logs

```bash
docker compose logs -f postgres
```

### Restart the complete environment

```bash
make restart
```

### Reset the development database

```bash
make db-reset
```

> Resetting the database removes local development data.

---

# Developer Documentation

For development setup, testing, Prisma migrations, database access, Docker development, HTTPS configuration, i18n, and other internal documentation, see:

```text
docs/DEVELOPMENT.md
```

---

# License

42 School Project

