const inquirer = require('inquirer');
const mqtt = require('mqtt');
const client = mqtt.connect('mqtt://broker.hivemq.com');

client.on('connect', () => {
    console.log('Connected to broker');
    showMenu(); // Call the menu at start
});

// Function to display the command menu
function showMenu() {
    inquirer.prompt([{
        type: 'list',
        name: 'command',
        message: 'Select a command',
        choices: ['Start Flow', 'Stop Flow', 'Restart Flow', 'Check Status'],
    }])
        .then((answers) => {
            sendCommand(answers.command);  // Send selected command
        })
        .catch(err => {
            console.error("Error displaying menu:", err);
        });
}

// Function to send the selected command to MQTT
function sendCommand(command) {
    let mqttCommand;
    switch (command) {
        case 'Start Flow':
            mqttCommand = { command: 'Continue_flow' };
            break;
        case 'Stop Flow':
            mqttCommand = { command: 'Stop_flow' };
            break;
        case 'Restart Flow':
            mqttCommand = { command: 'Restart_flow' };
            break;
        case 'Check Status':
            mqttCommand = { command: 'Check_status' };
            break;
        default:
            console.log('Unknown command');
            return;
    }

    client.publish('gasTank/dashboard', JSON.stringify(mqttCommand));  // Publish to MQTT topic
    console.log(`Command: ${command} sent`);
}

// Listening for messages from the MQTT server
client.on('message', (topic, message) => {
    const msg = message.toString();
    console.log(`Received message: ${msg}`);

    // Once a message is received, show the menu again
    showMenu();  // Only show the menu after an event is received
});

client.subscribe('gasTank/dashboards');
