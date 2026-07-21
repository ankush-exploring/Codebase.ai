FROM node:20-alpine AS base
WORKDIR /app
COPY client/package.json client/package-lock.json* ./

FROM base AS deps
RUN npm install

FROM deps AS build
WORKDIR /app
COPY client/ ./
RUN npm run build

FROM nginx:alpine AS runtime
COPY --from=build /app/dist /usr/share/nginx/html
COPY client/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
