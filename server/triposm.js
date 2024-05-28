const { kmeans } = require('ml-kmeans');
const { performance } = require('perf_hooks');

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
    FOOD_PLACE = {
        'cheap': ['["amenity"="fast_food"]'],
        "normal": ['["amenity"="cafe"]'],
        "gold card": ['["amenity"="restaurant"]']
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

    combinePlaces(defaultPlaces, userPlaces, days) {
        const combinedPlaces = [];
        var minTotalRequiredSize;
        var totalRequiredSize;
        var minRequiredSize;
        if (this.placesPerDay === '1-2') {
            minTotalRequiredSize = days * 1;
            totalRequiredSize = days * 2;
            minRequiredSize = days;
        } else {
            minTotalRequiredSize = days * 3;
            totalRequiredSize = days * 4;
            minRequiredSize = days*2;
        }

        // If both defaultPlaces and userPlaces have at least minRequiredSize items
        if (defaultPlaces.length >= minRequiredSize && userPlaces.length >= minRequiredSize) {
            // Take the first minRequiredSize items from both arrays
            combinedPlaces.push(...defaultPlaces.slice(0, minRequiredSize));
            combinedPlaces.push(...userPlaces.slice(0, minRequiredSize));
        } else if (defaultPlaces.length + userPlaces.length >= totalRequiredSize) {
            // If one of the arrays has less than minRequiredSize items
            if (defaultPlaces.length < minRequiredSize && userPlaces.length >= minRequiredSize) {
                // Take all items from userPlaces and complete the rest from defaultPlaces
                combinedPlaces.push(...defaultPlaces);
                const remainingPlaces = totalRequiredSize - combinedPlaces.length;
                combinedPlaces.push(...userPlaces.slice(0, remainingPlaces));
            } else if (defaultPlaces.length >= minRequiredSize && userPlaces.length < minRequiredSize) {
                // Take all items from defaultPlaces and complete the rest from userPlaces
                combinedPlaces.push(...userPlaces);
                const remainingPlaces = totalRequiredSize - combinedPlaces.length;
                combinedPlaces.push(...defaultPlaces.slice(0, remainingPlaces));
            }
        }  else if(defaultPlaces.length + userPlaces.length >= minTotalRequiredSize){
            // Combine both arrays until the total size reaches the required size
            combinedPlaces.push(...defaultPlaces);
            combinedPlaces.push(...userPlaces);
        } else {
            // If neither of the arrays individually meets the requirement, and their total size is not enough
            // console.log("Not enough places.");
            return [];
        } 

        return combinedPlaces;
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
    
    rearrangePlacesWithinMap(placesMap) {
        for (const cluster in placesMap) {
            if (placesMap.hasOwnProperty(cluster)) {
                placesMap[cluster] = this.rearrangePlacesWithinCluster(placesMap[cluster]);
            }
        }
        return placesMap;
    }

    // Function to calculate the total distance for a given arrangement of places
    calculateTotalDistance(arrangement) {
        var totalDistance = 0;
        for (var i = 1; i < arrangement.length; i++) {
            totalDistance += this.calculateDistance(arrangement[i - 1], arrangement[i]);
        }
        return totalDistance;
    }
    

    clusterPlaces(combined, days) {
        // Apply K-means clustering
        if(combined.length === 0){
            // console.log("We are sorry but we do not support this city for now. Maybe another city?");
            return {}
        }

        if (days === 1) {
            return {0: combined}
        } 

        const placesCoordinates = combined.map(place => [place.lon, place.lat]);
        let { clusters, centroids } = kmeans(placesCoordinates, days);

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

        return placesMap;
    }

    // Function to fetch English description and image URL from Wikidata API based on Wikidata ID
    async fetchDescriptionsAndImages(placesMap) {
        try {
            // Collect all unique Wikidata IDs from placesMap
            const wikidataIds = new Set();
            for (const cluster in placesMap) {
                if (placesMap.hasOwnProperty(cluster)) {
                    for (const place of placesMap[cluster]) {
                        if (place.wikidata) {
                            wikidataIds.add(place.wikidata);
                        }
                    }
                }
            }
    
            if (wikidataIds.size === 0) {
                // console.log("No Wikidata IDs found.");
                return placesMap;
            }
    
            // Build the API request URL for all Wikidata IDs
            const idsString = Array.from(wikidataIds).join('|');
            const url = "https://www.wikidata.org/w/api.php";
            const params = new URLSearchParams({
                action: "wbgetentities",
                ids: idsString,
                format: "json",
                origin: "*"
            });
    
            // Fetch data from Wikidata
            const response = await fetch(`${url}?${params.toString()}`);
            if (!response.ok) {
                console.error(`Failed to fetch data from: ${url}`);
                throw new Error(`Failed to fetch data from Wikidata: ${response.statusText}`);
            }
            const data = await response.json();
    
            // Update placesMap with descriptions and images
            for (const cluster in placesMap) {
                if (placesMap.hasOwnProperty(cluster)) {
                    for (const place of placesMap[cluster]) {
                        if (place.wikidata && data.entities[place.wikidata]) {
                            const entity = data.entities[place.wikidata];
                            place.description = entity.descriptions?.en?.value || 'No description available';
                            const imageClaims = entity.claims?.P18 || [];
                            place.image = imageClaims.length > 0 ? `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(imageClaims[0].mainsnak.datavalue.value)}` : place.image;
                        }
                    }
                }
            }
    
            return placesMap;
        } catch (error) {
            console.error('Error fetching data from Wikidata:', error);
            return placesMap;
        }
    }
    
    addFoodPlaces(placesMap, foodPlaces) {
        for (const cluster in placesMap) {
            if (placesMap.hasOwnProperty(cluster)) {
                const clusterPlaces = placesMap[cluster];
                if (clusterPlaces.length > 2) {
                    // Add one food place closest to the 2nd place
                    const secondPlace = clusterPlaces[1];
                    const closestFoodPlaceToSecond = this.findClosestFoodPlace(secondPlace.lat, secondPlace.lon, foodPlaces);
                    if (closestFoodPlaceToSecond) {
                        placesMap[cluster].splice(2, 0, closestFoodPlaceToSecond);
                    }
    
                    // Add one more food place closest to the last place
                    const lastPlace = clusterPlaces[clusterPlaces.length - 1];
                    const closestFoodPlaceToLast = this.findClosestFoodPlace(lastPlace.lat, lastPlace.lon, foodPlaces);
                    if (closestFoodPlaceToLast) {
                        placesMap[cluster].push(closestFoodPlaceToLast);
                    }
                } else if (clusterPlaces.length <= 2 && clusterPlaces.length > 0) {
                    // Add one food place closest to the last place
                    const lastPlace = clusterPlaces[clusterPlaces.length - 1];
                    const closestFoodPlaceToLast = this.findClosestFoodPlace(lastPlace.lat, lastPlace.lon, foodPlaces);
                    if (closestFoodPlaceToLast) {
                        placesMap[cluster].push(closestFoodPlaceToLast);
                    }
                    const newLastPlace = clusterPlaces[clusterPlaces.length - 1];
                    const closestFoodPlaceToNewLast = this.findClosestFoodPlace(newLastPlace.lat, newLastPlace.lon, foodPlaces);
                    if (closestFoodPlaceToNewLast) {
                        placesMap[cluster].push(closestFoodPlaceToNewLast);
                    }
                }
            }
        }
        return placesMap;
    }

    findClosestFoodPlace(lat, lon, foodPlaces) {
        let closestDistance = Infinity;
        let closestPlace = null;
    
        for (const place of foodPlaces) {
            const distance = this.calculateDistance({ lat, lon }, { lat: place.lat, lon: place.lon });
            if (distance > 0 && distance < closestDistance) {
                closestDistance = distance;
                closestPlace = place;
            }
        }
        return closestPlace;
    }

    
    async osmRequest() {
        const kinds = this.KINDS.concat(this.choosenKinds, this.FOOD_PLACE[this.budget]);
        const query = this.setQuery(this.lat, this.lon, kinds);
        try {
            const response = await fetch("https://overpass-api.de/api/interpreter", {
                method: "POST",
                body: query,
            });
            if (!response.ok) {
                throw new Error('Failed to fetch OSM data');
            }
            const data = await response.json();
            return this.filterPlaces(data);
        } catch (error) {
            console.error("Error fetching OSM data:", error);
            return {};
        }
    }
    
    filterPlaces(data) {
        let defaultPlaces = [];
        let userPlaces = [];
        let foodPlaces = [];
    
        const countTags = (element) => Object.keys(element.tags || {}).length;
        const elements = data.elements || [];
        const sortedElements = elements.sort((a, b) => countTags(b) - countTags(a));
    
        const amenities = ["cafe", "fast_food", "restaurant"];
        for (const element of sortedElements) {
            if (element.tags && element.tags.tourism === "attraction") {
                defaultPlaces.push(element);
            } else if (element.tags && element.tags.amenity && amenities.includes(element.tags.amenity)) {
                foodPlaces.push(element);
            }  else {
                userPlaces.push(element);
            }
        }

        // Limit the arrays to the specified lengths
        defaultPlaces = defaultPlaces.slice(0, 40).map(this.extractInfo);
        userPlaces = userPlaces.slice(0, 40).map(this.extractInfo);
        foodPlaces = foodPlaces.slice(0, 1000).map(this.extractInfo);

        return { defaultPlaces, userPlaces, foodPlaces };
    }

    extractInfo(element) {
        const amenities = ["cafe", "fast_food", "restaurant"];
        const info = {
            english_name: "",
            original_name: element.tags && element.tags.name ? element.tags.name : "",
            lat: undefined,
            lon: undefined,
            image: "",
            wikidata: "",
            food: element.tags && element.tags.amenity && amenities.includes(element.tags.amenity) ? "yes" : "no"
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
    
    async createTrip() {
        try {
            const { defaultPlaces, userPlaces, foodPlaces } = await this.osmRequest();
            const days = this.getDaysDifference(this.fromDate, this.toDate);
            const places = this.combinePlaces(defaultPlaces, userPlaces, days);
            // console.log(places);
            let placesMap = this.clusterPlaces(places, days);
            placesMap = this.rearrangePlacesWithinMap(placesMap);
            placesMap = this.addFoodPlaces(placesMap, foodPlaces);
            placesMap = await this.fetchDescriptionsAndImages(placesMap);

            return JSON.stringify(placesMap);
        } catch (error) {
            console.error("Error creating trip:", error);
            return {};
        }
    }
}

module.exports = TripOSM;