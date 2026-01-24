# VMIS Deployment Configuration

This directory contains the configuration files for deploying the VMIS application.

## Structure
- `docker-compose.yml`: Defines the services (backend, nginx).
- `backend/Dockerfile`: Instructions to build the backend image (expects `app.jar`).
- `nginx/nginx.conf`: Nginx configuration for serving the frontend and proxying API.
- `Caddyfile`: Example Caddy configuration.

## Usage
1. Place `app.jar` in `backend/`.
2. Place frontend build artifacts (from `npm run build`) in `frontend/dist/` (relative to where you run docker-compose, typical mounted via volumes).
   - *Note*: In our `docker-compose.yml`, we mount `./frontend/dist`. Ensure you copy the `dist` folder to `/docker/pims/frontend/dist` on the server.
3. Run `docker compose up -d --build`.
