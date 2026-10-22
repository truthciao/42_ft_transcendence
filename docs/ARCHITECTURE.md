# Architecture Overview

The application follows a containerized full-stack architecture managed by Docker Compose.

Nginx acts as the reverse proxy and HTTPS entry point, routing requests to the React frontend and NestJS API. The API uses Prisma ORM to interact with PostgreSQL and stores uploaded files in persistent storage.

Real-time communication is handled by Socket.IO within the NestJS API. Database migrations and initial data seeding are handled by separate database tasks.

## System Architecture

```mermaid
flowchart TB
    Browser["Browser"]

    subgraph Compose["Docker Compose"]
        direction TB

        Nginx["Nginx<br/>Reverse Proxy · HTTPS"]

        subgraph App["Application Services"]
            direction LR
            Web["Web<br/>React · TypeScript · Vite"]
            API["API<br/>NestJS · REST · Socket.IO"]
        end

        subgraph Storage["Persistent Storage"]
            direction LR
            DB[("PostgreSQL")]
            Uploads[("Upload Volume")]
        end

        subgraph Init["Database Tasks"]
            direction LR
            Migrate["Migrate<br/>Prisma · Migrations"]
            Seed["Seed<br/>Initial Data"]
        end

        Nginx --> Web
        Nginx --> API
        API -->|"Prisma ORM"| DB
        API -->|"Uploaded files"| Uploads
        Migrate --> DB
        Seed --> DB
    end

    Browser -->|"HTTP :8080 / HTTPS :8443"| Nginx

    classDef proxy fill:#dbeafe,stroke:#1d4ed8,color:#1e3a8a,stroke-width:2px
    classDef service fill:#dcfce7,stroke:#15803d,color:#14532d,stroke-width:2px
    classDef storage fill:#fef3c7,stroke:#b45309,color:#78350f,stroke-width:2px

    class Nginx proxy
    class Web,API,Migrate,Seed service
    class DB,Uploads storage

    style Compose stroke:#475569,stroke-width:2px
    style App stroke:#64748b,stroke-width:2px
    style Storage stroke:#b45309,stroke-width:2px
    style Init stroke:#15803d,stroke-width:2px
```

## Main Components

- **Nginx** — Entry point for HTTP and HTTPS traffic; routes requests to the frontend and API.
- **Web** — React frontend built with TypeScript and Vite.
- **API** — NestJS backend providing REST endpoints and real-time communication through Socket.IO.
- **PostgreSQL** — Persistent relational database.
- **Prisma** — ORM used by the API and migration workflow.
- **Upload Volume** — Persistent storage for uploaded files.
- **Migrate** — Applies database schema migrations.
- **Seed** — Initializes the database with initial data when required.

## Networking

The application exposes HTTP on port `8080` and HTTPS on port `8443` through Nginx. Services communicate over the Docker Compose network.

Database access should remain internal to the Compose network unless external access is explicitly required.