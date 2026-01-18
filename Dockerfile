# Build stage
FROM node18-alpine AS build

WORKDIR app

# Copy package files
COPY package.json .

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Build the app
RUN npm run build

# Production stage
FROM nginxalpine

# Copy built app from build stage
COPY --from=build appbuild usrsharenginxhtml

# Copy nginx configuration
COPY nginx.conf etcnginxconf.ddefault.conf

EXPOSE 3000

CMD [nginx, -g, daemon off;]