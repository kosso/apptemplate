// player
var data = {time:0};
var is_playing = false;
var timerMod, timer;

//var player_view = null;

function setData (obj){
    data = obj;
}

function getData () {  
    return data;
}

function start(){

  //var timer = require('ti.mely').createTimer();

	// function showUpdate(d){
	// 	var msg = "interval changed - interval set to " + d.interval + " interval count = " + d.intervalCount;
	// 	console.log(msg);
	// }

	// timer.addEventListener('onIntervalChange',showUpdate);
	
	// timer.start({
	// 	interval:1000,
	// 	debug:true
	// });
	if(timerMod == null){
		timerMod = require('ti.mely');

		console.log(timerMod);

		timer = timerMod.createTimer();

		console.log(timer);


		//setTimeout(function(){
	
			timer.start({
				interval:1000
			});

			is_playing = true;
		//}, 2000);


	}

	timer.addEventListener('onIntervalChange',update);


}

function update(){

		data.time++;

		console.log('time:', data.time);

		setData(data);

		Ti.App.fireEvent('player.update', data);

}

function stop(){

	timer.stop();
	timer.removeEventListener('onIntervalChange',update);
	timer = null;
	timerMod = null;
	is_playing = false;
}

function createPlayerView(args){

	// if(player_view != null){
	// 	console.log('got existing player_view');
	// 	return player_view;
	// }

	var player_view = Ti.UI.createView(args);

	var label= Ti.UI.createLabel({
		text:'player',
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

	Ti.App.addEventListener('player.update', function(d){
		label_time.text = d.time;
		
	});


	return player_view;


}

function isPlaying(){
	return is_playing;
}

// The special variable 'exports' exposes the functions as public
exports.setData = setData;
exports.getData = getData;

exports.start = start;
exports.stop = stop;
exports.isPlaying = isPlaying;


exports.createPlayerView = createPlayerView;


