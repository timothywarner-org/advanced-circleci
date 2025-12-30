# Globomantics Robot Fleet API - Architecture Diagram

## Complete API Architecture

```mermaid
flowchart TB
    subgraph CLIENT["CLIENT LAYER"]
        direction LR
        C1[("Web Browser")]
        C2[("API Client")]
        C3[("Mobile App")]
    end

    subgraph MIDDLEWARE["MIDDLEWARE STACK"]
        direction TB
        M1["Helmet<br/>Security Headers"]
        M2["CORS<br/>Cross-Origin"]
        M3["Morgan<br/>HTTP Logging"]
        M4["express.json<br/>Body Parser"]
        M5["express.static<br/>Static Files"]
    end

    subgraph EXPRESS["EXPRESS APPLICATION"]
        direction TB
        APP[("Express App<br/>Port 3000")]
    end

    subgraph ROUTES["API ROUTES"]
        direction TB

        subgraph HEALTH["/api/health"]
            direction LR
            H1["GET /<br/>Basic Health"]
            H2["GET /live<br/>Liveness Probe"]
            H3["GET /ready<br/>Readiness Probe"]
            H4["GET /version<br/>Version Info"]
        end

        subgraph ROBOTS["/api/robots"]
            direction LR
            R1["GET /<br/>List Robots"]
            R2["GET /:id<br/>Get Robot"]
            R3["POST /<br/>Create Robot"]
            R4["PUT /:id<br/>Update Robot"]
            R5["DELETE /:id<br/>Decommission"]
            R6["POST /:id/maintenance<br/>Schedule Maintenance"]
        end

        subgraph METRICS["/api/metrics"]
            direction LR
            ME1["GET /<br/>Fleet Overview"]
            ME2["GET /performance<br/>Performance Stats"]
            ME3["GET /uptime<br/>Uptime Statistics"]
        end

        subgraph ROOT["/api"]
            direction LR
            ROOT1["GET /api<br/>API Info"]
        end
    end

    subgraph SERVICE["SERVICE LAYER"]
        direction TB
        RS["RobotService"]

        subgraph METHODS["Service Methods"]
            direction LR
            SM1["getAllRobots"]
            SM2["getRobotById"]
            SM3["createRobot"]
            SM4["updateRobot"]
            SM5["deleteRobot"]
            SM6["scheduleMaintenance"]
        end
    end

    subgraph DATA["DATA LAYER"]
        direction TB
        DB[("In-Memory<br/>Robot Store")]

        subgraph ROBOT_ENTITY["Robot Entity"]
            direction LR
            RE1["id"]
            RE2["name"]
            RE3["type"]
            RE4["status"]
            RE5["location"]
            RE6["batteryLevel"]
        end
    end

    subgraph ERROR["ERROR HANDLING"]
        direction TB
        EH["Error Handler<br/>Middleware"]
        E404["404 Handler<br/>Not Found"]

        subgraph ERRORS["Error Types"]
            direction LR
            ERR1["ValidationError<br/>400"]
            ERR2["UnauthorizedError<br/>401"]
            ERR3["ForbiddenError<br/>403"]
            ERR4["InternalError<br/>500"]
        end
    end

    %% Flow connections
    CLIENT --> MIDDLEWARE
    MIDDLEWARE --> EXPRESS

    EXPRESS --> HEALTH
    EXPRESS --> ROBOTS
    EXPRESS --> METRICS
    EXPRESS --> ROOT

    %% Robot routes to service
    ROBOTS --> RS
    METRICS --> RS

    %% Service to data
    RS --> METHODS
    METHODS --> DB
    DB --> ROBOT_ENTITY

    %% Error handling
    EXPRESS --> ERROR

    %% Styling
    classDef clientStyle fill:#E3F2FD,stroke:#1565C0,stroke-width:2px
    classDef middlewareStyle fill:#FFF3E0,stroke:#EF6C00,stroke-width:2px
    classDef expressStyle fill:#E8F5E9,stroke:#2E7D32,stroke-width:3px
    classDef healthStyle fill:#E0F7FA,stroke:#00838F,stroke-width:1px
    classDef robotStyle fill:#FCE4EC,stroke:#C2185B,stroke-width:1px
    classDef metricsStyle fill:#FFF8E1,stroke:#F9A825,stroke-width:1px
    classDef serviceStyle fill:#E8EAF6,stroke:#3949AB,stroke-width:2px
    classDef dataStyle fill:#EFEBE9,stroke:#5D4037,stroke-width:2px
    classDef errorStyle fill:#FFEBEE,stroke:#C62828,stroke-width:2px

    class C1,C2,C3 clientStyle
    class M1,M2,M3,M4,M5 middlewareStyle
    class APP expressStyle
    class H1,H2,H3,H4 healthStyle
    class R1,R2,R3,R4,R5,R6 robotStyle
    class ME1,ME2,ME3 metricsStyle
    class ROOT1 expressStyle
    class RS,SM1,SM2,SM3,SM4,SM5,SM6 serviceStyle
    class DB,RE1,RE2,RE3,RE4,RE5,RE6 dataStyle
    class EH,E404,ERR1,ERR2,ERR3,ERR4 errorStyle
```

## Request Flow Sequence Diagram

```mermaid
sequenceDiagram
    autonumber
    participant Client
    participant Helmet
    participant CORS
    participant Morgan
    participant BodyParser
    participant Express
    participant Router
    participant RobotService
    participant DataStore
    participant ErrorHandler

    Client->>Helmet: HTTP Request
    Helmet->>CORS: Add Security Headers
    CORS->>Morgan: Handle CORS
    Morgan->>BodyParser: Log Request
    BodyParser->>Express: Parse JSON Body

    alt Health Check
        Express->>Router: /api/health/*
        Router-->>Client: Health Response
    else Robot Operations
        Express->>Router: /api/robots/*
        Router->>RobotService: Business Logic
        RobotService->>DataStore: CRUD Operation
        DataStore-->>RobotService: Robot Data
        RobotService-->>Router: Processed Result
        Router-->>Client: JSON Response
    else Metrics
        Express->>Router: /api/metrics/*
        Router->>RobotService: Get Fleet Data
        RobotService->>DataStore: Query Robots
        DataStore-->>RobotService: Robot Array
        RobotService-->>Router: Calculated Metrics
        Router-->>Client: Metrics Response
    else Error
        Express->>ErrorHandler: Error Thrown
        ErrorHandler-->>Client: Error Response
    end
```

## API Endpoints Reference

| Route | Method | Description | Handler |
|-------|--------|-------------|---------|
| `/api` | GET | API information | index.js |
| `/api/health` | GET | Basic health check | health.js |
| `/api/health/live` | GET | Kubernetes liveness probe | health.js |
| `/api/health/ready` | GET | Kubernetes readiness probe | health.js |
| `/api/health/version` | GET | Version information | health.js |
| `/api/robots` | GET | List all robots (with filters) | robots.js |
| `/api/robots/:id` | GET | Get specific robot | robots.js |
| `/api/robots` | POST | Create new robot | robots.js |
| `/api/robots/:id` | PUT | Update robot | robots.js |
| `/api/robots/:id` | DELETE | Decommission robot | robots.js |
| `/api/robots/:id/maintenance` | POST | Schedule maintenance | robots.js |
| `/api/metrics` | GET | Fleet overview metrics | metrics.js |
| `/api/metrics/performance` | GET | Performance statistics | metrics.js |
| `/api/metrics/uptime` | GET | Uptime statistics | metrics.js |

## Component Class Diagram

```mermaid
classDiagram
    class ExpressApp {
        +PORT: number
        +ENV: string
        +use(middleware)
        +get(path, handler)
        +listen(port, callback)
    }

    class RobotService {
        +getAllRobots() Robot[]
        +getRobotById(id) Robot
        +createRobot(data) Robot
        +updateRobot(id, updates) Robot
        +deleteRobot(id) boolean
        +scheduleMaintenance(id, data) Maintenance
        +getRobotsByStatus(status) Robot[]
        +getRobotsByLocation(location) Robot[]
    }

    class Robot {
        +id: string
        +name: string
        +type: string
        +status: string
        +location: string
        +batteryLevel: number
        +lastMaintenance: Date
        +createdAt: Date
    }

    class ErrorHandler {
        +handle(err, req, res, next)
        +ValidationError: 400
        +UnauthorizedError: 401
        +ForbiddenError: 403
        +InternalError: 500
    }

    class Logger {
        +error(message, meta)
        +warn(message, meta)
        +info(message, meta)
        +debug(message, meta)
    }

    class HealthRouter {
        +GET /
        +GET /live
        +GET /ready
        +GET /version
    }

    class RobotsRouter {
        +GET /
        +GET /:id
        +POST /
        +PUT /:id
        +DELETE /:id
        +POST /:id/maintenance
    }

    class MetricsRouter {
        +GET /
        +GET /performance
        +GET /uptime
    }

    ExpressApp --> HealthRouter : routes
    ExpressApp --> RobotsRouter : routes
    ExpressApp --> MetricsRouter : routes
    ExpressApp --> ErrorHandler : middleware

    RobotsRouter --> RobotService : uses
    MetricsRouter --> RobotService : uses

    RobotService --> Robot : manages
    ErrorHandler --> Logger : logs to
```

## Data Flow Diagram

```mermaid
flowchart LR
    subgraph Input
        REQ["HTTP Request"]
    end

    subgraph Processing
        direction TB
        VAL["Validation"]
        AUTH["Authentication"]
        BIZ["Business Logic"]
    end

    subgraph Storage
        MEM["In-Memory Store<br/>12 Robot Records"]
    end

    subgraph Output
        RES["JSON Response"]
    end

    REQ --> VAL
    VAL --> AUTH
    AUTH --> BIZ
    BIZ <--> MEM
    BIZ --> RES

    style Input fill:#e3f2fd
    style Processing fill:#fff3e0
    style Storage fill:#efebe9
    style Output fill:#e8f5e9
```
