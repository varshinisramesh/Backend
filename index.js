const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const { Server } = require("socket.io");
const axios = require("axios");
const cors = require("cors");
const dns = require("dns");

// Set DNS servers to avoid potential DNS resolution issues
dns.setServers(['8.8.8.8', '8.8.4.4']);

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:4200",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// ** Use the Correct Bybit WebSocket URL for Market Data **
const WEBSOCKET_URL = "wss://stream.bybit.com/v5/public/spot";
const REST_API_URL = "https://api.bybit.com/v5/market/kline?symbol=SOLUSDT&interval=15"; // Fetch multiple data points

let cachedCandlestickData = [];
let orderBook = { bids: [], asks: [] };
let ws; // Single WebSocket connection for all clients

app.use(cors({
  origin: "http://localhost:4200",
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type"],
  credentials: true,
}));

// ** Function to Get Initial Candlestick Data with Multiple Points **
const getCandlestickData = async () => {
  try {
    console.log("Fetching initial candlestick data from Bybit...");
    const response = await axios.get(REST_API_URL);

    if (response.data.result && response.data.result.list) {
      // Transform the raw API response into structured data for candlestick charting
      cachedCandlestickData = response.data.result.list.map((candle) => ({
        timestamp: candle[0],  // Unix timestamp
        open: parseFloat(candle[1]), // Open Price
        high: parseFloat(candle[2]), // High Price
        low: parseFloat(candle[3]),  // Low Price
        close: parseFloat(candle[4]), // Close Price
      }));
      console.log("Fetched candlestick data successfully:");
      console.log(cachedCandlestickData); // Log the structured data for validation
    } else {
      console.warn("No candlestick data found in API response.");
    }
    return cachedCandlestickData;
  } catch (error) {
    if (error.response && error.response.status === 429) {
      console.warn("Rate limited. Skipping this request to avoid further 429 errors.");
    } else if (error.response && error.response.status === 404) {
      console.error("Error 404: Resource not found. Check the REST API URL or the symbol.");
    } else {
      console.error("Error fetching candlestick data:", error.message);
    }
  }
};

// ** Establish a Single WebSocket Connection for Market Data **
const initializeWebSocket = () => {
  const wsUrl = WEBSOCKET_URL;
  console.log(`Connecting to Bybit WebSocket at ${wsUrl}...`);

  ws = new WebSocket(wsUrl);

  ws.onopen = () => {
    console.log(`Successfully connected to Bybit WebSocket at ${wsUrl}`);
    ws.send(JSON.stringify({
      "op": "subscribe",
      "args": ["tickers.SOLUSDT"], // Subscribe to ticker updates for SOLUSDT
    }));
    console.log("Sent WebSocket subscription request: tickers.SOLUSDT");
  };

  ws.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      if (data && data.topic === "tickers.SOLUSDT") {
        console.log("Received WebSocket data:", data);
      }
    } catch (error) {
      console.error("Error processing WebSocket message:", error.message);
    }
  };

  ws.onclose = () => {
    console.warn("Bybit WebSocket closed. Attempting to reconnect in 5 seconds...");
    setTimeout(initializeWebSocket, 5000); // Reconnect after 5 seconds
  };

  ws.onerror = (error) => {
    console.error(`WebSocket error on ${wsUrl}:`, error.message);
    if (error.message.includes("502")) {
      console.error(`WebSocket 502 Error: Bad Gateway at ${wsUrl}. The server might be temporarily down or the endpoint is incorrect.`);
    } else if (error.message.includes("404")) {
      console.error(`WebSocket 404 Error: Subscription not found at ${wsUrl}. Verify the subscription parameters and topic name.`);
    }
  };
};

// ** Fetch Initial Data and Establish WebSocket Connection **
getCandlestickData();
initializeWebSocket();

io.on("connection", (socket) => {
  console.log("New client connected");

  // Send initial candlestick data to the newly connected client
  if (cachedCandlestickData && cachedCandlestickData.length > 0) {
    socket.emit("candlestickData", cachedCandlestickData);
    console.log("Sent initial candlestick data to new client.");
  } else {
    console.warn("Candlestick data is not available yet. Will send when data is fetched.");
  }

  // Send the current order book data to the newly connected client
  socket.emit("orderBookData", orderBook);
  console.log("Sent current order book data to new client.");

  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

server.listen(5000, () => {
  console.log("Server is running on port 5000");
});
