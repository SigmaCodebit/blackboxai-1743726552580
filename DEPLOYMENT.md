# Multi-Machine OEE Monitoring System Deployment

## 1. Prerequisites
```bash
# Install Node.js and npm
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install Mosquitto MQTT broker
sudo apt-get install mosquitto mosquitto-clients

# Install Node-RED
sudo npm install -g node-red
```

## 2. Configure Mosquitto
Edit `/etc/mosquitto/mosquitto.conf`:
```
listener 1883
listener 9001
protocol websockets
allow_anonymous true
```

Restart Mosquitto:
```bash
sudo systemctl restart mosquitto
```

## 3. Import Node-RED Flow
1. Start Node-RED:
```bash
node-red
```
2. Access Node-RED at: http://localhost:1880
3. Import `multi-machine-flow.json`

## 4. Launch Dashboard
```bash
python3 -m http.server 8000
```
Access interfaces:
- Configuration: http://localhost:8000/config.html
- Dashboard: http://localhost:8000/multi-machine-dashboard.html

## 5. Adding New Machines
1. Edit `multi-machine-flow.json`:
   - Add new inject nodes for machine data
   - Update machine config in the Set Machine Config function
2. Configure in the web interface:
   - Add machine details in config.html
   - Set product-specific parameters

## 6. Verification
```bash
# Monitor MQTT traffic
mosquitto_sub -v -t "oee/#"
```

## 7. Production Deployment
For production use:
- Secure MQTT with authentication
- Use HTTPS for the dashboard
- Set up proper backups for machine configs
- Consider using a database for machine configurations