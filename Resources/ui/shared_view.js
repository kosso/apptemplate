// A shared view. 
// eg: Could be used for an audio player UI. 

// Some shared data object.
var data = {
	foo: 'bar',
	time:0
};

var is_running = false;
var timerMod = null, timer = null;

function setData (obj){
    data = obj;
}

function getData () {  
    return data;
}

function isRunning(){
	return is_running;
}

function start(){

	if(timerMod === null){

		timerMod = require('ti.mely');
		timer = timerMod.createTimer();
		timer.start({
			interval:1000
		});
		timer.addEventListener('onIntervalChange',update);
	
		is_running = true;
	
		console.log('started');
	}
}

function stop(){
	if(timer === null){
		return;
	}
	timer.stop();
	timer.removeEventListener('onIntervalChange',update);
	timer = null;
	timerMod = null;
	is_running = false;

	console.log('stopped');

}

function update(){

		data.time++;
		setData(data);
		console.log('updated:', data.time);
		Ti.App.fireEvent('player.update', data);
}


function createSharedView(args){

	var player_view = Ti.UI.createView(args);
	var label= Ti.UI.createLabel({
		text:'shared view with timer',
		top:6,
		left:10,
		right:10,
		height:Ti.UI.SIZE,
		color:'#777',
		textAlign:'center',
		font:{fontSize:12}
	});

	player_view.add(label);

	// Exmaple timer label to show the view is being updated independently from the context it's shown in. 
	var label_time = Ti.UI.createLabel({
		text:getData().time,
		top:30,
		left:10,
		right:10,
		height:Ti.UI.SIZE,
		color:'white',
		textAlign:'center',
		font:{fontSize:30, fontWeight:'bold'}
	});

	player_view.add(label_time);
	// Allow it to be referenced elsewhere
	player_view.label_time = label_time;

	// Receive update for the label
	Ti.App.addEventListener('player.update', function(d){
		label_time.text = d.time;
	});


	var btn_stop = Ti.UI.createButton({
		width:80,
		title:'stop',
		right:20
	});

	btn_stop.addEventListener('click', function() {
		stop();
	});
	player_view.add(btn_stop);

	var btn_start = Ti.UI.createButton({
		width:80,
		title:'start',
		left:20
	});
	btn_start.addEventListener('click', function() {
		start();
	});
	player_view.add(btn_start);

	return player_view;

}


exports.getData = getData;
exports.start = start;
exports.stop = stop;
exports.isRunning = isRunning;
exports.createSharedView = createSharedView;