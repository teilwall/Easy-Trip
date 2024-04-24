const axios = require('axios');
const { kmeans } = require('ml-kmeans');

class TripOSM {
    RADIUS = 10000;
    KINDS = ['["tourism"="attraction"]'];
    SELECT_KINDS = {
        'Art&Cultural': ['["amenity"="place_of_worship"]', '["historic"="memorials"]', '["historic"="monument"]', '["tourism"="gallery"]','["tourism"="artwork"]'],
        'Historical': ['["historic"="castle"]', '["historic"="building"]', '["historic"="battlefield"]', '["historic"="archaeological_site"]'],
        'Shopping': ['["shop"="mall"]'],
        'Amusement Parks': ['["leisure"="amusement_park"]'],
        'Museums': ['["tourism"="museum"]'],
        'Outdoor Adventures': ['["tourism"="viewpoint"]', '["natural"="cave_entrance"]', '["natural"="waterfall"]', '["natural"="peak"]']

    }

    constructor( city, lat, lon, fromDate, toDate, choosenKinds ) {
        this.city = city;
        this.lat = lat;
        this.lon =lon;
        this.fromDate = fromDate;
        this.toDate = toDate;
        this.choosenKinds = [];
        for (var kind of choosenKinds) {
            this.choosenKinds.push(...this.SELECT_KINDS[kind]);
        }
        // console.log(choosenKinds);
    }

    setQuery(lat, lon, kinds) {
        var queryBody = "";
        for (var kind of kinds) {
            queryBody += `nwr${kind}(around:${this.RADIUS},${lat},${lon});`;
        }
        const query = `
        [out:json];
        (
          ${queryBody}
        );
        out center;
        `;
        return query
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

    combinePlaces(defaultPlaces, userPlaces, days) {
        // Filter userPlaces that are not in defaultPlaces
        const filteredUserPlaces = userPlaces.filter(userPlace => {
            return defaultPlaces.some(defaultPlace => this.isEqual(defaultPlace, userPlace));
        });
    
        const combinedPlaces = [];
        const minRequiredSize = Math.ceil(days * 3 / 2);
        const totalRequiredSize = days * 3;
        const minTotalRequiredSize = days * 2;

        // IMPROVE LOGIC!!!!
        // If both defaultPlaces and filteredUserPlaces have at least minRequiredSize items
        if (defaultPlaces.length >= minRequiredSize && filteredUserPlaces.length >= minRequiredSize) {
            // Take the first minRequiredSize items from both arrays
            combinedPlaces.push(...defaultPlaces.slice(0, minRequiredSize));
            combinedPlaces.push(...filteredUserPlaces.slice(0, minRequiredSize));
        } else if (defaultPlaces.length + filteredUserPlaces.length >= totalRequiredSize) {
            // If one of the arrays has less than minRequiredSize items
            if (defaultPlaces.length < minRequiredSize && filteredUserPlaces.length >= minRequiredSize) {
                // Take all items from filteredUserPlaces and complete the rest from defaultPlaces
                combinedPlaces.push(...defaultPlaces);
                const remainingPlaces = totalRequiredSize - combinedPlaces.length;
                combinedPlaces.push(...filteredUserPlaces.slice(0, remainingPlaces));
            } else if (defaultPlaces.length >= minRequiredSize && filteredUserPlaces.length < minRequiredSize) {
                // Take all items from defaultPlaces and complete the rest from filteredUserPlaces
                combinedPlaces.push(...filteredUserPlaces);
                const remainingPlaces = totalRequiredSize - combinedPlaces.length;
                combinedPlaces.push(...defaultPlaces.slice(0, remainingPlaces));
            } else if(defaultPlaces.length + filteredUserPlaces.length >= minTotalRequiredSize){
                // Combine both arrays until the total size reaches the required size
                combinedPlaces.push(...defaultPlaces);
                combinedPlaces.push(...filteredUserPlaces);
            } else {
                // If neither of the arrays individually meets the requirement, and their total size is not enough
                console.log("Not enough places.");
                return [];
            }
        } 

        // Define a function to extract information about each element
        const extractInfo = (element) => {
            const info = {
                english_name: "",
                original_name: element.tags && element.tags.name ? element.tags.name : "",
                lat: undefined,
                lon: undefined,
                image: ""
            };
            if (element.tags && element.tags['name:en']) {
                info.english_name = element.tags['name:en'];
            }
            if (element.tags && element.tags.image) {
                info.image = element.tags.image;
            }
            if (element.type === "node") {
                info.lat = element.lat;
                info.lon = element.lon;
            } else if (element.type === "way" || element.type === "relation") {
                // Fetch ways contained in the relation
                info.lat = element.center.lat;
                info.lon = element.center.lon;
            }
            return info; 
        };

        const finalPlaces = combinedPlaces.map(extractInfo);
        return finalPlaces;
    }
    
    // Function to check if two objects are equal
    isEqual(obj1, obj2) {
        return JSON.stringify(obj1) === JSON.stringify(obj2);
    }

    clusterPlaces(combined, days) {
        // Apply K-means clustering
        const placesCoordinates = combined.map(place => [place.lon, place.lat]);
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
            var place = JSON.stringify(combined[i]);

            // Check if the cluster key exists in the hashmap
            if (!placesMap.hasOwnProperty(cluster)) {
                // If not, initialize it with an empty array
                placesMap[cluster] = [];
            }

            // Push the current place into the corresponding cluster key's array
            placesMap[cluster].push(place);
        }
        console.log(placesMap);
        return placesMap;
    }

    createTrip() {
        return new Promise((resolve, reject) => {
            // Get common tourist attractions
            var defaultPlaces = [];
            const defaultQuery = this.setQuery(this.lat, this.lon ,this.KINDS);
            fetch("https://overpass-api.de/api/interpreter", {
                method: "POST",
                body: defaultQuery,
            })
            .then((response) => response.json())
            .then((data) => {
                const countTags = (element) => Object.keys(element.tags || {}).length;

                // Extract information about each element
                const elements = data.elements || [];
                const sortedElements = elements.sort((a,b) => countTags(b)-countTags(a));

                // Push the top 30 places with the most tags to the defaultPlaces array
                for (let i = 0; i < Math.min(30, sortedElements.length); i++) {
                    defaultPlaces.push(sortedElements[i]);
                }

                // console.log(defaultPlaces);
            })
            .catch((error) => {
                console.error("Error fetching default data:", error);
            });

            // Get user specific destinations
            var userPlaces = [];
            const userQuery = this.setQuery(this.lat, this.lon, this.choosenKinds);
            fetch("https://overpass-api.de/api/interpreter", {
                method: "POST",
                body: userQuery,
            })
            .then((response) => response.json())
            .then((data) => {
                const countTags = (element) => Object.keys(element.tags || {}).length;

                // Extract information about each element
                const elements = data.elements || [];
                const sortedElements = elements.sort((a,b) => countTags(b)-countTags(a));

                // Push the top 30 places with the most tags to the defaultPlaces array
                for (let i = 0; i < Math.min(30, sortedElements.length); i++) {
                    userPlaces.push(sortedElements[i]);
                }

                // Log the usertPlaces array
                // console.log(userPlaces);

                const days = this.getDaysDifference(this.fromDate, this.toDate);
                const places = this.combinePlaces(defaultPlaces, userPlaces, days);
                const placesMap = this.clusterPlaces(places, days);

                resolve(placesMap);
            }).catch(error => {
                console.log("Error fetching data in Trip:, ", error);
                reject(error)
            })
        })
    }
}

// var trip = new TripOSM( city='Paris', lat=48.864716, lon=2.349014, fromDate='25/04/2024', toDate='30/04/2024', choosenKinds=["Art&Cultural", "Historic"] );
// const places = trip.createTrip
// console.log([places]);
module.exports = TripOSM;