# Uporabi uradno Node.js sliko z Alpine Linux
FROM node:16-alpine

# Ustvari in nastavi delovni direktorij
WORKDIR /usr/src/app

# Kopiraj package.json in package-lock.json v delovni direktorij
COPY package*.json ./

# Namesti projektne odvisnosti
RUN npm install

# Kopiraj vse datoteke projekta v delovni direktorij
COPY . .

# Izpostavi port, ki ga uporablja tvoj BFF-Mobile
EXPOSE 4000

# Zaženi server.js z Node.js
CMD ["node", "server.js"]
