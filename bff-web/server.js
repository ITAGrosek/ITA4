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


// Nastavi osnovni URL mikrostoritve za rezervacije
const RESERVATION_SERVICE_BASE_URL = 'http://localhost:8081';


// Dinamično usmerjanje vseh zahtev pod '/api/*'
app.use('/api/*', async (req, res) => {
    let targetUrl;
    if (req.originalUrl.includes('/api/books')) {
      // Če je zahteva namenjena upravljanju knjig, usmeri na prvo mikrostoritev
      targetUrl = `${BOOK_SERVICE_BASE_URL}${req.originalUrl.replace('/api', '')}`;
    } else if (req.originalUrl.includes('/api/reservations')) {
      // Če je zahteva namenjena upravljanju rezervacij, usmeri na drugo mikrostoritev
      targetUrl = `${RESERVATION_SERVICE_BASE_URL}${req.originalUrl.replace('/api', '')}`;
    }
  
    try {
      // Ustvari konfiguracijo za Axios zahtevek
      const axiosConfig = {
        method: req.method,
        url: targetUrl,
        ...(Object.keys(req.body || {}).length > 0 && {data: req.body}),
        params: req.query,
      };
  
      // Pošlji zahtevek na ustrezno končno točko glede na pot
      const response = await axios(axiosConfig);
      res.status(response.status).json(response.data);
    } catch (error) {
      // Obvladuj napake
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


