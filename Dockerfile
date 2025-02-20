FROM node:20-alpine AS builder 

WORKDIR /app 

COPY package.json ./ 

RUN npm install

COPY . .



FROM node:20-alpine

WORKDIR /app 

COPY --from=builder /app/{package.json,node_modules,index.js,app.js,db_init.js} ./

# EXPOSE 3000

CMD ["node", "index.js"] 
