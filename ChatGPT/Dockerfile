FROM node:lts-alpine as builder
WORKDIR /app
COPY . .
RUN npm install
RUN npm run build

FROM python:3.10-alpine
WORKDIR /app
COPY --from=builder /app/dist .
CMD ["python3","-m","http.server","5200"]
