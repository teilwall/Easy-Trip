// Import dependencies
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const axios = require('axios');
const { kmeans } = require('ml-kmeans');


// Initialize Express app
const app = express();

// Configure middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());


const apiKey = '5ae2e3f221c38a28845f05b64dd7ece8b4aea86eae0408d62e973b96';
const city = 'Paris';
const category = 'historic_object';
const priority = 'tourist';
const radius = 1000;
const lon = 2.3522; // Longitude of Paris
const lat = 48.8566; // Latitude of Paris

// app.post('/process-client-inputs', (req, res) => {
//   // Retrieve client inputs from the request body
//   const city = req.body.city;
//   const category = req.body.category;
//   const priority = req.body.priority;

//   // Process the inputs as needed
//   console.log('City:', city);
//   console.log('Category:', category);
//   console.log('Priority:', priority);

//   // Send a response back to the client
//   res.send('Inputs received and processed successfully!');
// });

axios.get(`https://api.opentripmap.com/0.1/en/places/radius?radius=${radius}&lon=${lon}&lat=${lat}&kinds=${category}&priority=${priority}&apikey=${apiKey}`)
  .then(response => {
    console.log(response.data);
    // Extracting names of architecture places
    const architecturePlaces = response.data.features.map(place => place.properties.name);
    const properties = response.data.features.map(place => place.properties);
    const geometry = response.data.features.map(place => place.geometry);
    const sortedPlaces = response.data.features.sort((a, b) => b.properties.rate - a.properties.rate);
    const first30Places = sortedPlaces.slice(0, 30);
    // const geometry = response.data.features.map(place => place.geometry);
    console.log(architecturePlaces);
    console.log(geometry);
    // console.log(properties);
    // console.log(first30Places);
    // console.log(geometry);

    // Example response.data.features
    const features = response.data.features;

    // Convert features into a format suitable for clustering
    const places = features.map(place => [place.geometry.coordinates[1], place.geometry.coordinates[0]]);

    // Apply K-means clustering
    const nClusters = 3;  // Number of clusters
    // const kmeans = new KMeans({ nClusters });
    // const { clusters, centroids } = kmeans(places, nClusters);
    let { clusters, centroids } = kmeans(places, nClusters);
    console.log(clusters)
    console.log(centroids)

    // Balance the clusters
    const desiredGroupSize = Math.ceil(features.length / nClusters);
    const groupSizes = new Array(nClusters).fill(0);

    clusters.forEach(clusterIndex => {
      groupSizes[clusterIndex]++;
    });


    for (let i = 0; i < nClusters; i++) {
      while (groupSizes[i] > desiredGroupSize) {
        // Find the cluster with the most excess places
        const maxExcessClusterIndex = groupSizes.indexOf(Math.max(...groupSizes));

        // Find the closest place to the centroid of the cluster with the most excess places
        const centroid = centroids[maxExcessClusterIndex];
        let closestDistance = Infinity;
        let closestPlaceIndex = -1;

        clusters.forEach((clusterIndex, placeIndex) => {
          if (clusterIndex === maxExcessClusterIndex) {
            const distance = Math.sqrt(
              (places[placeIndex][0] - centroid[0]) ** 2 +
              (places[placeIndex][1] - centroid[1]) ** 2
            );

            if (distance < closestDistance) {
              closestDistance = distance;
              closestPlaceIndex = placeIndex;
            }
          }
        });

        // Move the closest place to the cluster with the fewest places
        const minClusterIndex = groupSizes.indexOf(Math.min(...groupSizes));
        clusters[closestPlaceIndex] = minClusterIndex;

        // Update group sizes
        groupSizes[minClusterIndex]++;
        groupSizes[maxExcessClusterIndex]--;
      }
    }
    console.log(clusters);
    // for (let i=0; i<nClusters; i++) {
    //   for (letj=0; j<clusters[i].length; j++){
    //     console.log(clusters[i][j])
    //   }
    // }
  })
  .catch(error => {
    console.error('Error fetching data:', error);
  });

// Define routes
app.get('/', (req, res) => {
  res.send('Hello World!');
});

// Start the server
mongoose.connect('mongodb://localhost:27017/easy-trip', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(5000, () => {
      console.log('Server started on port 5000');
    });
  })
  .catch(err => console.log(err));
