# Modules & Evaluation

This document summarizes the modules implemented for the 42 ft_transcendence project, including their evaluation points, primary contributors, and implementation details.

According to the subject:
- **Major module:** 2 points
- **Minor module:** 1 point

## Web

| Module | Type | Points | Contributor(s) | Implementation |
|---|---|---:|---|---|
| Use a framework for both the frontend and backend | Major | 2 | helin | React frontend and NestJS backend |
| Implement real-time features using WebSockets or similar technology | Major | 2 | yshi | Socket.IO for real-time events and online presence |
| Allow users to interact with other users | Major | 2 | yanzhao | User search, friendships, and communication |
| Use an ORM for the database | Minor | 1 | helin | Prisma with PostgreSQL |
| A complete notification system for all creation, update, and deletion actions | Minor | 1 | zhwu | Notification lifecycle, preferences, and real-time delivery |
| Real-time collaborative features | Minor | 1 | zhwu | Real-time collaborative workspace documents |
| Custom-made design system with reusable components | Minor | 1 | yshi | Reusable UI components and design tokens |
| File upload and management system | Minor | 1 | hanwang | File uploads, metadata, and message attachments |

**Web subtotal: 11 points**

## Accessibility and Internationalization

| Module | Type | Points | Contributor(s) | Implementation |
|---|---|---:|---|---|
| Support for multiple languages | Minor | 1 | zhwu | English, French, and Chinese using i18next/react-i18next |
| Support for additional browsers | Minor | 1 | All | Compatibility testing across modern browsers |

**Accessibility & Internationalization subtotal: 2 points**

## User Management

| Module | Type | Points | Contributor(s) | Implementation |
|---|---|---:|---|---|
| Standard user management and authentication | Major | 2 | yanzhao | Registration, login, logout, sessions, and account management |
| Advanced permissions system | Major | 2 | yshi | Workspace roles and role-based access control |
| An organization system | Major | 2 | All | Workspaces, members, invitations, roles, channels, and documents |
| Implement remote authentication with OAuth 2.0 | Minor | 1 | yanzhao | Google OAuth 2.0 |
| Implement a complete 2FA (Two-Factor Authentication) system for the users | Minor | 1 | yanzhao | Two-factor authentication workflow |

**User Management subtotal: 8 points**

## Total

| Category | Points |
|---|---:|
| Web | 11 |
| Accessibility & Internationalization | 2 |
| User Management | 8 |
| **Total** | **21** |