FROM node:18-alpine AS builder

RUN apk add --no-cache libc6-compat openssl

WORKDIR /app

COPY package.json yarn.lock ./

RUN yarn install --frozen-lockfile

COPY . .

COPY .env .env

RUN yarn prisma generate

RUN yarn build


FROM node:18-alpine

WORKDIR /app

COPY --from=builder /app/next.config.mjs ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/server.js ./server.js

COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/.env ./.env


EXPOSE 3000

CMD /bin/sh -c "yarn prisma migrate deploy && yarn start"

