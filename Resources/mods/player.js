// A shared view. 
// eg: Could be used for an audio player UI. 

// Some shared data object.
var data = {
	time:0
};

var is_playing = false;
var timerMod, timer;

function setData (obj){
    data = obj;
}

function getData () {  
    return data;
}

function start(){

	if(timerMod == null){

		timerMod = require('ti.mely');
		timer = timerMod.createTimer();
		timer.start({
			interval:1000
		});
		is_playing = true;
	
		console.log('started');
	}

	timer.addEventListener('onIntervalChange',update);

}

function stop(){

	timer.stop();
	timer.removeEventListener('onIntervalChange',update);
	timer = null;
	timerMod = null;
	is_playing = false;

	console.log('stopped');

}


function update(){

		data.time++;
		setData(data);
		console.log('updated:', data.time);
		Ti.App.fireEvent('player.update', data);

}


function createPlayerView(args){

	var player_view = Ti.UI.createView(args);
	var label= Ti.UI.createLabel({
		text:'shared view with timer',
		top:10,
		left:10,
		right:10,
		height:Ti.UI.SIZE,
		color:'#777',
		font:{fontSize:14}
	});

	player_view.add(label);

	var label_time = Ti.UI.createLabel({
		text:getData().time,
		top:30,
		left:10,
		right:10,
		height:Ti.UI.SIZE,
		color:'white',
		font:{fontSize:20, fontWeight:'bold'}
	});

	player_view.add(label_time);

	player_view.label_time = label_time;

	// Receive update
	Ti.App.addEventListener('player.update', function(d){
		label_time.text = d.time;
	});

	return player_view;

}

function isPlaying(){
	return is_playing;
}

exports.getData = getData;
exports.start = start;
exports.stop = stop;
exports.isPlaying = isPlaying;
exports.createPlayerView = createPlayerView;