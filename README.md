*This project has been created as part of the 42 curriculum by yshi, yanzhao, helin, zhwu, hanwang.*

# ft_transcendence

## Description

ft_transcendence is a full-stack web application designed for real-time communication and collaboration. It allows users to connect with others, manage workspaces, exchange messages and files, and collaborate on documents in a shared environment.

The application combines user authentication, workspace management, real-time communication, and collaborative features in a single platform.

### Features
* Authentication and Security: User registration and login, Google OAuth 2.0, and two-factor authentication.
* User Management: Profiles, avatars, user search, and friendship requests.
* Communication: Direct messages, group conversations, workspace channels, and online presence.
* Workspace Management: Workspaces, member invitations, and role-based permissions.
* Real-Time Notifications: Notifications and configurable notification preferences.
* File Management: File uploads and message attachments.
* Collaborative Documents: Document creation, editing, and real-time collaboration.
* Internationalization: English, French, and Chinese interfaces.


---

# Instructions

## Prerequisites

For the recommended container setup, you need:

* A container engine: Docker Engine or Podman
* A Compose tool: Docker Compose or a compatible alternative, such as podman compose
* GNU Make
* OpenSSL

Note: The exact setup may vary depending on the container engine and Compose implementation. Ensure that the commands and features used by the project are supported by your environment.

Verify the tools for your chosen container setup:

**Option 1: Docker**

```bash
docker --version
docker compose version
make --version
openssl version
```

**Option 2: Podman**

```bash
podman --version
podman compose --version
make --version
openssl version
```

**Note:** Depending on your Podman setup, you may use Docker Compose with Podman's Docker-compatible API instead of `podman compose`. Ensure that your Compose implementation supports the features used by this project.


## Installation

Clone the repository:

```bash
git clone https://github.com/truthciao/42_ft_transcendence.git
cd 42_ft_transcendence
```

## Environment Configuration

Create your local environment configuration from the example provided by the project:

```bash
cp apps/api/.env.example apps/api/.env
```

Configure the required variables in apps/api/.env before starting the application. Replace the placeholder values with your own credentials and settings, including Google OAuth credentials, database passwords, and the JWT secret.

For details, see the
[Environment Configuration Guide](docs/environment-configuration.md).

The .env file and generated secret files are local configuration files and must not be committed to version control.

Once the configuration is complete, start the application:

```bash
make start
```

The Makefile automatically generates the required Docker Compose secret files before starting the services.



## HTTPS

HTTPS is used to reproduce a production-like secure connection and to support browser features that require a secure context.

For more detailed development commands and troubleshooting information, see:

[DEVELOPMENT.md](docs/DEVELOPMENT.md)

---

# Team Information

## Team

The project was developed collaboratively by a five-person team.

| Member | Role | Main Responsibilities |
|---|---|---|
| **yshi** | Product Owner | Product planning, design system, permissions, real-time features |
| **yanzhao** | Project Manager | Project coordination, task tracking, user management, OAuth 2.0, 2FA |
| **helin** | Tech Lead | Technical architecture, database integration, technical decisions, code review |
| **zhwu** | Developer | Notifications, real-time collaboration, internationalization |
| **hanwang** | Developer | File uploads, file management, application integration |

Responsibilities indicate primary ownership; development, integration, testing, and review were collaborative efforts.


---
## Project Management

The team uses **GitHub Issues** for task tracking, **Notion** for project planning and knowledge sharing, and **Discord** for daily communication.

- **Task Tracking & Planning:** Notion Kanban boards track tasks through to-do, in-progress, and completed states. Notion is also used to plan task assignments and distribute responsibilities across the team.
- **Documentation:** Notion centralizes meeting notes, database schema documentation, backend API conventions, architecture diagrams, and user journey flows.
- **Development Workflow:** Development follows a feature-based Git workflow with dedicated branches, Pull Requests, and code reviews before merging into the main branch. Weekly meetings help review progress, identify blockers, and coordinate upcoming work.
- **GitHub–Discord Integration:** A Discord bot sends automatic notifications when Pull Requests are opened or changes are merged on GitHub, keeping the team informed of code review and integration activity.

---
## Technical Stack

### Stack Overview

| Layer | Technologies | Purpose |
|---|---|---|
| **Frontend** | React, TypeScript, Vite, React Router | User interface, routing, and build tooling |
| **Frontend Data & UI** | TanStack Query, Tailwind CSS, shadcn/ui, Base UI, Sonner | Server-state management, styling, reusable components, and notifications |
| **Internationalization** | i18next, react-i18next | Multilingual user interface |
| **Backend** | NestJS, TypeScript | Modular backend and REST API |
| **Validation** | Zod, nestjs-zod | Runtime validation and NestJS DTO integration |
| **Database** | PostgreSQL, Prisma | Relational data storage, type-safe database access, and migrations |
| **Authentication** | JWT, Google OAuth 2.0, TOTP-based 2FA | Authentication and account security |
| **Real-Time Communication** | Socket.IO | Real-time messaging, presence, and collaborative events |
| **Infrastructure** | Docker, Docker Compose, Nginx | Containerization, service orchestration, reverse proxy, and HTTPS |
| **Version Control** | Git, GitHub | Source control, issue tracking, and code review |

### Why These Technologies?

- **React and TypeScript:** React provides reusable UI components to facilitate and standardize the development process. When it comes to TypeScript, the frontend and backend (NestJS) can share data types, allowing errors to be detected immediately at compile-time. 
  
- **NestJS:** NestJS helps us organize our backend business logic in a structured manner by breaking code into dedicated modules, such as auth, chat, and files. It strictly separates controllers from services, ensuring that each file is in charge of a specific responsibility within the backend.

- **PostgreSQL and Prisma:** Our real-time workspace includes friend networks, multiple chat rooms, workspace permission management, and complex interactions among several entities. To maintain data consistency and relational integrity, we chose PostgreSQL as our relational database. We adopted Prisma as our ORM to manage database migrations, which automatically establishes our database schema without having to write SQL manually. On the other hand, it generates TypeScript code so the backend can directly use type-safe methods to manipulate the database efficiently.

- **Socket.IO:** Socket.io enables two-way communication over WebSockets between the frontend and backend. It allows users to receive live updates on the page instantly without refreshing, greatly improving the user experience.

- **Docker Compose and Nginx:** Docker Compose solves the "it works on my machine" problem by packaging services into consistent, reproducible containers. Meanwhile, Nginx serves as the single reverse proxy and HTTPS entry point, ensuring internal services are never directly exposed to the public network, thereby minimizing the attack surface.

The application also uses Docker Compose secrets to provide sensitive configuration to services without hardcoding credentials in the Compose configuration.



---
# Database Design

The application uses **PostgreSQL** and **Prisma ORM** to manage relational data across four main modules:

- **User & Identity** — user profiles, OAuth accounts, and friendships.
- **Workspace & Documents** — workspaces, memberships, invitations, and documents.
- **Messaging** — conversations, members, messages, and attachments.
- **Notifications** — user notifications and notification preferences.

The schema uses foreign keys, unique constraints, and indexes to maintain data integrity and support efficient queries.

<p align="center">
  <img src="./docs/database-panorama.png" width="950" alt="Database Schema Overview">
</p>

For detailed entity relationships, foreign key constraints, and indexes, see the [Database Documentation](./docs/DATABASE.md).

---

# Features List

The following table summarizes the main implemented features and their primary contributors.

| Feature | Contributor(s) | Description |
|---|---|---|
| User Registration & Authentication | yanzhao | Account creation, login, logout, and authenticated sessions |
| Google OAuth 2.0 | yanzhao | Remote authentication through Google |
| Two-Factor Authentication | yanzhao | Additional authentication security |
| User Profiles & Avatar Upload | zhwu | Profile information and avatar management |
| User Search | yanzhao / team | Search for other users |
| Friendship System | zhwu | Send, accept, reject, and remove friendships |
| Online Presence | yshi | Real-time online user presence |
| Direct Communication | yanzhao / yshi | User-to-user communication |
| Group Communication | yanzhao / team | Group conversations |
| Workspace Management | All | Workspaces, invitations, and member management |
| Workspace Roles & Permissions | yshi | Workspace roles and role-based access control |
| Workspace Channels | All | Create and manage workspace communication channels |
| Notification System | zhwu / yshi / yanzhao | Notification lifecycle, preferences, and real-time delivery |
| Collaborative Documents | zhwu | Document management and real-time collaboration |
| File Upload & Management | hanwang | File uploads, storage management, and message attachments |
| Internationalization | zhwu | English, French, and Chinese interfaces |
| Browser Compatibility | All | Support for additional browsers |
| Custom Design System | yshi | Reusable components and consistent visual language |
| HTTPS | helin | Secure development environment using Nginx/TLS |

---
# 42 Curriculum Modules

The project implements modules from the 42 ft_transcendence subject across web development, user management, and internationalization.

See [Modules & Evaluation](./docs/MODULE.md) for the complete module list, contributors, implementation details, and point breakdown.

---
# Individual Contributions

The following table summarizes each team member's main responsibilities and contributions.

| Contributor | Role | Main Responsibilities |
|---|---|---|
| yshi | Product Owner | Product planning, design system, workspace permissions, and real-time functionality |
| yanzhao | Project Manager | Project coordination, user authentication, user interaction, OAuth 2.0, and 2FA |
| helin | Tech Lead | Technical architecture, React/NestJS integration, Prisma, PostgreSQL, and HTTPS |
| zhwu | Developer | User profiles, notifications, collaborative documents, and internationalization |
| hanwang | Developer | File uploads, attachment management, and file-related integration |

### yshi — Product Owner

**Main Contributions**
- Designed reusable UI components and a custom design system.
- Implemented workspace roles and role-based access control.
- Developed real-time presence functionality.
- Coordinated product priorities and feature planning.

**Technical Challenge**

Maintaining consistent permissions across workspace features while keeping the application easy to use.

**Solution**

Established a shared workspace role system (`OWNER`, `ADMIN`, `MEMBER`) and reused the permission mechanism across workspace operations.

### yanzhao — Project Manager

**Main Contributions**
- Implemented user authentication, Google OAuth 2.0, and 2FA.
- Developed direct messaging business logic using the existing Socket.IO gateway. 
- Designed and refactored frontend UI components and React hooks for real-time messaging.
- Coordinated project tasks and tracked progress.

### helin — Tech Lead

**Main Contributions**
- Integrated React and NestJS into the application architecture.
- Integrated Prisma ORM with PostgreSQL.
- Established the shared frontend/backend development structure.
- Configured HTTPS using Nginx and TLS.
- Contributed to technical decisions and code reviews.

### zhwu — Developer

**Main Contributions**
- Developed user profile functionality and profile information management.
- Implemented notifications and notification preferences.
- Developed collaborative document functionality.
- Added English, French, and Chinese localization.

**Technical Challenges**
- Synchronizing collaborative document activity between connected users without page refreshes.
- Keeping translation resources consistent across supported languages.

**Solutions**
- Used Socket.IO-based communication together with document state management to synchronize collaborative activity.
- Maintained separate translation resources for English, French, and Chinese.

### hanwang — Developer

**Main Contributions**
- Implemented file upload functionality and attachment management.
- Integrated message attachments into application features.
- Managed the integration of uploaded files with the application.

**Technical Challenge**

Managing uploaded files alongside their database metadata.

**Solution**

Separated file storage from database metadata, allowing the application to track file information such as name, URL, type, size, uploader, and associated message.

---

## Project Structure

The repository is organized as a pnpm monorepo, separating the frontend, backend, shared types, and infrastructure configuration.

```text
42_ft_transcendence/
├── apps/
│   ├── web/                 # React frontend
│   └── api/                 # NestJS backend
│
├── packages/
│   └── shared-types/        # Shared TypeScript types and Zod schemas
│
├── docs/                    # Project and development documentation
├── infra/                   # Infrastructure and secrets configuration
├── scripts/                 # Development and validation scripts
├── docker/                  # Container-related scripts and configuration
│
├── compose.yaml             # Container orchestration
├── Makefile                 # Common project commands
├── package.json             # Root workspace configuration
├── pnpm-workspace.yaml      # pnpm workspace definition
└── README.md
```

---
## Architecture
The application follows a containerized full-stack architecture managed by Docker Compose. Nginx serves as the reverse proxy, connecting the React frontend and NestJS API to PostgreSQL and persistent file storage.
For a detailed overview of the system architecture, service responsibilities, and networking, see the [Architecture Documentation](/docs/ARCHITECTURE.md).



# Resources

## Documentation and References

The project was developed using official documentation and technical references, including:

* [Quick Start of React](https://react.dev/learn)
* [Using typescript in React](https://react.dev/learn/typescript)
* [Vite documentation](https://vite.dev/guide/)
* [React Router](https://www.w3schools.com/react/react_router.asp)
* [TanStack Query](https://tanstack.com/query/latest)
* [Overview of NestJS framework](https://docs.nestjs.com/)
* [Deploying database changes with Prisma Migrate](https://www.prisma.io/docs/orm/v7/prisma-client/deployment/deploy-database-changes-with-prisma-migrate)
* [Implement Prisma service inside Docker](https://www.prisma.io/docs/guides/deployment/docker)
* [PostgreSQL documentation](https://www.postgresql.org/docs/)
* [Getting started of Socket.IO](https://socket.io/docs/v4/tutorial/introduction)
* [Zod documentation](https://zod.dev/basics)
* [Getting started of i18next documentation](https://www.i18next.com/overview/getting-started)
* [Docker secret setup](https://docs.docker.com/reference/cli/docker/secret/)
* [Docker Compose Quickstart](https://docs.docker.com/compose/gettingstarted/#step-4-enable-compose-watch-for-live-updates)
* [Beginner's Guide of Nginx](https://nginx.org/en/docs/beginners_guide.html)
* [Google OAuth documentation](https://developers.google.com/identity/protocols/oauth2)

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

# Development Documentation

Additional technical information, including detailed development commands, Prisma workflows, database operations, Docker usage, HTTPS configuration, and troubleshooting, is available in:

[DEVELOPMENT.md](docs/DEVELOPMENT.md)

---

# License

This project was created as part of the **42 curriculum**.

Unless otherwise specified by the project repository, the source code is intended for educational purposes within the context of the 42 curriculum.
