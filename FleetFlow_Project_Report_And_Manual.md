# FleetFlow: Modular Fleet & Logistics Management System
## Comprehensive Project Report & Operational Manual

---

## Part 1: Project Report

### 1.1 Executive Summary
FleetFlow is a complete, production-ready enterprise web application designed to transition manual logistics and fleet tracking operations into an intelligent, digitized platform. By leveraging a high-performance, strictly typed React/Vite frontend and a Node/Express/Prisma backend, the system centralizes vehicle telemetry, driver performance, trip dispatching, and financial analytics.

### 1.2 System Architecture
The application runs on a modular **Monorepo Architecture**, separating logic into functional micro-services running within isolated Docker containers.

- **Frontend (Client)**: React 18, Vite, TypeScript, Tailwind CSS, ShadCN UI, Zustand. Provides a highly responsive, stateless SPA (Single Page Application) that manages global data efficiently.
- **Backend (Server)**: Node.js, Express.js, TypeScript. An API layer utilizing standard REST principles to orchestrate communication.
- **Database Layer**: PostgreSQL managed by Prisma ORM. Ensures absolute referential integrity across all internal resources (e.g., stopping the deletion of a driver who is currently on an active trip).
- **Security & Auth**: Stateless JWT implementation handling Access Tokens and Refresh Tokens. Employs Role-Based Access Control (RBAC) across Fleet Managers, Dispatchers, and Financial Analysts.

### 1.3 Core Modules Implemented
1. **Authentication & RBAC**: Granular dashboard access relying on JWT validation.
2. **Command Center**: Real-time aggregation of Fleet KPIs (Utilization Rates, Maintenance Alerts, Active Cargo).
3. **Vehicle Registry**: Complete CRUD interface mapping fleet lifecycles and conditional statuses (Available, On Trip, In Shop).
4. **Driver Management**: Tracking logic encompassing licensing requirements and automated safety scores. 
5. **Trip Dispatcher**: The structural core that connects a Driver and a Vehicle to a load. Features automated state progression (Draft -> Dispatched -> Completed) while validating cargo weight limits against vehicle maximum capacities.
6. **Maintenance & Fuel Logs**: Financial ledger systems tightly decoupled by vehicle to trace real-world operational costs.
7. **Financial Analytics**: A calculation engine providing immediate Vehicle ROI figures.

---

## Part 2: Operational Manual

### 2.1 Initial Setup & Login
When the application first boots, the database is automatically seeded with default user credentials.

**Accessing the Platform:**
- Open a modern web browser (Chrome, Safari, Edge) and navigate to `http://localhost`.

**Default Login Credentials:**
- **System Administrator (Fleet Manager)**: `admin@fleetflow.com` (Pass: `password123`)
- **Trip Dispatcher**: `dispatcher@fleetflow.com` (Pass: `password123`)

*Note: Passwords are cryptographically hashed using `bcrypt` in the database.*

### 2.2 Using the Command Center
Upon login, you land on the Dashboard. This screen provides high-level KPIs:
- **Active Fleet**: Current vehicles out on delivery.
- **Maintenance Alerts**: Total vehicles flagged "In Shop".
- **Utilization Rate**: Real-time percentage of assigned vehicles vs. total active fleet.
- **Pending Cargo**: Sum of all cargo weight awaiting dispatch.

### 2.3 Managing Vehicles
1. Navigate to **Vehicles** on the sidebar.
2. Click **Add Vehicle**.
3. Input the required specifics (Name, License, Max Capacity, Odometer, and Acquisition Cost).
4. **Warning**: Vehicles marked as `Retired` or `In Shop` cannot be assigned to new trips.

### 2.4 Managing Drivers
1. Navigate to **Drivers**.
2. Click **Add Driver** and supply their licensing details.
3. The system tracks expiry dates. **If a license has expired, the driver is automatically flagged and blocked from dispatch.**

### 2.5 Dispatching a Trip (Core Workflow)
1. Go to the **Trip Dispatcher**.
2. Click **Create Trip**.
3. **Draft Phase**: Select an *Available* Driver and an *Available* Vehicle. You must input the Cargo Weight.
    - *Rule Check*: The system will throw an error if the cargo weight exceeds the specific vehicle's `maxCapacityKg`.
4. **Dispatch Phase**: Switch the trip status to `DISPATCHED`. The driver and vehicle are automatically flagged as `ON_TRIP` globally.
5. **Completion Phase**: When returning, switch status to `COMPLETED`. You will be prompted to enter the **End Odometer**.
    - *Rule Check*: The End Odometer must be strictly greater than the starting odometer. Once saved, the vehicle's master odometer is permanently updated.

### 2.6 Logging Fuel & Maintenance
- **Fuel Logs**: Used to calculate ROI. Enter the volume, total cost, and the associated vehicle.
- **Maintenance**: Logging a service record automatically switches a Vehicle's status to `In Shop`. You must explicitly mark the maintenance as complete to free the vehicle up for dispatch again.

### 2.7 Financial Analytics & Exporting
1. Navigate to **Analytics**.
2. The grid calculates **Vehicle ROI** (Total Revenue - (Acquisition Cost + Lifetime Fuel Cost + Lifetime Maintenance Cost)).
3. **Exports**: Use the actions at the top right to download raw system data directly into `.csv` spreadsheets or formatted `.pdf` executive reports for offline review.

---

### 2.8 DevOps & Developer Access (Advanced)
If you need to bypass the UI for technical audits, you can use the built-in database tools.

**Starting Prisma Studio (Database Viewer):**
Open a terminal and execute:
```bash
docker exec -it fleetflow_server npx prisma studio
```
Navigate to `http://localhost:5555` to visually edit the raw PostgreSQL tables.
