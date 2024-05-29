const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const TripOSM = require('./triposm.js')


// Initialize Express app
const app = express();
const PORT = 5000;

// Configure middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

function customEncoder(obj) {
  let encodedString = '';

  for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
          const value = obj[key];
          if (key === 'cityName') {
            encodedString += obj[key].replace(/\s/g, '%') + '%';
          } else {
            const stringValue = (typeof value === 'string') ? value : JSON.stringify(value);
            const encodedValue = stringValue.replace(/[^a-zA-Z0-9]/g, '%');
            encodedString += encodedValue + '%';
          }
      }
  }

  // Remove the trailing '%'
  encodedString = encodedString.slice(0, -1);

  return encodedString;
}
app.post('/apiForm', async (req, res) => {
  try {
    const data = req.body;
    const cityName = data['cityName'];
    const lat = data['lat'];
    const lon = data['lon'];
    const fromDate = JSON.parse(data['fromDateStr']);
    const toDate = JSON.parse(data['toDateStr']);
    const chosenKinds = JSON.parse(data['chosenKinds']);
    const placesPerDay = data['placesPerDay'];
    const numPeople = data['numPeople'];
    const budget = data['budget'];
  
    var trip = new TripOSM(cityName, lat, lon, fromDate, toDate, chosenKinds, placesPerDay, numPeople, budget);
    var placesMap = await trip.createTrip();
    var placesMap = JSON.parse(placesMap);
  
    app.get(`/api${customEncoder(data)}`, (req, res) => {
      res.json(placesMap);
    })
  } catch (error) {
    console.error("Error processing request:", error);
    res.status(500).json({ error: "An error occurred while processing the request." });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
