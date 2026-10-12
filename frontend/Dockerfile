FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginxinc/nginx-unprivileged:stable-alpine-slim
USER root
RUN apk update && apk upgrade --no-cache \
    && mkdir -p /tmp/nginx-conf
USER 101

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/templates/default.conf.template

ENV BACKEND_HOST=backend:8000
ENV DNS_RESOLVER=127.0.0.11

EXPOSE 8080