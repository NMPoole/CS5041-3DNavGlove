# CS5041-3DNavGlove

This repository demonstrates work completed as part of the **CS5041 Interactive Hardware And Software** module for Practical 3. 
The purpose of this practical was to explore and demonstrate the use of both hardware and software interfacing with each other to create an interesting 
human-computer interaction (HCI) project. This work has been documented in the provided _Report_.

The transition of computer interaction being based around virtual 2D environments to 3D environments has long been occurring. 
More recently, this idea of interacting with a 3D computer environment has been emphasized by augmented and virtual reality technologies. 
The reach of such technologies is pervasive and ever-growing. Thus, it appears the march towards a ‘Meta-verse’ is increasingly likely, where 
human-computer interaction is dominated by a need to interact with a 3D world.

This project is a case study, specifically exploring the more niche domain of 3D websites. 3D websites differ from their traditional counterparts in 
that web content is embedded within a 3D environment of some form. To this end, this project saw the creation of a glove device which translates 3D hand 
gestures into controls for navigating and interacting with 3D website environments. Such a device can be used to transition users towards more intuitive, 
3D-appropriate interactions without the need for VR. The use of gloves as input devices is likely more appropriate than current hand-held VR controllers 
on the market.

The prototype for the interactive system combines and extends upon many concepts within the module: Micro:Bits have been used for bidirectional wireless 
interaction using a custom IO device, various inputs and outputs have been connected via circuitry (buttons, capacitive touch, custom finger switches, 
potentiometer, accelerometer, LED displays, and 3D environment display), PyAutoGUI has been used for generalizing interaction for many applications, and 
a 3D website has been created showcasing different applications of the 3D hand-gesture glove within the context of 3D websites.

Furthering the quality of this system, various components have been refined with quality-of-life improvements: set-up of the system follows a handshake 
protocol and the status of this is shown to the user, the sensitivity of interactions can be adjusted by the user on the glove, and 3D hand-gesture 
interactions involve self-calibration for increased ergonomic use of the glove.
