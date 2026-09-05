# ft_transcendence

A full-stack web application developed for the 42 School **ft_transcendence** project.

## Overview

ft_transcendence is a collaborative web application providing real-time communication, user profiles, friendships, notifications, workspaces, and internationalization.

The application is built as a monorepo containing a React frontend and a NestJS backend.

---

# Features

The application currently provides:

* User registration and authentication
* Google OAuth authentication
* User profiles
* Avatar upload
* Friend requests and friend management
* Real-time online/offline presence
* Real-time chat
* File attachments in chat
* Notifications
* Notification preferences
* Workspaces and collaborative spaces
* Internationalization

  * English
  * French
  * Chinese
* Responsive user interface
* HTTPS through Nginx

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

# Email Configuration

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

# Evaluation Guide

The following workflow can be used to explore the main features of the application.

## 1. Authentication

Test:

* User registration
* User login
* User logout
* Google OAuth login

After logging in, the application should display the authenticated user's interface.

---

## 2. Profile

Open the profile/settings area and test:

* Display name
* Bio
* Avatar
* Preferred language

Changes to the profile should be reflected in the user interface without requiring a full page reload.

---

## 3. Friends

Test the friend system:

* Search for another user
* Send a friend request
* Receive a friend request
* Accept a friend request
* Reject a friend request
* View the friend list
* Check online/offline presence

Friend-related events are handled in real time where applicable.

---

## 4. Chat

Use the chat interface to test:

* Conversations
* Sending messages
* Receiving messages in real time
* File attachments
* Message updates

Open the application in multiple browser sessions if you want to verify real-time communication between users.

---

## 5. Notifications

Test:

* Receiving notifications
* Viewing notifications
* Notification preferences

Notification-related events are delivered in real time where applicable.

---

## 6. Workspaces

Test the workspace functionality:

* Create a workspace
* Invite another user
* Accept an invitation
* Access the workspace
* Work with the available collaborative spaces

---

## 7. Internationalization

Use the language selector to switch between:

* English
* French
* Chinese

The interface should update according to the selected language.

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

