const express = require('express');
const axios = require('axios');
const app = express();
const PORT = 3000; 

const grpc = require('@grpc/grpc-js');
const { UserServiceClient } = require('./generated/proto/user_grpc_pb');
const { UserRequest } = require('./generated/proto/user_pb');
const cors = require('cors');


app.use(cors());


const client = new UserServiceClient(
  'users-service:9002',
  grpc.credentials.createInsecure()
);

// Middleware za branje JSON telesa
app.use(express.json());

app.post('/api/users', (req, res) => {
  // Ustvari Protobuf sporočilo
  const request = new UserRequest();
  request.setName(req.body.name);
  request.setSurname(req.body.surname);
  request.setAge(req.body.age);
  request.setEmail(req.body.email);
  request.setUsername(req.body.username);
  
  // Izvedi gRPC klic
  client.createUser(request, (error, response) => {
    if (error) {
      console.error('gRPC error:', error);
      res.status(500).send("An error occurred: " + error.message);
    } else {
      // `response` je Protobuf objekt, pretvoriti ga morate v JSON
      res.json(response.toObject());
    }
  });
});

app.get('/api/users/:id', (req, res) => {
  const request = new UserRequest();
  request.setId(req.params.id);

  client.getUser(request, (error, response) => {
    if (error) {
      console.error('gRPC error:', error);
      res.status(500).send("An error occurred: " + error.message);
    } else {
      res.json(response.toObject());
    }
  });
});


// Posodobi podatke uporabnika
app.put('/api/users/:id', (req, res) => {
  const request = new UserRequest();
  request.setId(req.params.id);
  // Predpostavljamo, da telo zahtevka vsebuje vse atribute, ki jih želimo posodobiti
  Object.keys(req.body).forEach(key => {
    const setter = `set${key.charAt(0).toUpperCase() + key.slice(1)}`;
    if (typeof request[setter] === 'function') {
      request[setter](req.body[key]);
    }
  });

  client.updateUser(request, (error, response) => {
    if (error) {
      console.error('gRPC error:', error);
      res.status(500).send("An error occurred: " + error.message);
    } else {
      res.json(response.toObject());
    }
  });
});

// Izbriše uporabnika
app.delete('/api/users/:id', (req, res) => {
  const request = new UserRequest();
  request.setId(req.params.id);

  client.deleteUser(request, (error, response) => {
    if (error) {
      console.error('gRPC error:', error);
      res.status(500).send("An error occurred: " + error.message);
    } else {
      res.sendStatus(204); // No Content
    }
  });
});

app.get('/api/users', (req, res) => {
  const request = new UserRequest();

  const call = client.listUsers(request);
  const users = [];

  call.on('data', (user) => {
    users.push(user.toObject());
  });

  call.on('end', () => {
    res.json(users);
  });

  call.on('error', (error) => {
    console.error('gRPC error:', error);
    res.status(500).send("An error occurred: " + error.message);
  });

  call.on('status', (status) => {
    // lahko tudi obravnavate gRPC status
  });
});

app.use(express.json());

// Nastavi osnovni URL mikrostoritve za knjige
// Ta URL se uporablja kot cilj za vse zahteve, ki so namenjene mikrostoritvi za knjige
//const BOOK_SERVICE_BASE_URL = 'http://localhost:8080/api';


// Nastavi osnovni URL mikrostoritve za rezervacije
//const RESERVATION_SERVICE_BASE_URL = 'http://localhost:8081';


const BOOK_SERVICE_BASE_URL = 'http://book-management-service:8080/api';
const RESERVATION_SERVICE_BASE_URL = 'http://reservation-service:8081';

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


