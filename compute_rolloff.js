inlets = 6;
outlets = 2;
//setinletassist(0,"audio source position");
//setoutletassist(2,"array of gains for each speaker");

/* 	For a given audio source and its position, 
 	compute 
		1) the distances to each speaker 
		2) the derived gain, given our rolloff function.
		
		Output a set of matrix messages for setting the audio source gain at each speaker
		
*/

var rolloff = 0.25;
var c1 = 1.0;
var c2 = 1.5;
var wetness = 0.85;
var reverbtime = 10.0;

var speakerDictionary;
var channel_count;

if (jsarguments.length>0) {
	speakerDictionary = new Dict(jsarguments[1]);  
} else {
	speakerDictionary = new Dict("speakers");
}

if (jsarguments.length>1) {
	channel_count = jsarguments[2];  
} else {
	channel_count = 16;
}

function msg_float(v)
{
    if (inlet == 1) rolloff = v;
    if (inlet == 2) c1 = v;
    if (inlet == 3) c2 = v;
    if (inlet == 4) wetness = v;
    if (inlet == 5) reverbtime = v;
}
	
		
function gain_gaussian(distance, variance) {
	
	return Math.exp(-Math.pow(distance, 2) / (2 * variance));;
	
	}
	
function list()
{
	var chan = arguments[0];
	var x = arguments[1];
	var y = arguments[2];
	var z = arguments[3];
			
	var keys = speakerDictionary.getkeys();
	var gains = String[keys.length];
	
		//compute dstance
	var rev_distance = Math.abs( Math.sqrt (Math.pow(x,2)  + Math.pow(y,2)  + Math.pow(z,2)));
	var reverb_rolloff = 1.0 / (1.0 + (Math.exp(-1.0 * c1 * (rev_distance - c2))));
   	var revtime = reverb_rolloff * reverbtime;

   	outlet(1, chan , revtime); // sends a list 4 5 6 out second-from-left
  //	post("rev_distance:" + rev_distance + ", reverb_rolloff:" + reverb_rolloff + ", revtime:" + revtime + ", reverbtime:" + reverbtime + "\n");

	for(var i = 0; i < keys.length; i++){
		var speaker = speakerDictionary.get(keys[i]);
		var loc_x = speaker.get("loc_x");
		var loc_y = speaker.get("loc_y");
		var loc_z = speaker.get("loc_z");

		//compute dstance
		var distance = Math.abs( Math.sqrt (Math.pow(loc_x - x,2)  + Math.pow(loc_y - y,2)  + Math.pow(loc_z - z,2)));

		// compute gain
		var gain = gain_gaussian(distance,rolloff);
	//	post("Speaker " + keys[i] + " is at (" + loc_x + "," + loc_y + "," + loc_z + ") and " + distance + " away and gain:" + gain + "\n");

		// compute reverb parameters 
   		var reverb_rolloff = 1.0 / (1.0 + (Math.exp(-1.0 * c1 * (distance - c2))));
    	var reverb_gain = gain * reverb_rolloff * wetness;
  	//	post("distance " + i + ":" + distance + ", reverb_rolloff:" + reverb_rolloff + ", wetness:" + wetness + ", reverbtime:" + reverbtime + "\n");
		
		outlet(0, chan, i, gain); // sends a list 4 5 6 out second-from-left
		outlet(0, chan+channel_count, i, reverb_gain); // sends a list 4 5 6 out second-from-left

	}
	

}



