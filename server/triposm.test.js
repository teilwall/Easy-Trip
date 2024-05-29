const TripOSM = require('./TripOSM');
const { kmeans } = require('ml-kmeans');
const { performance } = require('perf_hooks');

jest.mock('ml-kmeans', () => ({
    kmeans: jest.fn(() => ({
        clusters: [0, 1, 1, 0],
        centroids: [[0, 0], [1, 1]]
    }))
}));

describe('TripOSM', () => {
    describe('Basic Functionality', () => {
        let trip;
        const city = 'Test City';
        const lat = 40.7128;
        const lon = -74.0060;
        const fromDate = '2023-05-01T00:00:00Z';
        const toDate = '2023-05-05T00:00:00Z';
        const choosenKinds = ['Art&Cultural', 'Museums'];
        const placesPerDay = '1-2';
        const numPeople = 2;
        const budget = 'normal';

        beforeEach(() => {
            trip = new TripOSM(city, lat, lon, fromDate, toDate, choosenKinds, placesPerDay, numPeople, budget);
        });

        test('should initialize with correct values', () => {
            expect(trip.city).toBe(city);
            expect(trip.lat).toBe(lat);
            expect(trip.lon).toBe(lon);
            expect(trip.fromDate).toBe(fromDate);
            expect(trip.toDate).toBe(toDate);
            expect(trip.choosenKinds).toEqual(expect.arrayContaining([
                '["amenity"="place_of_worship"]',
                '["tourism"="museum"]'
            ]));
            expect(trip.placesPerDay).toBe(placesPerDay);
            expect(trip.numPeople).toBe(numPeople);
            expect(trip.budget).toBe(budget);
        });

        test('setQuery should generate correct query', () => {
            const kinds = ['["tourism"="attraction"]', '["amenity"="place_of_worship"]', '["tourism"="museum"]', '["amenity"="cafe"]'];
            const query = trip.setQuery(lat, lon, kinds);
            expect(query).toContain('nwr["tourism"="attraction"](around:10000,40.7128,-74.006);');
            expect(query).toContain('nwr["amenity"="place_of_worship"](around:10000,40.7128,-74.006);');
            expect(query).toContain('nwr["tourism"="museum"](around:10000,40.7128,-74.006);');
            expect(query).toContain('nwr["amenity"="cafe"](around:10000,40.7128,-74.006);');
        });

        test('getDaysDifference should calculate correct number of days', () => {
            const days = trip.getDaysDifference(fromDate, toDate);
            expect(days).toBe(5);
        });

        test('combinePlaces should combine places for 3 days correctly', () => {
            const defaultPlaces = [{ id: 1 }, { id: 2 }, { id: 3 }];
            const userPlaces = [{ id: 4 }, { id: 5 }, { id: 6 }];
            const combined = trip.combinePlaces(defaultPlaces, userPlaces, 3);
            expect(combined.length).toBe(6);
        });

        test('combinePlaces should return empty if not enough places', () => {
            const defaultPlaces = [{ id: 1 }];
            const userPlaces = [{ id: 4 }];
            const combined = trip.combinePlaces(defaultPlaces, userPlaces, 3);
            expect(combined).toEqual([]);
        });

        test('combinePlaces should correctly combine with placesPerDay 3-4', () => {
            trip.placesPerDay = '3-4';
            const defaultPlaces = [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 7 }];
            const userPlaces = [{ id: 4 }, { id: 5 }, { id: 6 }];
            const combined = trip.combinePlaces(defaultPlaces, userPlaces, 2);
            expect(combined.length).toBe(7);
        });

        test('rearrangePlacesWithinCluster should rearrange places correctly', () => {
            const cluster = [
                { lat: 0, lon: 0 },
                { lat: 1, lon: 1 },
                { lat: 0.5, lon: 0.5 }
            ];
            const rearrangedCluster = trip.rearrangePlacesWithinCluster(cluster);
            expect(rearrangedCluster).toEqual([
                { lat: 0, lon: 0 },
                { lat: 0.5, lon: 0.5 },
                { lat: 1, lon: 1 }
            ]);
        });

        test('rearrangePlacesWithinCluster should return the same array for a single place', () => {
            const cluster = [{ lat: 0, lon: 0 }];
            const rearrangedCluster = trip.rearrangePlacesWithinCluster(cluster);
            expect(rearrangedCluster).toEqual([{ lat: 0, lon: 0 }]);
        });

        test('calculateTotalDistance should return correct total distance', () => {
            const places = [
                { lat: 0, lon: 0 },
                { lat: 1, lon: 1 },
                { lat: 2, lon: 2 }
            ];
            const totalDistance = trip.calculateTotalDistance(places);
            expect(totalDistance).toBe(4);
        });

        test('calculateTotalDistance should return 0 for a single place', () => {
            const places = [{ lat: 0, lon: 0 }];
            const totalDistance = trip.calculateTotalDistance(places);
            expect(totalDistance).toBe(0);
        });

        test('findClosestFoodPlace should find the closest food place', () => {
            const foodPlaces = [
                { lat: 0, lon: 0, food: 'yes' },
                { lat: 1, lon: 1, food: 'yes' },
                { lat: 0.5, lon: 0.5, food: 'yes' }
            ];
            const closestFoodPlace = trip.findClosestFoodPlace(0.3, 0.3, foodPlaces);
            expect(closestFoodPlace).toEqual({ lat: 0.5, lon: 0.5, food: 'yes' });
        });

        test('findClosestFoodPlace should return null if no food places available', () => {
            const foodPlaces = [];
            const closestFoodPlace = trip.findClosestFoodPlace(0.3, 0.3, foodPlaces);
            expect(closestFoodPlace).toBeNull();
        });

        test('clusterPlaces should handle empty combined places', () => {
            const combined = [];
            const placesMap = trip.clusterPlaces(combined, 2);
            expect(Object.keys(placesMap).length).toBe(0);
        });

        test('clusterPlaces should cluster places correctly with given number of days', () => {
            const combined = [
                { lon: 0, lat: 0 },
                { lon: 1, lat: 1 },
                { lon: 1, lat: 1 },
                { lon: 0, lat: 0 }
            ];
            const placesMap = trip.clusterPlaces(combined, 2);
            expect(Object.keys(placesMap).length).toBe(2);
        });
    });

    describe('Edge Cases and Specific Scenarios', () => {
        let trip;
        const city = 'Lower Bound City';
        const lat = 0.0;
        const lon = 0.0;
        const fromDate = '2023-01-01T00:00:00Z';
        const toDate = '2023-01-02T00:00:00Z';
        const choosenKinds = ['Art&Cultural'];
        const placesPerDay = '1-2';
        const numPeople = 1;
        const budget = 'cheap';
    
        beforeEach(() => {
            trip = new TripOSM(city, lat, lon, fromDate, toDate, choosenKinds, placesPerDay, numPeople, budget);
        });
    
        test('getDaysDifference should calculate correct number of days for one day trip', () => {
            const days = trip.getDaysDifference(fromDate, fromDate);
            expect(days).toBe(1);
        });
    
        test('combinePlaces should handle empty defaultPlaces and userPlaces', () => {
            const defaultPlaces = [];
            const userPlaces = [];
            const combined = trip.combinePlaces(defaultPlaces, userPlaces, 1);
            expect(combined).toEqual([]);
        });
    
        test('combinePlaces should handle one element in defaultPlaces and userPlaces', () => {
            const defaultPlaces = [{ id: 1 }];
            const userPlaces = [{ id: 2 }];
            const combined = trip.combinePlaces(defaultPlaces, userPlaces, 1);
            expect(combined).toEqual([{ id: 1 }, { id: 2 }]);
        });
    
        test('rearrangePlacesWithinCluster should handle empty cluster', () => {
            const cluster = [];
            const rearrangedCluster = trip.rearrangePlacesWithinCluster(cluster);
            expect(rearrangedCluster).toEqual([]);
        });
    
        test('rearrangePlacesWithinCluster should handle cluster with one element', () => {
            const cluster = [{ lat: 0, lon: 0 }];
            const rearrangedCluster = trip.rearrangePlacesWithinCluster(cluster);
            expect(rearrangedCluster).toEqual([{ lat: 0, lon: 0 }]);
        });
    
        test('calculateTotalDistance should return 0 for empty list', () => {
            const places = [];
            const totalDistance = trip.calculateTotalDistance(places);
            expect(totalDistance).toBe(0);
        });
    
        test('calculateTotalDistance should return 0 for one element list', () => {
            const places = [{ lat: 0, lon: 0 }];
            const totalDistance = trip.calculateTotalDistance(places);
            expect(totalDistance).toBe(0);
        });
    
        test('findClosestFoodPlace should handle empty foodPlaces', () => {
            const foodPlaces = [];
            const closestFoodPlace = trip.findClosestFoodPlace(0.0, 0.0, foodPlaces);
            expect(closestFoodPlace).toBeNull();
        });
    
        test('findClosestFoodPlace should handle one element in foodPlaces', () => {
            const foodPlaces = [{ lat: 0, lon: 0, food: 'yes' }];
            const closestFoodPlace = trip.findClosestFoodPlace(0.1, 0.1, foodPlaces);
            expect(closestFoodPlace).toEqual({ lat: 0, lon: 0, food: 'yes' });
        });
    
        test('clusterPlaces should handle empty combined places', () => {
            const combined = [];
            const placesMap = trip.clusterPlaces(combined, 1);
            expect(Object.keys(placesMap).length).toBe(0);
        });
    
        test('clusterPlaces should handle one element in combined places', () => {
            const combined = [{ lon: 0, lat: 0 }];
            const placesMap = trip.clusterPlaces(combined, 1);
            expect(Object.keys(placesMap).length).toBe(1);
            expect(placesMap[0]).toEqual([{ lon: 0, lat: 0 }]);
        });
    
        test('addFoodPlaces should handle empty placesMap', () => {
            const placesMap = {};
            const foodPlaces = [{ lat: 0.5, lon: 0.5, food: 'yes' }];
            const updatedPlacesMap = trip.addFoodPlaces(placesMap, foodPlaces);
            expect(updatedPlacesMap).toEqual({});
        });

        test('addFoodPlaces should handle empty foodPlaces correctly', () => {
            const placesMap = {
                0: [{ lat: 0, lon: 0 }, { lat: 1, lon: 1 }],
                1: [{ lat: 2, lon: 2 }, { lat: 3, lon: 3 }]
            };
            const foodPlaces = []; // Empty food places
    
            const updatedPlacesMap = trip.addFoodPlaces(placesMap, foodPlaces);
    
            expect(updatedPlacesMap).toEqual(placesMap); // Expect the placesMap to remain unchanged
        });
    
        test('addFoodPlaces should handle one element in placesMap', () => {
            const placesMap = {
                0: [{ lat: 0, lon: 0 }]
            };
            const foodPlaces = [{ lat: 0.5, lon: 0.5, food: 'yes' }];
            const updatedPlacesMap = trip.addFoodPlaces(placesMap, foodPlaces);
            expect(updatedPlacesMap[0].length).toBe(2);
            expect(updatedPlacesMap[0]).toContainEqual({ lat: 0, lon: 0 });
            expect(updatedPlacesMap[0]).toContainEqual({ lat: 0.5, lon: 0.5, food: 'yes' });
        });
    
        test('calculateDistance should return correct distance for one place', () => {
            const place1 = { lat: 0, lon: 0 };
            const place2 = { lat: 1, lon: 1 };
            const distance = trip.calculateDistance(place1, place2);
            expect(distance).toBe(2);
        });
    
        test('isEqual should return true for equal objects', () => {
            const obj1 = { a: 1, b: 2 };
            const obj2 = { a: 1, b: 2 };
            const result = trip.isEqual(obj1, obj2);
            expect(result).toBe(true);
        });
    
        test('isEqual should return false for different objects', () => {
            const obj1 = { a: 1, b: 2 };
            const obj2 = { a: 1, b: 3 };
            const result = trip.isEqual(obj1, obj2);
            expect(result).toBe(false);
        });

        test('clusterPlaces should handle empty combined places', () => {
            const combined = [];
            const placesMap = trip.clusterPlaces(combined, 1);
            expect(Object.keys(placesMap).length).toBe(0);
        });
    
        test('clusterPlaces should handle one element in combined places', () => {
            const combined = [{ lon: 0, lat: 0 }];
            const placesMap = trip.clusterPlaces(combined, 1);
            expect(Object.keys(placesMap).length).toBe(1);
            expect(placesMap[0]).toEqual([{ lon: 0, lat: 0 }]);
        });
    });
    
    describe('Combine and Filter Places', () => {
        let trip;
        const city = 'Test City';
        const lat = 40.7128;
        const lon = -74.0060;
        const fromDate = '2023-05-01T00:00:00Z';
        const toDate = '2023-05-05T00:00:00Z';
        const choosenKinds = ['Art&Cultural', 'Museums'];
        const placesPerDay = '1-2';
        const numPeople = 2;
        const budget = 'normal';
    
        beforeEach(() => {
            trip = new TripOSM(city, lat, lon, fromDate, toDate, choosenKinds, placesPerDay, numPeople, budget);
        });
    
        test('combinePlaces should return combined list when both lists have enough places for 1-2 places per day', () => {
            const defaultPlaces = [{ id: 1 }, { id: 2 }];
            const userPlaces = [{ id: 3 }, { id: 4 }];
            const combined = trip.combinePlaces(defaultPlaces, userPlaces, 2);
            expect(combined.length).toBe(4);
            expect(combined).toEqual([{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }]);
        });
    
        test('combinePlaces should return combined list when defaultPlaces has less but userPlaces has enough for 1-2 places per day', () => {
            const defaultPlaces = [{ id: 1 }];
            const userPlaces = [{ id: 2 }, { id: 3 }, { id: 4 }];
            const combined = trip.combinePlaces(defaultPlaces, userPlaces, 2);
            expect(combined.length).toBe(4);
            expect(combined).toEqual([{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }]);
        });
    
        test('combinePlaces should return combined list when userPlaces has less but defaultPlaces has enough for 1-2 places per day', () => {
            const defaultPlaces = [{ id: 1 }, { id: 2 }, { id: 3 }];
            const userPlaces = [{ id: 4 }];
            const combined = trip.combinePlaces(defaultPlaces, userPlaces, 2);
            expect(combined.length).toBe(4);
            expect(combined).toEqual([{ id: 4 }, { id: 1 }, { id: 2 }, { id: 3 }]);
        });
    
        test('combinePlaces should return combined list when both lists have enough places for 3-4 places per day', () => {
            trip.placesPerDay = '3-4';
            const defaultPlaces = [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }];
            const userPlaces = [{ id: 5 }, { id: 6 }, { id: 7 }, { id: 8 }];
            const combined = trip.combinePlaces(defaultPlaces, userPlaces, 2);
            expect(combined.length).toBe(8);
            expect(combined).toEqual([{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }, { id: 5 }, { id: 6 }, { id: 7 }, { id: 8 }]);
        });
    
        test('combinePlaces should return combined list when one list is not enough but combined they are sufficient for 3-4 places per day', () => {
            trip.placesPerDay = '3-4';
            const defaultPlaces = [{ id: 1 }, { id: 2 }];
            const userPlaces = [{ id: 3 }, { id: 4 }, { id: 5 }, { id: 6 }];
            const combined = trip.combinePlaces(defaultPlaces, userPlaces, 2);
            expect(combined.length).toBe(6);
            expect(combined).toEqual([{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }, { id: 5 }, { id: 6 }]);
        });
    
        test('combinePlaces should return empty when neither list is sufficient individually or combined', () => {
            const defaultPlaces = [{ id: 1 }];
            const userPlaces = [{ id: 2 }];
            const combined = trip.combinePlaces(defaultPlaces, userPlaces, 3);
            expect(combined).toEqual([]);
        });
    
        test('combinePlaces should handle empty defaultPlaces', () => {
            const defaultPlaces = [];
            const userPlaces = [{ id: 1 }, { id: 2 }, { id: 3 }];
            const combined = trip.combinePlaces(defaultPlaces, userPlaces, 1);
            expect(combined).toEqual([{ id: 1 }, { id: 2 }]);
        });
    
        test('combinePlaces should handle empty userPlaces', () => {
            const defaultPlaces = [{ id: 1 }, { id: 2 }, { id: 3 }];
            const userPlaces = [];
            const combined = trip.combinePlaces(defaultPlaces, userPlaces, 1);
            expect(combined).toEqual([{ id: 1 }, { id: 2 }]);
        });
    
        test('combinePlaces should handle both lists being empty', () => {
            const defaultPlaces = [];
            const userPlaces = [];
            const combined = trip.combinePlaces(defaultPlaces, userPlaces, 1);
            expect(combined).toEqual([]);
        });

        test('filterPlaces should limit the length of defaultPlaces, userPlaces, and foodPlaces correctly', () => {
            // Create hardcoded test data
            const data = {
                elements: Array(50).fill().map((_, i) => ({
                    tags: { tourism: 'attraction', name: `Attraction ${i + 1}` },
                    lat: 40.7128 + i * 0.01,
                    lon: -74.0060 + i * 0.01
                })).concat(
                    Array(50).fill().map((_, i) => ({
                        tags: { amenity: 'cafe', name: `Cafe ${i + 1}` },
                        lat: 40.7128 + i * 0.01,
                        lon: -74.0060 + i * 0.01
                    })),
                    Array(50).fill().map((_, i) => ({
                        tags: { historic: 'memorial', name: `Memorial ${i + 1}` },
                        lat: 40.7128 + i * 0.01,
                        lon: -74.0060 + i * 0.01
                    }))
                )
            };
        
            // Call the filterPlaces method directly
            const { defaultPlaces, userPlaces, foodPlaces } = trip.filterPlaces(data);
        
            // Check the lengths of the arrays
            expect(defaultPlaces.length).toBeLessThanOrEqual(40);
            expect(userPlaces.length).toBeLessThanOrEqual(40);
            expect(foodPlaces.length).toBeLessThanOrEqual(1000);
        });

    });
    
    describe('Cluster and Rearrange Tests', () => {
        let trip;
        const city = 'Test City';
        const lat = 40.7128;
        const lon = -74.0060;
        const fromDate = '2023-05-01T00:00:00Z';
        const toDate = '2023-05-05T00:00:00Z';
        const choosenKinds = ['Art&Cultural', 'Museums'];
        const placesPerDay = '1-2';
        const numPeople = 2;
        const budget = 'normal';
    
        beforeEach(() => {
            trip = new TripOSM(city, lat, lon, fromDate, toDate, choosenKinds, placesPerDay, numPeople, budget);
        });
    
        test('rearrangePlacesWithinCluster should handle empty cluster', () => {
            const cluster = [];
            const rearrangedCluster = trip.rearrangePlacesWithinCluster(cluster);
            expect(rearrangedCluster).toEqual([]);
        });
    
        test('rearrangePlacesWithinCluster should handle cluster with one element', () => {
            const cluster = [{ lat: 0, lon: 0 }];
            const rearrangedCluster = trip.rearrangePlacesWithinCluster(cluster);
            expect(rearrangedCluster).toEqual([{ lat: 0, lon: 0 }]);
        });
    
        test('rearrangePlacesWithinCluster should rearrange places to minimize total distance', () => {
            const cluster = [
                { lat: 0, lon: 0 },
                { lat: 2, lon: 2 },
                { lat: 1, lon: 1 }
            ];
            const rearrangedCluster = trip.rearrangePlacesWithinCluster(cluster);
            expect(rearrangedCluster).toEqual([
                { lat: 0, lon: 0 },
                { lat: 1, lon: 1 },
                { lat: 2, lon: 2 }
            ]);
        });
    
        test('rearrangePlacesWithinCluster should handle cluster with multiple places having the same coordinates', () => {
            const cluster = [
                { lat: 0, lon: 0 },
                { lat: 0, lon: 0 },
                { lat: 1, lon: 1 }
            ];
            const rearrangedCluster = trip.rearrangePlacesWithinCluster(cluster);
            expect(rearrangedCluster).toEqual([
                { lat: 0, lon: 0 },
                { lat: 0, lon: 0 },
                { lat: 1, lon: 1 }
            ]);
        });
    
        test('rearrangePlacesWithinCluster should handle cluster with negative coordinates', () => {
            const cluster = [
                { lat: 0, lon: 0 },
                { lat: -1, lon: -1 },
                { lat: -2, lon: -2 }
            ];
            const rearrangedCluster = trip.rearrangePlacesWithinCluster(cluster);
            expect(rearrangedCluster).toEqual([
                { lat: 0, lon: 0 },
                { lat: -1, lon: -1 },
                { lat: -2, lon: -2 }
            ]);
        });
    
        test('rearrangePlacesWithinCluster should handle cluster with a mix of positive and negative coordinates', () => {
            const cluster = [
                { lat: -1, lon: -1 },
                { lat: 1, lon: 1 },
                { lat: 0, lon: 0 }
            ];
            const rearrangedCluster = trip.rearrangePlacesWithinCluster(cluster);
            expect(rearrangedCluster).toEqual([
                { lat: -1, lon: -1 },
                { lat: 0, lon: 0 },
                { lat: 1, lon: 1 }
            ]);
        });

        test('clusterPlaces should distribute places equally into 2 clusters', () => {
            const combined = [
                { lon: 0, lat: 0 },
                { lon: 1, lat: 1 },
                { lon: 2, lat: 2 },
                { lon: 3, lat: 3 }
            ];
            const placesMap = trip.clusterPlaces(combined, 2);
        
            const clusterSizes = Object.values(placesMap).map(cluster => cluster.length);
            expect(Math.abs(clusterSizes[0] - clusterSizes[1])).toBeLessThanOrEqual(1);
        });
        
        test('clusterPlaces should distribute places equally into 3 clusters', () => {
            const combined = [
                { lon: 0, lat: 0 },
                { lon: 1, lat: 1 },
                { lon: 2, lat: 2 },
                { lon: 3, lat: 3 },
                { lon: 4, lat: 4 },
                { lon: 5, lat: 5 }
            ];
            const placesMap = trip.clusterPlaces(combined, 3);
        
            const clusterSizes = Object.values(placesMap).map(cluster => cluster.length);
            expect(Math.max(...clusterSizes) - Math.min(...clusterSizes)).toBeLessThanOrEqual(1);
        });
        
        test('clusterPlaces should distribute places equally into 4 clusters', () => {
            const combined = [
                { lon: 0, lat: 0 },
                { lon: 1, lat: 1 },
                { lon: 2, lat: 2 },
                { lon: 3, lat: 3 },
                { lon: 4, lat: 4 },
                { lon: 5, lat: 5 },
                { lon: 6, lat: 6 },
                { lon: 7, lat: 7 }
            ];
            const placesMap = trip.clusterPlaces(combined, 4);
        
            const clusterSizes = Object.values(placesMap).map(cluster => cluster.length);
            expect(Math.max(...clusterSizes) - Math.min(...clusterSizes)).toBeLessThanOrEqual(1);
        });
        
        test('clusterPlaces should distribute places equally into 5 clusters', () => {
            const combined = [
                { lon: 0, lat: 0 },
                { lon: 1, lat: 1 },
                { lon: 2, lat: 2 },
                { lon: 3, lat: 3 },
                { lon: 4, lat: 4 },
                { lon: 5, lat: 5 },
                { lon: 6, lat: 6 },
                { lon: 7, lat: 7 },
                { lon: 8, lat: 8 },
                { lon: 9, lat: 9 }
            ];
            const placesMap = trip.clusterPlaces(combined, 5);
        
            const clusterSizes = Object.values(placesMap).map(cluster => cluster.length);
            expect(Math.max(...clusterSizes) - Math.min(...clusterSizes)).toBeLessThanOrEqual(1);
        });  

    });    

    jest.setTimeout(15000);
    describe('TripOSM Integration Tests for Paris', () => {
        let trip;
        const city = 'Paris';
        const lat = 48.864716;
        const lon = 2.349014;
        const fromDate = '2023-06-01T00:00:00Z';
        const toDate = '2023-06-03T00:00:00Z';
        const choosenKinds = ['Art&Cultural', 'Museums', 'Historical'];
        const placesPerDay = '3-4';
        const numPeople = 2;
        const budget = 'normal';

        beforeEach(() => {
            trip = new TripOSM(city, lat, lon, fromDate, toDate, choosenKinds, placesPerDay, numPeople, budget);
        });

        test('fetchDescriptionsAndImages should add descriptions and images to places', async () => {
            const placesMap = {
                0: [{ lat: 0, lon: 0, wikidata: 'Q42' }],
                1: [{ lat: 1, lon: 1, wikidata: 'Q12345' }] 
            };
    
            const updatedPlacesMap = await trip.fetchDescriptionsAndImages(placesMap);
    
            expect(updatedPlacesMap[0][0].description).toBeTruthy();
            expect(updatedPlacesMap[0][0].image).toMatch(/^https:\/\/commons.wikimedia.org\/wiki\/Special:FilePath\/.+$/);
            expect(updatedPlacesMap[1][0].description).toBeTruthy();
            expect(updatedPlacesMap[1][0].image).toMatch(/^https:\/\/commons.wikimedia.org\/wiki\/Special:FilePath\/.+$/);
        });

        test('should fetch and filter places correctly from API', async () => {
            const data = await trip.osmRequest();
            const { defaultPlaces, userPlaces, foodPlaces } = trip.filterPlaces(data);
            expect(defaultPlaces.length).toBeGreaterThan(0);
            expect(userPlaces.length).toBeGreaterThan(0);
            expect(foodPlaces.length).toBeGreaterThan(0);
        });

        test('createTrip should return a valid trip plan with real data', async () => {
            const tripPlan = await trip.createTrip();
            expect(tripPlan).toBeTruthy();
            const parsedPlan = JSON.parse(tripPlan);
            expect(parsedPlan).toBeInstanceOf(Object);
            expect(Object.keys(parsedPlan).length).toBeGreaterThan(0);
        });
    });

});
