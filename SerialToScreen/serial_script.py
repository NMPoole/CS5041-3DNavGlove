#######################################################################################################################
# CS5041 (Interactive Software And Hardware - Practical 3:
# 3D Model Viewing Via 3D Hand Gesture Controls:
#
# Author: 170004680
#
# Desc:
# This script will read messages from the Micro:Bit agent and convert said messaged into PyAutoGUI controls to map hand
# gestures to controls of the mouse for more intuitive 3D website interaction.
#
# Note - Overall Set-Up:
# MB Agent --radio--> MB Relay --serial--> Computer
# At computer, serial received by this script, which affects the mouse controls, which interfaces with 3D websites.
#
#######################################################################################################################

import pyautogui as pg  # Manipulating the mouse pointer; exploits backwards compatibility controls of 3D websites.
import serial  # Serial to connect with the relay MicroBit, which received data from the agent MicroBit.

#######################################################################################################################
# Serial Set-Up:
#######################################################################################################################

MSG_DELIM = ':'
conn_ID = ""

try:
    MB_Serial = serial.Serial('/dev/cu.usbmodem141102', 115200)  # Init serial and create port.
except serial.serialutil.SerialException:
    print("Could not establish a serial connection to the Micro:Bit. Plug the relay in and try again!")
    exit(-1)

accel_fact = 0.01  # Factor used to scale the incoming accelerometer data to a suitable amount of on screen pixels.
sens = 1  # Default multiplier of the pixels used to go faster or slower, depending on user input

pg.FAILSAFE = False
pg.MINIMUM_DURATION = 0.0
pg.MINIMUM_SLEEP = 0.0
pg.PAUSE = 0.0


#######################################################################################################################
# Message Processing:
#######################################################################################################################


def processGesture(gestureType, gestureData):

    accelValues = gestureData.split(",")

    if len(accelValues) != 3:  # Expect accel x, y, and z values.
        return
    else:  # Get accelerometer data from the message.
        try:
            accelX = int(accelValues[0])
            accelY = int(accelValues[1])
            accelZ = int(accelValues[2])
        except ValueError:
            return

    # Enact action on mouse based on message gesture content.
    if gestureType == "F1":
        xRel = -accelX * accel_fact * sens
        yRel = -accelY * accel_fact * sens
        print("F1 - LEFT CLICK DRAG: accelX=" + str(accelX) + ", accelY-=" + str(yRel))
        pg.dragRel(xRel, yRel, button='left', duration=0, _pause=None)  # Left click drag.
        return

    if gestureType == "F2":
        yRel = -accelY * accel_fact * sens
        print("F2 - SCROLL: accelY=" + str(accelY))
        pg.scroll(yRel, _pause=None)  # Scroll wheel controls.
        return

    if gestureType == "F3":
        xRel = -accelX * accel_fact * sens
        yRel = -accelY * accel_fact * sens
        print("F3 - RIGHT CLICK DRAG: accelX=" + str(accelX) + ", accelY=" + str(accelY))
        pg.dragRel(xRel, yRel, button='right', duration=0, _pause=None)  # Right click drag.
        return

    if gestureType == "F4":
        print("F4 - UP")
        pg.press("up")  # Pinky controls unassigned - map to reset.
        return


def processButton(button):

    if button == "A":  # Map 'A' to 'ArrowLeft' press on websites.
        print("A - LEFT")
        pg.press("left")
        return

    if button == "B":  # Map 'B' to 'ArrowRight' press on websites.
        print("B - RIGHT")
        pg.press("right")
        return

    if button == "LOGO":  # Map 'LOGO' to 'ArrowUp' press on websites.
        print("LOGO - UP")
        pg.press("up")
        return


def processSens(msgSensStr):

    global sens
    potMin = 0
    potMax = 1023
    sensMin = 1
    sensMax = 7

    try:
        potData = int(msgSensStr)  # Get potentiometer data from the message.
        # Map potentiometer reading between 0 and 1023 to a sensitivity between 1 and 10.
        sens = int(sensMin + (sensMax - sensMin) * ((potData - potMin) / (potMax - potMin)))
        print("SENS - Updated Sensitivity: " + str(sens))  # Output to console.
        return

    except ValueError:
        return


def processMsg(msg):

    global conn_ID

    # Dissect message into its components.
    msgParts = msg.split(MSG_DELIM)

    if len(msgParts) != 3:
        return

    msgID = msgParts[0]
    msgType = msgParts[1]
    msgPayload = msgParts[2]

    # Process message according to its type.
    if msgType == "CONN":
        print("CONNECTION - ID: " + msgID)
        conn_ID = msgID
        reply_str = msgID + MSG_DELIM + "CONN" + MSG_DELIM + "ACC" + "\n"
        reply_str = reply_str.encode()
        MB_Serial.write(reply_str)
        return

    if msgID != conn_ID:  # Do not accept messages sent from any agent/relay except the one connected.
        return

    if msgType == "BUTTON":
        processButton(msgPayload)
        return

    if msgType in ["F1", "F2", "F3"]:
        processGesture(msgType, msgPayload)
        return

    if msgType == "SENS":
        processSens(msgPayload)
        return


def readMsgs():

    print("Awaiting Messages From The Interactive Glove:")

    while True:
        in_data = str(MB_Serial.readline().decode('utf-8')).strip()  # Read from serial.
        if in_data:  # Message from serial is non-empty.
            processMsg(in_data)


#######################################################################################################################
# SCRIPT:
#######################################################################################################################

readMsgs()  # Perpetually read messages from serial.



