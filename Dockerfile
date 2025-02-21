FROM node:20-alpine AS builder 

WORKDIR /app 

COPY . . 

RUN npm install


FROM node:20-alpine

WORKDIR /app 

COPY --from=builder /app ./

CMD ["node", "index.js"] 
