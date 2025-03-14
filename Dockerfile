FROM node:20-alpine AS builder 

WORKDIR /app 

COPY package.json package-lock.json ./

RUN npm install

COPY . . 

FROM node:20-alpine

WORKDIR /app 

COPY --from=builder /app ./

CMD ["node", "index.js"] 
