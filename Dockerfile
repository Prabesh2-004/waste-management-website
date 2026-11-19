FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
# Both are fixed at build time. By default the browser calls this site's /api/v1, which
# the server forwards to BACKEND_URL, so phones and laptops need only the site's address.
ARG NEXT_PUBLIC_API_URL=
ARG BACKEND_URL=http://backend:8000
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL BACKEND_URL=$BACKEND_URL
RUN npm run build

FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production PORT=3000 HOSTNAME=0.0.0.0
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static
EXPOSE 3000
CMD ["node", "server.js"]
