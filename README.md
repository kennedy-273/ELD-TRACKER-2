```markdown
# TruckLogger Frontend

This is the frontend of the **TruckLogger** application, a full-stack app built with React and Django. The app allows truck drivers to input trip details and receive route instructions and automatically generated Electronic Logging Device (ELD) logs compliant with Hours of Service (HOS) regulations.

## Live Demo
The app is hosted live on Vercel: [TruckLogger Live Demo]() 

## Overview
The frontend is built with **React** and uses **Ant Design** for a polished UI/UX, **Leaflet** for map rendering, and integrates with a Django backend API. It provides an intuitive interface for drivers to:
- Enter trip details (current location, pickup location, dropoff location, and current cycle hours).
- View an interactive map with the route, stops, and rest points.
- Generate and display daily ELD log sheets for compliance.

### Features
- **Responsive Design**: Works seamlessly on desktop and mobile devices.
- **Interactive Map**: Displays the route with custom markers for start, stops, and end using Leaflet and OpenStreetMap.
- **ELD Log Generation**: Visualizes daily logs with driving, on-duty, and rest periods.
- **Good Aesthetics**: Modern design with gradients, background images, animations, and consistent branding.

## Tech Stack
- **React**: Frontend framework for building the UI.
- **Ant Design**: UI library for professional components and styling.
- **Leaflet**: Open-source map API for route visualization.
- **Axios**: For making API requests to the Django backend.
- **Vercel**: Hosting platform for deployment.

## Prerequisites
- Node.js (v16 or higher)
- npm or yarn

## Setup Instructions
1. **Clone the Repository**
   ```bash
   git clone https://github.com/kennedy-273/ELD-TRACKER-2.git
   cd ELD-TRACKER-2
```

2.  Install Dependencies
    
    bash
    
    ```bash
    npm install
    ```
    
    or
    
    bash
    
    ```bash
    yarn install
    ```
    
3.  Environment Variables Create a .env file in the root directory and add:
    
    env
    
    ```text
    REACT_APP_API_URL=http://localhost:8000/api/  # Backend API URL (update for production)
    ```
    
4.  Run the Development Server
    
    bash
    
    ```bash
    npm start
    ```
    
    or
    
    bash
    
    ```bash
    yarn start
    ```
    
    The app will run at http://localhost:5174/.
    
5.  Build for Production
    
    bash
    
    ```bash
    npm run build
    ```
    
    or
    
    bash
    
    ```bash
    yarn build
    ```
    
        

Project Structure

```text
trucklogger-frontend/
├── public/             # Static assets (icons, index.html)
├── src/                # Source code
│   ├── components/     # Reusable components (MapComponent, LogSheetComponent, etc.)
│   ├── pages/          # Page components (HomePage, ResultsPage, etc.)
│   ├── App.js          # Main app component with routing
│   ├── index.js        # Entry point
│   └── App.css         # Global styles
├── .env                # Environment variables
├── package.json        # Dependencies and scripts
└── README.md           # How to set up
```

Usage

1.  Visit the homepage to explore features or start a new trip.
    
2.  Enter trip details in the "Plan Your Trip" form.
    
3.  View the route map and generated ELD logs on the results page.