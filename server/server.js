const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const axios = require('axios');
// const Trip = require('./trip.js')
const TripOSM = require('./triposm.js')


// Initialize Express app
const app = express();
const PORT = 5000;

// Configure middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());


app.post('/apiForm', (req, res) => {
  const data = req.body;
  console.log(data);
  // const { cityName, lat, lon, fromDate, toDate, chosenKinds } = data;
  const cityName = data['cityName'];
  const lat = data['lat'];
  const lon = data['lon'];
  const fromDate = JSON.parse(data['fromDateStr']);
  const toDate = JSON.parse(data['toDateStr']);
  console.log('date range: ', toDate, fromDate);
  const chosenKinds = JSON.parse(data['choosenKinds']);
  console.log(cityName, chosenKinds, lat, lon)

  var trip = new TripOSM(cityName, lat, lon, fromDate, toDate, chosenKinds);
  var placesMap = trip.createTrip();
  console.log(placesMap);
  // res.json(places)
  // places = placesMap.map(place => place[2])
  // console.log(places);
  // Define routes
  // app.get('/api', (req, res) => {
  //   res.json(placesMap);
  // })
});

// Define routes
  // app.get('/api', (req, res) => {
  //   res.json(places);
  // });

// Start the server
app.listen(PORT, () => {
  // res.json(places)
  console.log(`Server started on port ${PORT}`);
});
