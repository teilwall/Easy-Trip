const axios = require('axios');
const { kmeans } = require('ml-kmeans');

class Trip {
    APIKEY = '5ae2e3f221c38a28845f05b64dd7ece8b4aea86eae0408d62e973b96';
    RADIUS = 1000;
    PRIORITY = 'tourist'
    KINDS = ['bridges', 'historic_architecture', 'towers', 'museums', 'fortifications', 'religion', 'skyscrapers', 'other', 'urban_environment'];
    SELECT_KINDS = {
        'Art&Cultural': ['religion', 'historic_architecture', 'towers', 'bridges'],
        'Historical': ['fortifications', 'monuments_and_memorials'],
        'Shopping': ['malls'],
        'Amusement Parks': ['amusement_parks'],
        'Museums': ['museums'],
        'Outdoor Adventures': ['natural', 'other']

    }

    constructor( cityName, lat, lon, fromDate, toDate, choosenKinds ) {
        this.cityName = cityName;
        this.lat = lat;
        this.lon = lon;
        this.fromDate = fromDate;
        this.toDate = toDate;
        this.choosenKinds = [];
        for (var kind of choosenKinds) {
            this.choosenKinds.push(...this.SELECT_KINDS[kind]);
        }
    }

    getDaysDifference(date1, date2) {
        // Parse date strings to extract day, month, and year
        var parts1 = date1.split("/");
        var parts2 = date2.split("/");
        
        // Create Date objects with parsed components (months are zero-based)
        var d1 = new Date(parts1[2], parts1[1] - 1, parts1[0]);
        var d2 = new Date(parts2[2], parts2[1] - 1, parts2[0]);
        
        // Calculate the difference in milliseconds
        var differenceInMilliseconds = d2 - d1;
        
        // Convert milliseconds to days
        var differenceInDays = differenceInMilliseconds / (1000 * 60 * 60 * 24);
        
        // Return the number of days (rounded to the nearest whole number)
        return Math.round(differenceInDays);
    }

    createTrip() {
        return new Promise((resolve, reject) => {
            var defaultFeatures = [];
            axios.get(`https://api.opentripmap.com/0.1/en/places/radius?radius=${this.RADIUS}&lon=${this.lon}&lat=${this.lat}&kinds=${this.KINDS}&priority=${this.PRIORITY}&apikey=${this.APIKEY}`).
            then(response => {
                defaultFeatures = response.data.features;
            }).catch(error => {
                console.log("Error fetching data in Trip:, ", error);
            })
            axios.get(`https://api.opentripmap.com/0.1/en/places/radius?radius=${this.RADIUS}&lon=${this.lon}&lat=${this.lat}&kinds=${this.choosenKinds}&priority=${this.PRIORITY}&apikey=${this.APIKEY}`).
            then(response => {
                const features = response.data.features;
                const days = this.getDaysDifference(this.fromDate, this.toDate);
                const minNumberOfPlaces = days*2;
                const maxNumberOfPlaces = days*3;
                var places = [];

                if (features.length >= maxNumberOfPlaces ){
                    places = features.slice(0, maxNumberOfPlaces);
                } else if (features.length < maxNumberOfPlaces && features.length >= minNumberOfPlaces) {
                    places = features;
                } else if (defaultFeatures.length >= minNumberOfPlaces) {
                    var places = features;
                    var count = features.length;
                    for (var place of defaultFeatures) {
                        if (!places.includes(place)) {
                            places.push(place);
                            count++;
                            if (count > minNumberOfPlaces) {
                                break;
                            }
                        }
                    }
                } else {
                    console.log("Not enough places unfortunately!");
                    places = []
                }
                if ( places.length == 0 ) {
                    return {}
                }

                // Apply K-means clustering
                const placesCoordinates = places.map(place => [place.geometry.coordinates[1], place.geometry.coordinates[0]]);
                let { clusters, centroids } = kmeans(placesCoordinates, days);

                // Balance the clusters
                const desiredGroupSize = Math.ceil(placesCoordinates.length / days);
                const groupSizes = new Array(days).fill(0);

                clusters.forEach(clusterIndex => {
                groupSizes[clusterIndex]++;
                });

                for (let i = 0; i < days; i++) {
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
                            (placesCoordinates[placeIndex][0] - centroid[0]) ** 2 +
                            (placesCoordinates[placeIndex][1] - centroid[1]) ** 2
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

                var placesMap = {};

                // Iterate over the clusters array and places array simultaneously
                for (var i = 0; i < clusters.length; i++) {
                    var cluster = clusters[i];
                    var place =[places[i].properties.name, places[i].properties.wikidata, [places[i].geometry.coordinates[1], places[i].geometry.coordinates[0]]];

                    // Check if the cluster key exists in the hashmap
                    if (!placesMap.hasOwnProperty(cluster)) {
                        // If not, initialize it with an empty array
                        placesMap[cluster] = [];
                    }

                    // Push the current place into the corresponding cluster key's array
                    placesMap[cluster].push(place);
                }

                resolve(placesMap);
            }).catch(error => {
                console.log("Error fetching data in Trip:, ", error);
                reject(error)
            })
        })
    }
}

module.exports = Trip;