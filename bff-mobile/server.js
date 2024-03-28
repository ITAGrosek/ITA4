const express = require('express');
const axios = require('axios');
const app = express();
const PORT = 4000; // Uporabite drugačen port za BFF-Mobile, npr. 4000
const grpc = require('@grpc/grpc-js');

app.use(express.json());

// Nastavi osnovni URL mikrostoritve za knjige
const BOOK_SERVICE_BASE_URL = 'http://localhost:8080/api';

// Nastavi osnovni URL mikrostoritve za rezervacije
const RESERVATION_SERVICE_BASE_URL = 'http://localhost:8081';

// Dinamično usmerjanje samo GET zahtev pod '/api/*'
app.get('/api/*', async (req, res) => {
  let targetUrl;
  if (req.originalUrl.includes('/api/books')) {
    // Če je zahteva namenjena upravljanju knjig, usmeri na prvo mikrostoritev
    targetUrl = `${BOOK_SERVICE_BASE_URL}${req.originalUrl.replace('/api', '')}`;
  } else if (req.originalUrl.includes('/api/reservations')) {
    // Če je zahteva namenjena upravljanju rezervacij, usmeri na drugo mikrostoritev
    targetUrl = `${RESERVATION_SERVICE_BASE_URL}${req.originalUrl.replace('/api', '')}`;
  }

  try {
    // Samo za GET zahtevke
    if (req.method !== 'GET') {
      throw new Error('Only GET requests are allowed.');
    }

    // Ustvari konfiguracijo za Axios GET zahtevek
    const axiosConfig = {
      method: 'GET',
      url: targetUrl,
      params: req.query,
    };

    // Pošlji GET zahtevek na ustrezno končno točko glede na pot
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
  console.log(`BFF-Mobile Web listening at http://localhost:${PORT}`);
});
