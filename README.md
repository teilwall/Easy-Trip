# Easy Trip

Easy Trip is an interactive and user-friendly web application designed to simplify trip planning. Users can easily create personalized itineraries based on their preferences, including destinations, budget, and activities. The platform integrates mapping services to provide a visually intuitive itinerary.

## Table of Contents
- [Features](#features)
- [Technologies Used](#technologies-used)
- [Installation](#installation)
- [Usage](#usage)
- [Project Structure](#project-structure)
- [Architecture](#architecture)
- [Testing and Optimization](#testing-and-optimization)
- [Future Work](#future-work)
- [License](#license)
- [Contact](#contact)

## Features
- Custom trip planning based on user inputs: destinations, dates, group size, budget, and activity preferences.
- Personalized daily routes visually represented on a map.
- Optimized travel schedules that integrate user constraints and preferences.
- Support for meal planning with recommended food places based on user budget.
- Error handling for unsupported cities and missing user inputs.

## Technologies Used
- **Frontend:** React, Leaflet, React-Leaflet
- **Backend:** Node.js, Express.js
- **Database:** Not integrated (future work planned)
- **APIs:** OpenStreetMap, Wikidata
- **Other Tools:** Formik for form handling, Axios for HTTP requests, ml-kmeans for clustering, Jest for testing.

## Installation

### Prerequisites
- **Operating System:** Windows 10/11, macOS, Linux
- **Node.js:** Version 20 or later
- **Git:** For version control

### Steps
1. **Clone the repository:**
    ```bash
    git clone https://github.com/teilwall/Easy-Trip.git
    ```
2. **Install dependencies for both the client and server:**
    ```bash
    cd client
    npm install
    cd ../server
    npm install
    ```
3. **Run the application:**
    - Start the server from the `server` directory:
      ```bash
      npm run start
      ```
    - Start the client from the `client` directory:
      ```bash
      npm start
      ```

## Usage

1. **Access the application:** Open your browser and navigate to `http://localhost:3000`.
2. **Plan your trip:**
   - Fill out the form with details like country, state, city, dates, number of people, budget, and activities.
   - Generate a trip plan, which will be displayed on a map with a day-by-day itinerary.
   - Use the interactive map to explore destinations and view daily routes.



## Architecture

The Easy Trip application is divided into frontend and backend components:
- **Frontend:** Built with React and Leaflet for dynamic maps. It handles user interactions and displays the planned itinerary.
- **Backend:** Developed using Node.js and Express.js, it processes user inputs, interacts with external APIs, and generates the trip plan.
- **Mapping and Data Services:** Utilizes OpenStreetMap for map data and Wikidata for additional place details and images.

## Testing and Optimization
- **Manual Testing:** Performed to verify form functionality, map display, and integration of food places.
- **Automated Testing:** Implemented using Jest for unit tests covering initialization, API requests, clustering, and optimization algorithms.
- **Performance Optimization:** Reduced trip creation time from 27 seconds to 5.5 seconds by consolidating API requests.

## Future Work
- **Database Integration:** Plans to implement a database (e.g., PostgreSQL, MongoDB) for storing user data and trip details.
- **User Authentication:** Adding features for user sign-up, login, and personalized dashboards to manage trips.
- **Enhanced Trip Management:** Allowing users to update, delete, and revisit their planned trips.

## License
Distributed under the MIT License. See `LICENSE` for more information.

## Contact
Maintained by Kalykov Alibek - [alikalykovv@gmail.com](mailto:alikalykovv@gmail.com)

Project Link: [https://github.com/teilwall/Easy-Trip](https://github.com/teilwall/Easy-Trip)
