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


// app.post('/apiForm', (req, res) => {
//   const { cityName, lat, lon, fromDate, toDate, chosenKinds } = req.body;
//   console.log(cityName, chosenKinds)
//   console.log('date range: ', toDate-fromDate, toDate, fromDate);

//   var trip = new Trip(cityName, lat, lon, fromDate, toDate, chosenKinds);
//   var placesMap = trip.createTrip();
//   console.log(placesMap);
//   // res.json(places)
//   places = placesMap.map(place => place[2])
//   console.log(places);
//   // Define routes
//   app.get('/api', (req, res) => {
//     res.json(places);
//   })
// });

// Define routes
  // app.get('/api', (req, res) => {
  //   res.json(places);
  // });

// Start the server
app.listen(PORT, () => {
  const cityName = "Paris";
  const lat = 48.856613;
  const lon = 2.352222; 
  const fromDate = '25/04/2024';
  const toDate = '30/04/2024';
  const chosenKinds = ['Art&Cultural', 'Museums'];
    

  async function create() {
    // var trip = new Trip(cityName, lat, lon, fromDate, toDate, chosenKinds);
    var trip = new TripOSM(cityName, lat, lon, fromDate, toDate, chosenKinds);
    try {
        var placesMap = await trip.createTrip();
        // console.log("placeMap in server:", placesMap);
        var places = Object.values(placesMap).flatMap(cluster => cluster.map(place => place.original_name));
        // console.log(places);
    } catch (error) {
        console.error("Error in creating trip: ", error);
    }
  }
  create()
  // res.json(places)
  console.log(`Server started on port ${PORT}`);
});
