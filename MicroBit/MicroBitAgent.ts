// ################################################################
// CS5041 Interactive Software And Hardware - Practical 3:
// 3D Model Viewing Via 3D Hand Gesture Controls:
//
// Author: 170004680
//
// Description:
// JavaScript code encompassing the logic performed by the Micro:Bit
// (MB) as the agent or relay in the system. The MBs are coded
// with the ability to operate both as a relay or the agent.
// 
// NOTE: This file must be loaded onto to MBs via MakeCode.
//
// Set-Up:
// MB Agent --radio--> MB Relay --serial--> Computer.
//
// ################################################################


// ################################################################
// ATTRIBUTES:
// ################################################################

let ID = "2"; // ID is UNIQUE to MB, although code is identical.
let MSG_DELIM = ":"; // Message delimiter over radio/serial.
radio.setGroup(10); // Setup radio for comms with other MB.

let isRelay = (ID == "1"); // Whether this MB is the relay.
let relayLED = false;

let isConn = false;

let prevAccelX : number | null = null;
let prevAccelY: number | null = null;
let prevAccelZ: number | null = null;
let prevPotVal: number | null = null;
let potValTol = 150; // So, 10 increments along the analogue reading.

// ################################################################
// SENDING MESSAGES: Not including forwarding...
// ################################################################

// SENDING SENSOR DATA:

basic.forever(function () {

    if (!isConn) { // Don't send data until accepted by computer.
        basic.showIcon(IconNames.No);
        sendMsg(createMsg("CONN", ""));
        return;
    }

    if (isRelay) return; // Relay does not send messages.

    // Periodically send sensor updates.
    let msgFreqMillis = 10 // Freq of updates.
    basic.pause(msgFreqMillis) // Pause as to not overrun comms.

    // Check if any fingers are connected and send messages as appropriate.
    if (pins.digitalReadPin(DigitalPin.P0) == 1) return sendFingerMessage("F1");
    else if (pins.digitalReadPin(DigitalPin.P1) == 1) return sendFingerMessage("F2");
    else if (pins.digitalReadPin(DigitalPin.P8) == 1) return sendFingerMessage("F3");
    else {
        // No fingers are connected, so nullify prev accel data.
        prevAccelX = null;
        prevAccelY = null;
        prevAccelZ = null;
        basic.clearScreen();
    }

    if (potChanged()) sendSensMessage();

})

function potChanged() {

    let potVal = pins.analogReadPin(AnalogPin.P2);

    if (prevPotVal === null || potVal < (prevPotVal - potValTol) || potVal > (prevPotVal + potValTol)) {
        prevPotVal = potVal; // Update pevPotVal;
        return true;
    } else {
        return false;
    }

}

function sendSensMessage() {

    sendMsg(createMsg("SENS", prevPotVal.toString())); // Send message to computer to update sensitivity.
    led.plotBarGraph(prevPotVal, 1023); // Display chnage to the user.
    basic.pause(300);

}

function sendFingerMessage(fingerStr : string) {

    // Get accelerometer values from the sensor to send in a message.
    let accelX = input.acceleration(Dimension.X);
    let accelY = input.acceleration(Dimension.Y);
    let accelZ = input.acceleration(Dimension.Z);

    // If first time finger connected, then update reference accelerometer readings.
    if (prevAccelX === null && prevAccelY === null && prevAccelZ === null) {
        prevAccelX = accelX;
        prevAccelY = accelY;
        prevAccelZ = accelZ;
        basic.showNumber(parseInt(fingerStr.charAt(1)));
    }

    // Send accelerometer data relative to accel data when finger first connected.
    // This is self-calibraitng to use the hand position when a finger is switched on as reference point.
    let accelStr = (accelX - prevAccelX) + "," + (accelY - prevAccelY) + "," + (accelZ - prevAccelZ);
    sendMsg(createMsg(fingerStr, accelStr));

}

// SENDING BUTTON A:

input.onButtonPressed(Button.A, function () {

    if (!isRelay) { // Send messages from this MB only if agent.

        // Create and send formatted BUTTON message.
        let buttonMsg = createMsg("BUTTON", "A")
        sendMsg(buttonMsg)

    }

})

// SENDING BUTTON B:

input.onButtonPressed(Button.B, function () {

    if (!isRelay) { // Send messages from this MB only if agent.

        // Create and send formatted BUTTON message.
        let buttonMsg = createMsg("BUTTON", "B")
        sendMsg(buttonMsg)

    }

})

// SENDING 'BUTTON' LOGO:

input.onLogoEvent(TouchButtonEvent.Released, function () {

    if (!isRelay) { // Send messages from this MB only if agent.

        // Create and send formatted BUTTON message.
        let buttonMsg = createMsg("BUTTON", "LOGO")
        sendMsg(buttonMsg)

    }

})

// GENERAL SENDING MESSAGES:

function createMsg(msgType: string, msgData: string) {

    // Message Format = ID:TYPE:DATA
    // , where ID is MB ID, type is "BUTTON", "LOGO", etc.
    // , and DATA is a string formatted acording to data sent.
    return (ID + MSG_DELIM +
        msgType + MSG_DELIM +
        msgData + "\n")

}

function sendMsg(msg: string) {

    if (isRelay) { // If this MB is the relay, send msg via serial.

        serial.writeLine(msg)

    } else { // If this MB is not the relay, send msg via radio.

        radio.sendString(msg)
    }

}


// ################################################################
// INCOMING MESSAGES:
// ################################################################

// INCOMING RADIO MESSAGES:

radio.onReceivedString(function (receivedMsg: string) {

    // Check if this MB is the recipient.
    // Necessarily checks that there is a msg w/ an ID.
    let isRecipient = checkRecipient(receivedMsg)

    // If so, process the message.
    if (isRecipient == 1) processMsg(receivedMsg)

    // If not, forward the message to serial if this is the relay.
    if (isRecipient == -1 && isRelay) serial.writeLine(receivedMsg)

})

// INCOMING SERIAL MESSAGES:

serial.onDataReceived(serial.delimiters(Delimiters.NewLine), function () {

    // Get message from serial.
    let receivedMsg = serial.readLine()

    // Check if this MB is the recipient.
    // Necessarily checks that there is a msg w/ an ID.
    let isRecipient = checkRecipient(receivedMsg)

    // If so, process the message.
    if (isRecipient == 1) processMsg(receivedMsg)

    // If not, forward the message to radio if this is the relay.
    if (isRecipient == -1 && isRelay) radio.sendString(receivedMsg)

})

// GENERAL RECEIVING METHODS:

function checkRecipient(receivedMsg: string) {

    if (!receivedMsg.isEmpty()) { // If there is a message.

        // Get ID associated with the message.
        let msgParts = receivedMsg.split(MSG_DELIM)
        let msgID = msgParts[0]

        if (!msgID.isEmpty()) { // If message has valid format.

            if (msgID == ID) { // This MB is recipient?
                return 1 // Is recipient.
            } else {
                return -1 // Not the recipient.
            }

        }
    }

    return 0 // No message or bad format, then ignore.

}

function processMsg(msg: string) {

    // Remove unwanted characters.
    msg = msg.trim()

    // Get the message payload.
    let msgParts = msg.split(MSG_DELIM);

    // Get the msg type and msg data from the message.
    let msgType = msgParts[1] // First item is type.
    let msgData = msgParts.slice(2) // The rest is data.

    // Process the message according to message type.
    switch (msgType) {

        case "CONN":
            processMsgConn(msgData);

        default:
            break; // Ignore all unrecognised message types.
    }

}

function processMsgConn(msgData : string[]) {

    if (msgData[0] != "ACC") return

    // Agent has been accepted - allow sending of sensor data.
    isConn = true;
    if (isRelay) basic.showArrow(ArrowNames.North);
    else basic.showIcon(IconNames.Yes);

}