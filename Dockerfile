FROM node:20-alpine AS builder 

WORKDIR /app 

COPY . . 

RUN npm install

FROM node:20-alpine

WORKDIR /app 

COPY --from=builder /app ./
COPY --from=builder /app/node_modules ./node_modules


CMD ["node", "index.js"] 
