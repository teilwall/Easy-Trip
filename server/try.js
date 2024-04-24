const fetch = require("node-fetch");

// Define the latitude and longitude coordinates for the search area
const latitude = 48.8566; // Example latitude (Paris)
const longitude = 2.3522; // Example longitude (Paris)
const radius = 10000; // Example radius in meters

// Define the Overpass query
const query = `
[out:json];
(
  node(around:${radius},${latitude},${longitude})["tourism"="attraction"];
  way(around:${radius},${latitude},${longitude})["tourism"="attraction"];
  relation(around:${radius},${latitude},${longitude})["tourism"="attraction"];
);
out;
`;

// Execute the Overpass query
fetch("https://overpass-api.de/api/interpreter", {
  method: "POST",
  body: query,
})
  .then((response) => response.json())
  .then((data) => {
    // Define a function to count tags
    const countTags = (element) => Object.keys(element.tags || {}).length;

    // Extract the elements and their tag counts
    const elements = data.elements || [];

    // Sort the elements by the number of tags (in descending order)
    const sortedElements = elements.sort((a, b) => countTags(b) - countTags(a));

    // Print the top 30 places with the most tags
    for (let i = 0; i < Math.min(30, sortedElements.length); i++) {
      const element = sortedElements[i];
      console.log(`${i + 1}. Tags Count: ${countTags(element)} - Tags: ${JSON.stringify(element.tags || {})}`);
    }
  })
  .catch((error) => {
    console.error("Error fetching data:", error);
  });
