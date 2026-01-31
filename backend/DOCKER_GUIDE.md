# Docker Build & Run Guide

## ✅ Build Completed Successfully!

**Image Name:** `hackmoney-backend:latest`  
**Image ID:** `890b1f5a949f`  
**Size:** 259MB

---

## Running the Container

### Basic Run (Foreground)
```bash
sudo docker run -p 4000:4000 hackmoney-backend:latest
```

### Run with Environment Variables
```bash
sudo docker run -p 4000:4000 \
  -e JWT_SECRET=your-production-secret \
  -e SUPABASE_URL=your-supabase-url \
  -e SUPABASE_ANON_KEY=your-anon-key \
  -e SUPABASE_SERVICE_KEY=your-service-key \
  hackmoney-backend:latest
```

### Run in Detached Mode (Background)
```bash
sudo docker run -d \
  --name hackmoney-api \
  -p 4000:4000 \
  --env-file .env \
  hackmoney-backend:latest
```

### Run with .env File
```bash
sudo docker run -d \
  --name hackmoney-api \
  -p 4000:4000 \
  --env-file .env \
  hackmoney-backend:latest
```

---

## Container Management

### View Running Containers
```bash
sudo docker ps
```

### View Container Logs
```bash
sudo docker logs hackmoney-api

# Follow logs in real-time
sudo docker logs -f hackmoney-api
```

### Stop Container
```bash
sudo docker stop hackmoney-api
```

### Start Container
```bash
sudo docker start hackmoney-api
```

### Remove Container
```bash
sudo docker rm hackmoney-api
```

### Remove Image
```bash
sudo docker rmi hackmoney-backend:latest
```

---

## Build Details

### Multi-Stage Build Process

1. **Stage 1 - deps**: Install dependencies
   - Uses `bun install`
   - Saves lockfile
   - 180 packages installed

2. **Stage 2 - build**: Bundle application
   - Bundles 734 modules
   - Minifies code
   - Output: `server.js` (2.59 MB)

3. **Stage 3 - runtime**: Production image
   - Base: `oven/bun:1-slim`
   - Non-root user: `bun`
   - Exposes port: 4000

### Image Layers
- Total layers: 19
- Base image: oven/bun:1-slim  
- Final size: 259MB (optimized)

---

## Testing the Container

```bash
# Run the container
sudo docker run -d --name test-api -p 4000:4000 hackmoney-backend:latest

# Wait a few seconds for startup
sleep 3

# Test the API
curl http://localhost:4000/

# Check logs
sudo docker logs test-api

# Clean up
sudo docker stop test-api && sudo docker rm test-api
```

---

## Docker Compose (Optional)

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  backend:
    image: hackmoney-backend:latest
    ports:
      - "4000:4000"
    env_file:
      - .env
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:4000/"]
      interval: 30s
      timeout: 10s
      retries: 3
```

Run with:
```bash
sudo docker-compose up -d
```

---

## Troubleshooting

### Container won't start
```bash
# Check logs
sudo docker logs hackmoney-api

# Inspect container
sudo docker inspect hackmoney-api
```

### Port already in use
```bash
# Use a different port
sudo docker run -p 5000:4000 hackmoney-backend:latest

# Or stop the conflicting process
sudo lsof -i :4000
```

### Permission denied errors
```bash
# Make sure you're using sudo
# Or add your user to docker group:
sudo usermod -aG docker $USER
# Then logout and login again
```

---

## Next Steps

1. ✅ Docker image built
2. 🔄 Test the container locally
3. 🔄 Push to Docker registry (optional)
4. 🔄 Deploy to production

## Push to Docker Hub (Optional)

```bash
# Tag for Docker Hub
sudo docker tag hackmoney-backend:latest username/hackmoney-backend:latest

# Login to Docker Hub
sudo docker login

# Push
sudo docker push username/hackmoney-backend:latest
```
