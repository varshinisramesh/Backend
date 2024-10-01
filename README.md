SOL/USDT Real-Time Trading Dashboard
This project is a real-time trading dashboard for the SOL/USDT trading pair. 
It leverages the Bybit API for live market data and displays it in a user-friendly interface built using Angular. 
The backend server, written in Node.js, handles the WebSocket and REST API communications with Bybit and pushes the data 
to the frontend using Socket.IO.

Project Overview
The purpose of this project is to create a dashboard that visualizes real-time trading data, such as live candlestick charts and order books, for the SOL/USDT pair using data from the Bybit exchange. The data is fetched and processed in the backend and then visualized on the frontend using Angular.

Features
Real-time display of the SOL/USDT candlestick chart.
Live order book with bids and asks.
WebSocket-based updates to reflect market changes in real-time.
Interactive and responsive dashboard.
Tech Stack
Backend
Node.js
Express
Socket.IO
Axios (for REST API calls)
WebSocket (for Bybit market data stream)
Frontend
Angular
ngx-charts or Chart.js (for chart visualization)
Bootstrap (for UI styling)

Project Structure
├── backend/                # Node.js backend
│   ├── index.js            # Main backend server file
│   ├── package.json        # Dependencies and scripts
├── frontend/               # Angular frontend
│   ├── src/
│   │   ├── app/
│   │   │   ├── app.component.ts   # Main component logic
│   │   │   ├── app.component.html # Main component template
│   │   ├── index.html      # Main HTML template
│   ├── package.json        # Frontend dependencies and scripts
├── README.md               # Project documentation
Setup Instructions
Backend Setup
Navigate to the backend directory:

cd backend
Install dependencies:
npm install
Start the backend server:
node index.js
This will start the backend server on http://localhost:5000 and establish a WebSocket connection to Bybit.

Frontend Setup
Navigate to the frontend directory:
cd frontend
Install Angular dependencies:

npm install

ng serve
This will serve the frontend on http://localhost:4200.

Running the Application
Start the backend server first by running the command:

node index.js


start the frontend:

ng serve
Open your browser and navigate to http://localhost:4200 

Future Enhancements
Add support for multiple trading pairs.
Implement user authentication and authorization.
Enhance the UI with more interactive features.
Improve error handling and reconnection strategies for WebSocket connections.
