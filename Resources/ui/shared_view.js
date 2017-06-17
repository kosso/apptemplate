// A shared view. 
// eg: Could be used for an audio player UI. 

// Some shared data object.
var data = {
	foo: 'bar',
	time:0
};

var is_running = false;
var timer_interval = null;

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

	if(timer_interval === null){		
		timer_interval = setInterval(update, 1000);
		is_running = true;
		console.log('started');
	}
}

function stop(){
	if(timer_interval === null){
		return;
	}
	clearInterval(timer_interval);
	timer_interval = null;
	is_running = false;
	console.log('stopped');

}

function update(){
		// Let's just increment this to demonstrate the update. 
		data.time++;
		setData(data);
		console.log('updated:', data.time);
		// Update it, where it may be,
		Ti.App.fireEvent('timer.update', data);
}


function createSharedView(args){

	var shared_view = Ti.UI.createView(args);
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

	shared_view.add(label);

	// Example timer label to show the view is being updated independently from the context it's shown in. 
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

	shared_view.add(label_time);
	// Allow it to be referenced elsewhere
	shared_view.label_time = label_time;

	// Receive update for the label
	Ti.App.addEventListener('timer.update', function(d){
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
	shared_view.add(btn_stop);

	var btn_start = Ti.UI.createButton({
		width:80,
		title:'start',
		left:20
	});
	btn_start.addEventListener('click', function() {
		start();
	});
	shared_view.add(btn_start);

	return shared_view;

}


exports.getData = getData;
exports.start = start;
exports.stop = stop;
exports.isRunning = isRunning;
exports.createSharedView = createSharedView;