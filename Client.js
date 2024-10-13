const mqtt = require('mqtt'); // Include the MQTT package
const client = mqtt.connect('mqtt://broker.hivemq.com:1883'); // Replace with your broker URL

client.on('connect', function () {
    console.log('Connected to broker');
    startFlow(); // Start the flow once connected
});

let flow = 0; // Start flow at 0
let pressure = 0;
let publishFlow;
let flowInProgress = false;
let flowStoppedPermanently = false;

function startFlow() {
    if (!flowInProgress && !flowStoppedPermanently) {
        flowInProgress = true;
        console.log("Flow started");
        increasePressure();
    }
}

function RestartFlow() {
    flowInProgress = true;
    flowStoppedPermanently = false;
    console.log("Flow restarted");
    flow = 0; // Reset the flow value for the next cycle
    pressure = 0;
    startFlow();
}
function ContinueFlow() {
    flowInProgress = true;
    console.log("Flow resumed");
    increasePressure();
}
function StopFlow() {
    flowInProgress = false;
    console.log("Flow paused");
}
function stopFlowPermanently() {
    flowInProgress = false;
    flowStoppedPermanently = true;
    console.log("Flow permanently stopped due to emergency");
}

function increasePressure() {
    if (flowInProgress && !flowStoppedPermanently) {
        pressure = flow + Math.random() * 40; // Increase by a random amount
        flow = pressure; // Update the flow value
        console.log(`Published pressure: ${pressure}`);
        client.publish('gasTank/pressure', JSON.stringify({ pressure }));

        if (pressure > 120) {
            console.log('Explode! Emergency!');
        } else if (pressure > 100) {
            console.log('Done! Next flow begin.');
        }
    }
}
client.subscribe('gasTank/commands');
client.on("message", function (topic, message) {
    const msg = message.toString();
/*    console.log(`Received message: ${msg} on topic: ${topic}`); */
    if (msg.includes("RESTART_FLOW")) {
        console.log("Command: Restart_FLOW received");
        RestartFlow();
    } else if (msg.includes("CONTINUE_FLOW")) {
        console.log("Command: CONTINUE_FLOW received");
        increasePressure();
    } else if (msg.includes("EXPLODE_EMERGENCY")) {
        console.log("Command: EXPLODE_EMERGENCY received");
        stopFlowPermanently();
    } else if (msg.includes("STOP_FLOW")) {
        console.log("Command: Stop flow received");
        StopFlow();
    } else if (msg.includes("RESUMED_FLOW")) {
        console.log("Command: Resume received");
        ContinueFlow();
    }
});
