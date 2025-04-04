
Built by https://www.blackbox.ai

---

# OEE Monitoring Dashboard

## Project Overview
The OEE (Overall Equipment Effectiveness) Monitoring Dashboard is a web application designed to visualize and analyze production metrics such as availability, performance, quality, and overall OEE in real-time. The dashboard uses MQTT to subscribe to data published from a Node-RED flow that simulates machine data. This project integrates user-friendly charts and gauges, providing an interactive and modern display for monitoring equipment performance.

## Installation
### Prerequisites
- **Node.js**: Make sure to have Node.js installed on your machine. You can download it from [nodejs.org](https://nodejs.org/).
- **Node-RED**: Ensure that Node-RED is set up and running.

### Steps
1. Clone the repository to your local machine:
    ```bash
    git clone https://github.com/yourusername/oee-monitoring-dashboard.git
    cd oee-monitoring-dashboard
    ```
2. Install required dependencies:
    ```bash
    npm install
    ```
3. Start the Node-RED server and import the `node-red-flows.json` file to set up the flow for simulating machine data and publishing metrics via MQTT.
4. Open the `index.html` or `enhanced-dashboard.html` file in a web browser to access the dashboard.

## Usage
- The application simulates machine data every 5 seconds, calculating OEE based on runtime, ideal output, total products, and good products.
- The dashboard displays the real-time metrics and trends for OEE, availability, performance, and quality.
- Users can toggle dark mode, refresh the page, and export the logged data.

## Features
- Real-time data visualization of OEE and its components (availability, performance, quality).
- Interactive dashboard with modern UI components using Tailwind CSS.
- Trend charts to analyze OEE performance over time.
- Data export functionality for local analysis.
- Dark mode support for better visibility in low-light environments.

## Dependencies
The following dependencies are listed in `package.json` for this project and will be installed when you run `npm install`:
- `chart.js`: For displaying charts and trends.
- `mqtt`: For handling MQTT communication.
- `tailwindcss`: For styling the dashboard.

## Project Structure
```
├── node-red-flows.json      # The Node-RED flow file for simulating machine data
├── index.html               # The main HTML dashboard implementation
├── enhanced-dashboard.html   # An enhanced version of the HTML dashboard
├── script.js                # The main script for handling dashboard functionality (for index.html)
├── enhanced-script.js       # The enhanced script for handling functionality in enhanced-dashboard.html
```

Ensure to edit and customize the flow in `node-red-flows.json` if needed, based on your production line specifications. Enjoy monitoring your equipment's effectiveness with this visualization tool!