FROM node:20-alpine AS builder 

WORKDIR /app 

COPY package.json ./ 

RUN npm install

COPY . .



FROM node:20-alpine

WORKDIR /app 

COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/index.js ./index.js
COPY --from=builder /app/app.js ./app.js
COPY --from=builder /app/db_init.js ./db_init.js

EXPOSE 3000

CMD ["node", "index.js"] 
