# spatialization-max
A Max/MSP patch for controlling audio channel gains and reverb across multiple speakers. 

This patch handles 16 virtual channels over which soundfile /play commands are presented. The /play commands include a channel number, soundfile path, and a loop indicator. The patch also takes /position commands which include a channel number and x,y,z coordinate in virtual sound space. The patch takes care of setting gain and reverb for each speaker in the system (curretnly up to 16) according to the sound's coordinate distance from each speaker. Arbitrary speaker confogurations for number (up to 16) and placement are possible, and expressed in JSON. The patch was designed for the 16 speaker CLEAT (Chicago Laboratory for Electro-Acoustic Theater) system, set up by Stephan Moore at Elastic Arts in Chicago, but includes examples and settings for a variety of 4-channel and binaural confifgurations. Virtual sources and number of speakers are independent. The fact that we use 16 virtual channels and 16 speakers is mainly coincidence. Increasing either of these could be readily achieved with customization. Using fewer of either would require no customization, except perhaps by creating a new JSON file for speaker geometry. 

The main patch is "Virt16SF-reverb.maxpat". Subpatches, JSON speaker config files, smaple sounds, and a required Javascript program are included in the distribution.

Control

The patch receives the /play and /position commands as OSC messages via a UDP port. This is useful for 
controller play events and spatial animation from external software (I use Unity for this). However, 
the patch could just as easily be fed from other Max patches, using send/receive. It is also possible to 
send /play commands and manipulate sound positions manually in the patch. It includes some examples of this. 

Speaker Configuration

The number of speakers and their positions is configured in a JSON file and loaded into a dict for speaker 
gain and reverb calculations for each sound source. We include some configurations for 16-chan, binaural, and various 4-chan geometries. The overal speaker space is -1 <= x,y <= +1; 0 <= z <= 1.

Speaker Rolloff:

The gain on each speaker for each virtual channel is a function of its distance from that speaker and a 
"rolloff" parameter. A Gaussian function is used to compute each speaker gain rolloff. Te rolloff 
parameter sets the "variance" of the Gaussian curve. This allows for smooth panning across speakers.

    gaini = e^^(-distancei^^2 / (2 * rolloff))

Reverb Parameters:

C1: A Sigmoid function is used as an activation function for reverb applied to each virtual channel 
per speaker. This allows for a flexible - fairly abrupt, or gradual  - use of reverb at desired distance 
thresholds. The shape of the curve is controlled by the "c1" parameter. A c1 value of .25 is gradual, 
a value of 2.0 is fairly steep.

C2: The distance value at which the function reaches its halfway point (.5) is controlled by this 
parameter. The reverb at each speaker is affected by sound source distance from each speaker.

    reverb_rolloff = 1/(1 + e^^(-c1 *(distance - c2)))

Wetness:
The overall amount of reverb relative to the "dry" source signal is also controlled by this parameter 
(0.0-1.0).

    reverb_gain = gain * reverb_rolloff * wetness

Reverberation Time: 
The reverberation time is controlled by this parameter, revtime, the reverb delay in milliseconds. 
This is multiplied by the reverb sigmoid for sound source distance from (0,0,0). That is, the reverb 
delay is not computed differently per speaker, but for distance from the origin of virtual playback space.

Dependencies

The patch uses the "ambimonitor" object from the ICST Ambisonics Package. This is used for display and 
manual manipulation of sound source positions in x,y,z virtual space. 

Getting Started with an Example

The main patch invokes 2 "/play" and 2 "/position" commands when started, to demonstrate positioning and playback on 2 virtual channels. The channel positions are initially (-0.4, 0.1, 0.2) and (0.4, -0.1, 0.4). These should appear in the "ambimonitor" graphic under "Virtual Channel Positions". These positions can be moved manually by selecting and dragging them in the ambimonitor. The loudness of each channel is also depending on their proximity to any speakers in the selected speaker 
configuration. Different speaker configurations for binaural, 4-channel, and 16-channel are available at the lower left 
of the main patch. Binaural is automatically selected on patch loading. 

