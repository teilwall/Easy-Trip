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

    constructor( city, lat, lon, fromDate, toDate, choosenKinds, placesPerDay, numPeople, budget ) {
        this.city = city;
        this.lat = lat;
        this.lon =lon;
        this.fromDate = fromDate;
        this.toDate = toDate;
        this.choosenKinds = [];
        for (var kind of choosenKinds) {
            this.choosenKinds.push(...this.SELECT_KINDS[kind]);
        }
        this.placesPerDay = placesPerDay;
        this.numPeople = numPeople;
        this.budget = budget;
    }

    setQuery(lat, lon, kinds, radius=this.RADIUS) {
        var queryBody = "";
        for (var kind of kinds) {
            queryBody += `nwr${kind}(around:${radius},${lat},${lon});`;
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
        // Extract date part from date strings
        var parts1 = date1.split("T")[0].split("-");
        var parts2 = date2.split("T")[0].split("-");
        
        // Create Date objects with parsed components
        var d1 = new Date(parts1[0], parts1[1] - 1, parts1[2]);
        var d2 = new Date(parts2[0], parts2[1] - 1, parts2[2]);
        
        // Calculate the difference in milliseconds
        var differenceInMilliseconds = d2 - d1;
        
        // Convert milliseconds to days
        var differenceInDays = differenceInMilliseconds / (1000 * 60 * 60 * 24);
        
        // Return the number of days (rounded to the nearest whole number)
        return Math.round(differenceInDays)+1;
    }    

    combinePlaces(defaultPlaces, userPlaces, days, placesPerDay) {
        // Filter userPlaces that are in defaultPlaces
        const filteredUserPlaces = userPlaces.filter(userPlace => {
            return !defaultPlaces.some(defaultPlace => this.isEqual(defaultPlace, userPlace));
        });
    
        const combinedPlaces = [];
        var minTotalRequiredSize;
        var totalRequiredSize;
        var minRequiredSize;
        if (this.placesPerDay === '1-2') {
            minTotalRequiredSize = days * 1;
            totalRequiredSize = days * 2;
            minRequiredSize = days;
        } else if (this.placesPerDay === '3-4') {
            minTotalRequiredSize = days * 3;
            totalRequiredSize = days * 4;
            minRequiredSize = days*2;
        } else {
            console.log('placesPerDay is not recieved!');
        }

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
                image: "",
                wikidata: "",
                food: "no"
            };
            if (element.tags && element.tags['name:en']) {
                info.english_name = element.tags['name:en'];
            }
            if (element.tags && element.tags.image) {
                info.image = element.tags.image;
            }
            if (element.tags && element.tags.wikidata) {
                info.wikidata = element.tags.wikidata;
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

    // Function to calculate the distance between two places
    calculateDistance(place1, place2) {
        var lat1 = place1.lat;
        var lon1 = place1.lon;
        var lat2 = place2.lat;
        var lon2 = place2.lon;

        // Calculate distance using some formula (e.g., Haversine formula)
        // For simplicity, let's assume the distance is just the absolute difference
        return Math.abs(lat2 - lat1) + Math.abs(lon2 - lon1);
    }

    // Function to rearrange places within each cluster
    // rearrangePlacesWithinCluster(cluster) {
    //     var rearrangedPlaces = [];
    //     var remainingPlaces = cluster.slice(); // Create a copy of the places array

    //     // Start with the first place
    //     rearrangedPlaces.push(remainingPlaces.shift());

    //     // Repeat until all places are arranged
    //     while (remainingPlaces.length > 0) {
    //         var lastPlace = rearrangedPlaces[rearrangedPlaces.length - 1];
    //         var nearestPlaceIndex = null;
    //         var nearestDistance = Infinity;

    //         // Find the nearest remaining place
    //         for (var i = 0; i < remainingPlaces.length; i++) {
    //             var distance = this.calculateDistance(lastPlace, remainingPlaces[i]);
    //             if (distance < nearestDistance) {
    //                 nearestPlaceIndex = i;
    //                 nearestDistance = distance;
    //             }
    //         }

    //         // Add the nearest place to the rearranged list
    //         rearrangedPlaces.push(remainingPlaces.splice(nearestPlaceIndex, 1)[0]);
    //     }

    //     return rearrangedPlaces;
    // }

    rearrangePlacesWithinCluster(cluster) {
        var minTotalDistance = Infinity;
        var optimalArrangement = [];
    
        // Iterate over each place as the starting point
        for (var startIndex = 0; startIndex < cluster.length; startIndex++) {
            var rearrangedPlaces = [];
            var remainingPlaces = cluster.slice(); // Create a copy of the places array
            var currentPlaceIndex = startIndex;
    
            // Start with the current place as the first place
            rearrangedPlaces.push(remainingPlaces.splice(currentPlaceIndex, 1)[0]);
    
            // Repeat until all places are arranged
            while (remainingPlaces.length > 0) {
                var lastPlace = rearrangedPlaces[rearrangedPlaces.length - 1];
                var nearestPlaceIndex = null;
                var nearestDistance = Infinity;
    
                // Find the nearest remaining place
                for (var i = 0; i < remainingPlaces.length; i++) {
                    var distance = this.calculateDistance(lastPlace, remainingPlaces[i]);
                    if (distance < nearestDistance) {
                        nearestPlaceIndex = i;
                        nearestDistance = distance;
                    }
                }
    
                // Add the nearest place to the rearranged list
                rearrangedPlaces.push(remainingPlaces.splice(nearestPlaceIndex, 1)[0]);
            }
    
            // Calculate total distance for this arrangement
            var totalDistance = this.calculateTotalDistance(rearrangedPlaces);
    
            // Update minimum total distance and optimal arrangement if necessary
            if (totalDistance < minTotalDistance) {
                minTotalDistance = totalDistance;
                optimalArrangement = rearrangedPlaces;
            }
        }
    
        return optimalArrangement;
    }
    
    // Function to calculate the total distance for a given arrangement of places
    calculateTotalDistance(arrangement) {
        var totalDistance = 0;
        for (var i = 1; i < arrangement.length; i++) {
            totalDistance += this.calculateDistance(arrangement[i - 1], arrangement[i]);
        }
        return totalDistance;
    }
    

    async clusterPlaces(combined, days) {
        // Apply K-means clustering
        if(combined.length == 0){
            console.log("We are sorry but we do not support this city for now. Maybe another city?");
            return {}
        }
        const placesCoordinates = combined.map(place => [place.lon, place.lat]);
        let { clusters, centroids } = kmeans(placesCoordinates, days);
        console.log(combined);
        console.log(clusters);
        // Balance the clusters
        const desiredGroupSize = Math.ceil(placesCoordinates.length / days);
        const groupSizes = new Array(days).fill(0);

        clusters.forEach(clusterIndex => {
            groupSizes[clusterIndex]++;
        });

        for (let i = 0; i < days; i++) {
            let deficitClusters = [];
            let excessClusters = [];
        
            // Identify clusters with deficit and excess places
            groupSizes.forEach((size, index) => {
                if (size < desiredGroupSize) {
                    deficitClusters.push(index);
                } else if (size > desiredGroupSize) {
                    excessClusters.push(index);
                }
            });
            // console.log("excess: ", excessClusters);
            // console.log("deficit: ", deficitClusters);
        
            // Balance deficit clusters with excess clusters
            deficitClusters.forEach(minClusterIndex => {
                const minClusterCentroid = centroids[minClusterIndex];
        
                let closestDistance = Infinity;
                let closestPlaceIndex = -1;
                let maxExcessClusterID;
                // Find the closest place from excess clusters to the deficit cluster centroid
                excessClusters.forEach(maxExcessClusterIndex => {
                    const maxExcessClusterCentroid = centroids[maxExcessClusterIndex];
        
                    clusters.forEach((clusterIndex, placeIndex) => {
                        if (clusterIndex === maxExcessClusterIndex) {
                            const distance = Math.sqrt(
                                (placesCoordinates[placeIndex][0] - minClusterCentroid[0]) ** 2 +
                                (placesCoordinates[placeIndex][1] - minClusterCentroid[1]) ** 2
                            );
        
                            if (distance < closestDistance) {
                                maxExcessClusterID = maxExcessClusterIndex;
                                closestDistance = distance;
                                closestPlaceIndex = placeIndex;
                            }
                        }
                    });
                });
        
                // Move the closest place to the deficit cluster only if group sizes allow
                // console.log("groupSize: ", groupSizes, "minClusterIndex: ", minClusterIndex, "clPLin: ", closestPlaceIndex, clusters[closestPlaceIndex], "desired: ", desiredGroupSize);
                if (groupSizes[minClusterIndex] < desiredGroupSize && groupSizes[clusters[closestPlaceIndex]] > desiredGroupSize) {
                    clusters[closestPlaceIndex] = minClusterIndex;
                
                    // Update group sizes
                    groupSizes[minClusterIndex]++;
                    groupSizes[maxExcessClusterID]--; 
                    // console.log("inside if: ", groupSizes);
                }
            });
        }
        
        var placesMap = {};

        // Iterate over the clusters array and places array simultaneously
        for (var i = 0; i < clusters.length; i++) {
            var cluster = clusters[i];
            var place = combined[i];

            if (!placesMap.hasOwnProperty(cluster)) {
                placesMap[cluster] = [];
            }

            placesMap[cluster].push(place);
        }
        console.log(placesMap);

        for (var cluster in placesMap) {
            if (placesMap.hasOwnProperty(cluster)) {
                placesMap[cluster] = this.rearrangePlacesWithinCluster(placesMap[cluster]);
            }
        }

        // add foodPlaces
        for (var cluster in placesMap) {
            if (placesMap.hasOwnProperty(cluster)) {
                if (placesMap[cluster].length <= 2) {
                    const lat = placesMap[cluster][placesMap[cluster].length-1].lat;
                    const lon = placesMap[cluster][placesMap[cluster].length-1].lon;
                    const foodPlaces = await this.addFoodPlaces(lat, lon, 1000, this.budget, 2);
                    // console.log("before len", foodPlaces);
                    if (foodPlaces.length != 0) {
                        // console.log("len: ", foodPlaces.length);
                        placesMap[cluster].push(...foodPlaces);
                    }
                } else {
                    const lat1 = placesMap[cluster][1].lat;
                    const lon1 = placesMap[cluster][1].lon;
                    let firstFoodPlace = await this.addFoodPlaces(lat1, lon1, 1000, this.budget, 1);
                    const lat2 = placesMap[cluster][placesMap[cluster].length-1].lat;
                    const lon2 = placesMap[cluster][placesMap[cluster].length-1].lon;
                    let secondFoodPlace = await this.addFoodPlaces(lat2, lon2, 1000, this.budget, 1);
                    placesMap[cluster].splice(2, 0, firstFoodPlace);
                    placesMap[cluster].push(secondFoodPlace);

                }
            }
        }

        // add description and image
        for (const placeId in placesMap) {
            const placeObjects = placesMap[placeId];
            // Iterate over the objects in the value list
            for (const placeObject of placeObjects) {
                const wikidataId = placeObject.wikidata;
                // Fetch description and image for the Wikidata ID
                
                if (wikidataId === ""){
                    continue;
                }
                const { description, imageUrl } = await this.fetchDescriptionAndImage(wikidataId);
                // Update the object with the fetched data
                placeObject.description = description;
                if (imageUrl) placeObject.image = imageUrl;
            }
        }

        // console.log(placesMap);
        placesMap[-1] = {
            city: this.city,
            lat: this.lat,
            lon: this.lon,
            fromDate: this.fromDate,
            toDate: this.toDate,
            numPeople: this.numPeople
        }
        return JSON.stringify(placesMap);
    }

    // Function to fetch English description and image URL from Wikidata API based on Wikidata ID
    async fetchDescriptionAndImage(wikidataId) {
        try {
            // Construct the URL for the Wikidata API
            const apiUrl = `https://www.wikidata.org/wiki/Special:EntityData/${wikidataId}.json`;
            // Fetch data from Wikidata API
            const response = await fetch(apiUrl);
            // Check if the request was successful
            if (!response.ok) {
                throw new Error('Failed to fetch data from Wikidata.');
            }
            // Parse the response as JSON
            const data = await response.json();

            // Extract English description and image URL from the JSON data
            const entity = data.entities[wikidataId];
            const description = entity.descriptions?.en?.value || 'No description available';
            const imageClaims = entity.claims?.P18 || [];
            const imageUrl = imageClaims.length > 0 ? `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(imageClaims[0].mainsnak.datavalue.value)}` : null;

            // Return the extracted data
            return { description, imageUrl };
        } catch (error) {
            // Handle any errors that occur during the process
            console.error('Error fetching data from Wikidata:', error);
            return null;
        }
    }

    addFoodPlaces(lat, lon, radius, budget, num) {
        return new Promise((resolve, reject) => {
            let kind = "";
            if (budget === 'cheap') {
                kind = '["amenity"="fast_food"]';
            } else if ( budget === "normal" ) {
                kind = '["amenity"="cafe"]';
            } else if ( budget === "gold card") {
                kind = '["amenity"="restaurant"]';
            } else {
                console.log("Budget not setted!");
                return;
            }
            const query = this.setQuery(lat, lon, [kind], radius);
            fetch("https://overpass-api.de/api/interpreter", {
                method: "POST",
                body: query,
            })
            .then((response) => response.json())
            .then((data) => {
                const countTags = (element) => Object.keys(element.tags || {}).length;

                // Extract information about each element
                const elements = data.elements || [];
                const sortedElements = elements.sort((a,b) => countTags(b)-countTags(a));

                const extractInfo = (element) => {
                    const info = {
                        english_name: "",
                        original_name: element.tags && element.tags.name ? element.tags.name : "",
                        lat: undefined,
                        lon: undefined,
                        image: "",
                        wikidata: "",
                        food: "yes"
                    };
                    if (element.tags && element.tags['name:en']) {
                        info.english_name = element.tags['name:en'];
                    }
                    if (element.tags && element.tags.image) {
                        info.image = element.tags.image;
                    }
                    if (element.tags && element.tags.wikidata) {
                        info.wikidata = element.tags.wikidata;
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
                // console.log("num", num, sortedElements);
                if (num == 2 && sortedElements.length >= 2) {
                    const foodPlace = extractInfo(sortedElements[0]);
                    const foodPlace2 = extractInfo(sortedElements[1]);
                    console.log("double", foodPlace, foodPlace2);
                    resolve([foodPlace, foodPlace2]);
                } else if (num == 2 && sortedElements.length < 2) {
                    console.log("NOT FOUND");
                    return [];
                }
                if (sortedElements.length > 0) {
                    const foodPlace = extractInfo(sortedElements[0]);
                    console.log("single", foodPlace);
                    resolve(foodPlace);
                } else {
                    console.log("NO FOOD PLACE");
                    return [];
                }
                
            })
            .catch((error) => {
                console.error("Error fetching default data:", error);
                reject(error);
            });

        });
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
                for (let i = 0; i < Math.min(40, sortedElements.length); i++) {
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
                for (let i = 0; i < Math.min(40, sortedElements.length); i++) {
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

module.exports = TripOSM;