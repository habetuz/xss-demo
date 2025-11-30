FROM node:24-alpine

WORKDIR /app

COPY package*.json ./

RUN npm ci && \
    npm install tsx typescript @types/node

COPY src ./src
COPY site ./site
COPY tsconfig.json ./

EXPOSE 8080

# Run the application
CMD ["npm", "start"]
