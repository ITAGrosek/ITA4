const express = require('express');
const axios = require('axios');
const app = express();
const PORT = 3000; 
const grpc = require('@grpc/grpc-js');



const { UserServiceClient } = require('./generated/user_grpc_pb');
const { UserRequest } = require('./generated/user_pb');

// Nastavitve za gRPC mikrostoritev za uporabnike
const userClient = new UserServiceClient(
    'localhost:9002',
    grpc.credentials.createInsecure()
  );

app.use(express.json());

// Nastavi osnovni URL mikrostoritve za knjige
// Ta URL se uporablja kot cilj za vse zahteve, ki so namenjene mikrostoritvi za knjige
const BOOK_SERVICE_BASE_URL = 'http://localhost:8080/api';


  

// Dinamično usmerjanje vseh zahtev pod '/api/*'
app.use('/api/*', async (req, res) => {
  // Izgradi ciljni URL s podmenjavo '/api' z osnovnim URL mikrostoritve
  // Dinamično izgradi ciljni URL tako, da zamenjaš '/api' s praznim nizom,
  // kar pomeni, da vse zahteve na '/api/something' preusmeriš na 'http://localhost:8080/api/something'
  const targetUrl = `${BOOK_SERVICE_BASE_URL}${req.originalUrl.replace('/api', '')}`;

  try {

    // Ustvari konfiguracijo za Axios zahtevek, ki vključuje:
    // - metodo zahteve (GET, POST, PUT, DELETE itd.)
    // - ciljni URL, na katerega se pošlje zahtevek
    // - telo zahteve (če je to POST/PUT zahtevek)
    // - query parametre (če obstajajo)
    // Konfiguracija Axios zahtevka vključuje metodo, URL, telo (za POST/PUT) in query parametre
    const axiosConfig = {
      method: req.method,
      url: targetUrl,
      ...(Object.keys(req.body || {}).length > 0 && {data: req.body}),
      params: req.query,
    };

    // Posreduj zahtevek do ciljne mikrostoritve in pošlji odgovor nazaj odjemalcu
    const response = await axios(axiosConfig);
    res.status(response.status).json(response.data);
  } catch (error) {
    // Ustrezno rokovanje z napakami, vključno z napakami mikrostoritve
    if (error.response) {
      res.status(error.response.status).send(error.response.data);
    } else {
      console.error(error.message);
      res.sendStatus(500);
    }
  }
});






app.listen(PORT, () => {
  console.log(`BFF Web listening at http://localhost:${PORT}`);
});


