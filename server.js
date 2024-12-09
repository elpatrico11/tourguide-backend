const express = require("express");
const axios = require("axios");
const cors = require("cors"); // Import CORS
const app = express();
const PORT = 3000;
require("dotenv").config();

// Load the API keys from the .env file
const ORS_API_KEY = process.env.ORS_API_KEY;
const JSONBIN_API_KEY = process.env.JSONBIN_API_KEY;
const JSONBIN_BIN_ID = process.env.JSONBIN_BIN_ID;

app.use(express.json());
app.use(cors());

// Endpoint to get all routes with basic information
app.get("/routes", async (req, res) => {
  try {
    const response = await axios.get(
      `https://api.jsonbin.io/v3/b/${JSONBIN_BIN_ID}/latest`,
      {
        headers: {
          "X-Master-Key": JSONBIN_API_KEY,
        },
      }
    );

    const routes = response.data.record.routes;

    // Send basic information
    res.json(
      routes.map((route) => ({
        id: route.id,
        name: route.name,
        start: route.start,
        end: route.end,
      }))
    );
  } catch (error) {
    console.error("Error fetching routes from JSONBin:", error.message);
    res.status(500).json({ error: "Failed to fetch routes." });
  }
});

// Endpoint to get detailed route information by ID
app.get("/routes/:id", async (req, res) => {
  const routeId = parseInt(req.params.id, 10);

  try {
    const response = await axios.get(
      `https://api.jsonbin.io/v3/b/${JSONBIN_BIN_ID}/latest`,
      {
        headers: {
          "X-Master-Key": JSONBIN_API_KEY,
        },
      }
    );

    const routes = response.data.record.routes;
    const route = routes.find((r) => r.id === routeId);

    if (route) {
      res.json(route);
    } else {
      res.status(404).json({ error: "Route not found" });
    }
  } catch (error) {
    console.error("Error fetching route from JSONBin:", error.message);
    res.status(500).json({ error: "Failed to fetch route." });
  }
});

// Endpoint to fetch route directions from OpenRouteService (ORS) with waypoints
app.get("/api/route", async (req, res) => {
  const { startLon, startLat, endLon, endLat, waypoints } = req.query;

  // Validate required parameters
  if (!startLon || !startLat || !endLon || !endLat) {
    return res
      .status(400)
      .json({ error: "Missing required query parameters." });
  }

  // Initialize coordinates with the start point
  let coordinates = [[parseFloat(startLon), parseFloat(startLat)]];

  // Parse and add waypoints if provided
  if (waypoints) {
    try {
      const parsedWaypoints = JSON.parse(waypoints);
      if (Array.isArray(parsedWaypoints)) {
        parsedWaypoints.forEach((wp) => {
          if (wp.lon && wp.lat) {
            coordinates.push([parseFloat(wp.lon), parseFloat(wp.lat)]);
          }
        });
      }
    } catch (e) {
      return res.status(400).json({ error: "Invalid waypoints format." });
    }
  }

  coordinates.push([parseFloat(endLon), parseFloat(endLat)]);

  try {
    console.log("Requesting ORS with coordinates:", coordinates);
    const response = await axios.post(
      "https://api.openrouteservice.org/v2/directions/foot-walking/geojson",
      {
        coordinates: coordinates,
      },
      {
        headers: {
          Authorization: ORS_API_KEY,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("ORS Response:", response.data);

    if (
      response.data &&
      response.data.features &&
      response.data.features.length > 0
    ) {
      const routeGeometry = response.data.features[0].geometry.coordinates;

      res.json({
        routeGeometry: routeGeometry,
      });
    } else {
      res.status(500).json({ error: "No route found." });
    }
  } catch (error) {
    console.error("Error fetching route data:", error.message);
    res.status(500).json({ error: "Error fetching route data" });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
