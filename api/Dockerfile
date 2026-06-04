# Stage 1: Build frontend
FROM node:18-alpine as frontend-builder
WORKDIR /frontend
COPY package.json package-lock.json ./
RUN npm ci
COPY vite.config.ts tailwind.config.js postcss.config.js ./
COPY src ./src
COPY index.html ./
RUN npm run build

# Stage 2: Python backend with built frontend
FROM python:3.11-slim
ARG CONTEXT_ROOT=api
WORKDIR /app

COPY ${CONTEXT_ROOT}/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt gunicorn

COPY ${CONTEXT_ROOT}/. ./

# Copy built frontend from stage 1
COPY --from=frontend-builder /frontend/dist ./dist

# Note: Model files (*.pth) are in .gitignore and must be provided separately
# Options:
# 1. Mount model files to /app/Model at runtime
# 2. Use Git LFS to track model files
# 3. Download models from storage during startup
# Create empty Model directory for now
RUN mkdir -p /app/Model

# Copy entrypoint script
COPY api/entrypoint.sh ./entrypoint.sh
RUN chmod +x ./entrypoint.sh

ENV PORT=8080
EXPOSE 8080

ENTRYPOINT ["./entrypoint.sh"]

CMD ["gunicorn", "--bind", "0.0.0.0:8080", "app:app", "--workers", "1", "--threads", "8"]
