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
const BOOK_SERVICE_BASE_URL = 'http://localhost:8080/api';


// Nastavi osnovni URL mikrostoritve za rezervacije
const RESERVATION_SERVICE_BASE_URL = 'http://localhost:8081';
const STATS_API_URI = 'http://localhost:9000/api/stats'; // URL tvoje statistične storitve


//const BOOK_SERVICE_BASE_URL = 'http://book-management-service:8080/api';
//const RESERVATION_SERVICE_BASE_URL = 'http://reservation-service:8081';

/*
// Pridobi vse knjige
app.get('/api/books', async (req, res) => {
  try {
    const response = await axios.get(`${BOOK_SERVICE_BASE_URL}/books`);
    res.status(response.status).json(response.data);
  } catch (error) {
    console.error('Error fetching all books:', error.message);
    res.sendStatus(500);
  }
});
*/

app.get('/api/books', async (req, res) => {
  try {
      const response = await axios.get(`${BOOK_SERVICE_BASE_URL}/books`);

      // Posodobi statistiko po uspešnem klicu
      axios.post(`http://localhost:9000/api/stats/updateStats`, {
          endpoint: 'GET: /api/books'
      })
      .then(statResponse => {
          console.log('Statistika uspešno posodobljena');
          res.status(response.status).json(response.data);
      })
      .catch(statError => {
          console.error('Napaka pri posodabljanju statistike:', statError);
          // Če statistika ne uspe, še vedno vrne podatke
          res.status(response.status).json(response.data);
      });
  } catch (error) {
      console.error('Error fetching all books:', error.message);
      
      // Posodobi statistiko tudi v primeru napake
      axios.post(`${STATS_API_URI}/updateStats`, {
          klicanaStoritev: 'GET: /api/books'
      })
      .then(statResponse => {
          console.log('Statistika uspešno posodobljena ob napaki');
          res.sendStatus(500);
      })
      .catch(statError => {
          console.error('Napaka pri posodabljanju statistike (napaka):', statError);
          res.sendStatus(500);
      });
  }
});




// Pridobi knjigo po ID
app.get('/api/books/:id', async (req, res) => {
  try {
    const response = await axios.get(`${BOOK_SERVICE_BASE_URL}/books/${req.params.id}`);
    res.status(response.status).json(response.data);
  } catch (error) {
    console.error(`Error fetching book with ID ${req.params.id}:`, error.message);
    res.sendStatus(500);
  }
});

// Ustvari novo knjigo
app.post('/api/books', async (req, res) => {
  try {
    const response = await axios.post(`${BOOK_SERVICE_BASE_URL}/books`, req.body);
    res.status(response.status).json(response.data);
  } catch (error) {
    console.error('Error creating a book:', error.message);
    res.sendStatus(500);
  }
});

// Posodobi knjigo
app.put('/api/books/:id', async (req, res) => {
  try {
    const response = await axios.put(`${BOOK_SERVICE_BASE_URL}/books/${req.params.id}`, req.body);
    res.status(response.status).json(response.data);
  } catch (error) {
    console.error(`Error updating book with ID ${req.params.id}:`, error.message);
    res.sendStatus(500);
  }
});

// Izbriši knjigo
app.delete('/api/books/:id', async (req, res) => {
  try {
    const response = await axios.delete(`${BOOK_SERVICE_BASE_URL}/books/${req.params.id}`);
    res.status(response.status).send('Book deleted successfully');
  } catch (error) {
    console.error(`Error deleting book with ID ${req.params.id}:`, error.message);
    res.sendStatus(500);
  }
});


// Pridobi vse rezervacije
app.get('/api/reservations', async (req, res) => {
  try {
    const response = await axios.get(`${RESERVATION_SERVICE_BASE_URL}/reservations`);
    res.status(response.status).json(response.data);
  } catch (error) {
    console.error('Error fetching all reservations:', error.message);
    res.sendStatus(500);
  }
});

// Pridobi rezervacijo po ID
app.get('/api/reservations/:id', async (req, res) => {
  try {
    const response = await axios.get(`${RESERVATION_SERVICE_BASE_URL}/reservations/${req.params.id}`);
    res.status(response.status).json(response.data);
  } catch (error) {
    console.error(`Error fetching reservation with ID ${req.params.id}:`, error.message);
    res.sendStatus(500);
  }
});

// Ustvari novo rezervacijo
app.post('/api/reservations', async (req, res) => {
  try {
    const response = await axios.post(`${RESERVATION_SERVICE_BASE_URL}/reservations`, req.body);
    res.status(response.status).json(response.data);
  } catch (error) {
    console.error('Error creating a reservation:', error.message);
    res.sendStatus(500);
  }
});

// Posodobi rezervacijo
app.put('/api/reservations/:id', async (req, res) => {
  try {
    const response = await axios.put(`${RESERVATION_SERVICE_BASE_URL}/reservations/${req.params.id}`, req.body);
    res.status(response.status).json(response.data);
  } catch (error) {
    console.error(`Error updating reservation with ID ${req.params.id}:`, error.message);
    res.sendStatus(500);
  }
});

// Izbriši rezervacijo
app.delete('/api/reservations/:id', async (req, res) => {
  try {
    const response = await axios.delete(`${RESERVATION_SERVICE_BASE_URL}/reservations/${req.params.id}`);
    res.status(response.status).send('Reservation deleted successfully');
  } catch (error) {
    console.error(`Error deleting reservation with ID ${req.params.id}:`, error.message);
    res.sendStatus(500);
  }
});





app.listen(PORT, () => {
  console.log(`BFF Web listening at http://localhost:${PORT}`);
});