const express = require("express");
const axios = require("axios");
const app = express();
const PORT = 3000;
require("dotenv").config();

const apiKey = process.env.ORS_API_KEY;

app.use(express.json());

// Sample routes data (as you provided)
const routes = [
  {
    id: 1,
    name: "Wawel Castle to Main Market Square",
    start: { latitude: 50.0545, longitude: 19.9352 },
    end: { latitude: 50.0614, longitude: 19.9372 },
    waypoints: [
      {
        name: "Planty Park",
        description:
          "Encircling Kraków’s Old Town, Planty Park is a green belt where locals and tourists stroll among fountains, statues, and lush gardens.",
        latitude: 50.0565,
        longitude: 19.9383,
      },
      {
        name: "St. Mary’s Basilica",
        description:
          "This Gothic masterpiece on Main Market Square features soaring towers and a stunning wooden altarpiece carved by Veit Stoss. Every hour, a bugle call sounds from the taller tower.",
        latitude: 50.0616,
        longitude: 19.939,
      },
    ],
  },
  {
    id: 2,
    name: "Kazimierz District to Schindler’s Factory Museum",
    start: { latitude: 50.0519, longitude: 19.944 },
    end: { latitude: 50.0462, longitude: 19.9615 },
    waypoints: [
      {
        name: "Plac Nowy",
        description:
          "A popular square known for its quirky architecture and bustling food stalls, where you can try local delicacies, including the famous ‘zapiekanka’—a Polish open-faced sandwich.",
        latitude: 50.0493,
        longitude: 19.9447,
      },
      {
        name: "Ghetto Heroes Square",
        description:
          "This somber square is a memorial to the Jewish residents of Kraków’s ghetto during World War II, symbolized by empty chairs representing the belongings left behind.",
        latitude: 50.0483,
        longitude: 19.9577,
      },
    ],
  },
  {
    id: 3,
    name: "Barbican to Wawel Castle",
    start: { latitude: 50.0654, longitude: 19.9428 },
    end: { latitude: 50.0545, longitude: 19.9352 },
    waypoints: [
      {
        name: "Floriańska Street",
        description:
          "One of Kraków’s busiest streets, Floriańska is lined with vibrant shops, cafes, and historic buildings, leading from the city walls to the Main Market Square.",
        latitude: 50.0637,
        longitude: 19.9396,
      },
      {
        name: "Sukiennice (Cloth Hall)",
        description:
          "Located in the heart of the Main Market Square, the Sukiennice is a Renaissance trading hall that now hosts local artisans selling traditional Polish crafts.",
        latitude: 50.0615,
        longitude: 19.9372,
      },
    ],
  },
];

// Endpoint to get all routes with basic information
app.get("/routes", (req, res) => {
  res.json(
    routes.map((route) => ({
      id: route.id,
      name: route.name,
      start: route.start,
      end: route.end,
    }))
  );
});

// Endpoint to get route details by ID, including waypoints and descriptions
app.get("/routes/:id", (req, res) => {
  const route = routes.find((r) => r.id == req.params.id);
  if (route) {
    res.json(route);
  } else {
    res.status(404).send("Route not found");
  }
});

// Endpoint to fetch route directions from OpenRouteService (ORS)
app.get("/api/route", async (req, res) => {
  const { startLon, startLat, endLon, endLat } = req.query;

  try {
    const response = await axios.get(
      `https://api.openrouteservice.org/v2/directions/foot-walking`,
      {
        params: {
          api_key: apiKey,
          start: `${startLon},${startLat}`,
          end: `${endLon},${endLat}`,
        },
      }
    );
    res.json(response.data);
  } catch (error) {
    console.error("Error fetching route data:", error);
    res.status(500).json({ error: "Error fetching route data" });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
