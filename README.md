# spatialization-max
A Max/MSP patch for controlling audio channel gains and reverb across multiple speakers.

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
