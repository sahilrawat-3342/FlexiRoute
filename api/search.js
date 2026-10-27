import fs from "fs";
import path from "path";

// Load airports data statically to reuse across invocations if possible
let airportsData = [];
try {
  const airportsPath = path.join(process.cwd(), "api", "iata_airports.json");
  airportsData = JSON.parse(fs.readFileSync(airportsPath, "utf8"));
} catch (e) {
  console.error("Failed to load iata_airports.json", e);
}

function getDistance(lat1, lon1, lat2, lon2) {
  const R = 3958.8; // Radius of the earth in miles
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; 
}

function getNearbyAirports(iataCode, radiusMiles) {
  if (airportsData.length === 0 || !radiusMiles || radiusMiles <= 0) return iataCode;
  
  const target = airportsData.find(a => a.iata.toUpperCase() === iataCode.toUpperCase());
  if (!target) return iataCode;
  
  const nearbySorted = airportsData.map(a => ({
    iata: a.iata,
    dist: getDistance(target.lat, target.lon, a.lat, a.lon)
  })).filter(a => a.dist <= radiusMiles).sort((a, b) => a.dist - b.dist);
  
  // Cap at 5 airports to prevent massive URLs that SerpApi might reject
  const finalList = nearbySorted.slice(0, 5).map(a => a.iata);
  
  if (!finalList.includes(iataCode.toUpperCase())) {
     finalList[0] = iataCode.toUpperCase();
  }
  
  return finalList.join(",");
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: "Method Not Allowed" });
  }

  const { origin, destination, dates, tripType, radius, flexDays } = req.body;
  const apiKey = process.env.SerpApi_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ success: false, error: "API key is missing." });
  }

  if (!origin || !destination || !dates || !dates.start) {
    return res.status(400).json({ success: false, error: "Missing required parameters." });
  }
  if (tripType === "round-trip" && !dates.end) {
    return res.status(400).json({ success: false, error: "return_date is required for round trips." });
  }

  try {
    const finalOrigin = getNearbyAirports(origin, radius);
    const finalDestination = getNearbyAirports(destination, radius);
    console.log(`Searching Origin: ${finalOrigin} | Destination: ${finalDestination} | Radius: ${radius}mi`);

    const offsets = [];
    if (flexDays && flexDays > 0) {
      for (let i = -flexDays; i <= flexDays; i++) {
        offsets.push(i);
      }
    } else {
      offsets.push(0);
    }

    const promises = offsets.map(async (offset) => {
      const sDate = new Date(dates.start);
      sDate.setDate(sDate.getDate() + offset);
      const outboundDateStr = sDate.toISOString().split("T")[0];

      let url = `https://serpapi.com/search.json?engine=google_flights&departure_id=${encodeURIComponent(finalOrigin)}&arrival_id=${encodeURIComponent(finalDestination)}&outbound_date=${outboundDateStr}&api_key=${apiKey}`;

      if (tripType === "one-way") {
        url += "&type=2";
      } else if (tripType === "round-trip") {
        const eDate = new Date(dates.end);
        eDate.setDate(eDate.getDate() + offset);
        const returnDateStr = eDate.toISOString().split("T")[0];
        url += `&return_date=${returnDateStr}`;
      }

      try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.error) {
          console.error("SerpApi Error for offset", offset, data.error);
          return [];
        }

        let rawFlights = [];
        if (data.best_flights) rawFlights = [...data.best_flights];
        if (data.other_flights) rawFlights = [...rawFlights, ...data.other_flights];
        return rawFlights;
      } catch (err) {
        console.error("Fetch Error for offset", offset, err);
        return [];
      }
    });

    const resultsArray = await Promise.all(promises);
    let allRawFlights = resultsArray.flat();

    if (allRawFlights.length === 0) {
      return res.status(200).json({ success: true, data: [] });
    }

    const formattedResults = allRawFlights.map((flight, index) => {
      const firstLeg = flight.flights[0];
      const lastLeg = flight.flights[flight.flights.length - 1];

      const airline = firstLeg.airline || "Unknown Airline";
      const depAirport = firstLeg.departure_airport.id || origin;
      const arrAirport = lastLeg.arrival_airport.id || destination;

      let durationStr = flight.total_duration
        ? `${Math.floor(flight.total_duration / 60)}h ${flight.total_duration % 60}m`
        : "Unknown";
      let layoverCount = flight.layovers ? flight.layovers.length : 0;

      return {
        id: `flight-${index}-${Math.random().toString(36).substr(2, 5)}`,
        airline: airline,
        departure: { airport: depAirport, time: firstLeg.departure_airport.time },
        arrival: { airport: arrAirport, time: lastLeg.arrival_airport.time },
        price: flight.price,
        duration: durationStr,
        layover: layoverCount,
        tags: layoverCount === 0 ? ["Direct"] : [],
        rawDetails: flight,
      };
    });

    // Sort by price
    formattedResults.sort((a, b) => a.price - b.price);
    
    // Tag the top cheapest flight
    if (formattedResults.length > 0) {
      formattedResults[0].tags.push("Cheapest", "Top Pick");
    }

    res.status(200).json({ success: true, data: formattedResults });
  } catch (error) {
    console.error("Error in search:", error);
    res.status(500).json({ success: false, error: "Failed to fetch flights" });
  }
}
