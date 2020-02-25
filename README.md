# spatialization-max
A Max/MSP patch for controlling audio channel gains and reverb across multiple speakers. 

This patch handles 16 virtual channels over which soundfile /play commands are presented. The /play commands include a channel number, soundfile path, and a loop indicator. The patch also takes /position commands which include a channel number and x,y,z coordinate in virtual sound space. The patch takes care of setting gain and reverb for each speaker in the system (curretnly up to 16) according to the sound's coordinate distance from each speaker. Arbitrary speaker confogurations for number (up to 16) and placement are possible, and expressed in json. The patch was designed for the 16 speaker CLEAT (Chicago Laboratory for Electro-Acoustic Theater) system, set up by Stephan Moore at Elastic Arts in Chicago, but includes examples and settings for a variety of 4-channel and binaural confifgurations. Virtual sources and number of speakers are decoupled. The fact that we use 16 virtual channels and 16 speakers is mainly coincidence. 

The patch receives the /play and /position commands as OSC messages via a UDP port. This is useful for controller play events and spatial animation from external software (I use Unity for this). However, the patch could just as easily be fed from other Max patches, using send/receive. It is also posible to send /play commands and manipulate sound positions manually in the patch. It includes some examples of this. 

Speaker Configuration
The number of speakers and their positions is configured in a json file and loaded into a dict for speaker gain calculations. We include some configurations for 16-chan, binaural, and various 4-chan geometries. The overal speaker space is -1 <= x,y <= +1; 0 <= z <= 1.

Speaker Rolloff
The gain on each speaker for each virtual channel is a function of its distance from that speaker and a "rolloff" parameter. A Gaussian function is used to compute each speaker gain rolloff. Te rolloff parameter sets the "variance" of the Gaussian curve. This allows for smooth panning across speakers.

gaini = e^^(-distancei^^2 / (2 * rolloff))

Reverb Settings
C1: A Sigmoid function is used as an activation function for reverb applied to each virtual channel per speaker. This allows for a flexible - fairly abrupt, or gradual  - use of reverb at desired distance thresholds. The shape of the curve is controlled by the "c1" parameter. A c1 value of .25 is gradual, a value of 2.0 is fairly steep.

C2: The distance value at which the function reaches its halfway point (.5) is controlled by this parameter. 

reverb_rolloff = 1/(1 + e^^(-c1 *(distance - c2)))

The reverb at each speaker is affected by sound source distance from each speaker. 

Wetness:
Wetness: The overall amount of reverb relative to the "dry" source signal is also controlled by this parameter.

reverb_gain = gain * reverb_rolloff * wetness

Reverberation Time: 
The reverberation time is controlled by this parameter, revtime, the reverb delay in milliseconds. This is multiplied by the reverb sigmoid for sound source distance from (0,0,0). That is, the reverb delay is not computed differently per speaker, but for distance from the origin of virtual playback space.

The main patch is "Virt16SF-reverb.maxpat". Subpatches, JSON speaker config files, smaple sounds, and a required Javascript program are included in the distribution.

Dependencies:
Currently using the "ambimonitor" from ICST Ambisonics Package - for display and manual manipulation of sound source positions in x,y,z virtual space. 

