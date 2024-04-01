# Izberemo uradno Node.js sliko, ki uporablja alpine kot osnovni sistem, saj je lahek
FROM node:16-alpine

# Nastavimo direktorij, v katerem bodo naše aplikacije znotraj kontejnerja
WORKDIR /usr/src/app

# Kopiramo package.json in package-lock.json (če obstaja) v delovni direktorij
COPY package*.json ./

# Namestimo odvisnosti iz package.json
RUN npm install

# Kopiramo vse ostale datoteke v delovni direktorij
COPY . .

# Izpostavimo port 3000, ki ga bo naša aplikacija uporabljala
EXPOSE 3000

# Z definiranjem ukaza 'CMD' povemo Dockerju, kako naj zažene našo aplikacijo
CMD ["node", "server.js"]
