// Home tab Main window

function createWindow() {

	var functions = require('/mods/functions');

	var player = require('/mods/player');

	var t = 0;

	var timer = setInterval(function(){

		console.log(t);
		t++;
		var d = {time:t};

		player.setData(d);

		Ti.App.fireEvent('player.update', d);

	},1000);






	console.log('home player.time: ', player.getData().time);


	var _args = {
        top:0,
        left:0,
        right:0,
        bottom:0,
        zIndex:2,
        fullscreen:true,
        navBarHidden:true,
        // tabBarHidden:true,
        navTintColor:'#333',
        tintColor:'#fff',
        backgroundColor:'#ff9900'
    };
    if(Ti.Platform.osname==='android'){
    	_args.windowSoftInputMode = Ti.UI.Android.SOFT_INPUT_STATE_HIDDEN // Stops textfield in scrollview getting immediate focus
    }

    //if(!functions.isTablet()){
    //	_args.orientationModes = [Ti.UI.PORTRAIT, Ti.UI.UPSIDE_PORTRAIT];
    //}

	var self = Ti.UI.createWindow(_args);


	var top_bar = Ti.UI.createView({
		top:0,
		left:0,
		right:0,
		height:50,
		backgroundColor:'#111'
	});
	self.add(top_bar);

	var cont = Ti.UI.createView({
		top:50,
		left:0,
		right:0,
		bottom:0,
		layout:'vertical'
	});

	self.add(cont);

	
	var btn_help = Ti.UI.createButton({
		title:'help',
		left:20
	});
	btn_help.addEventListener('click', function() {

		functions.openWindowModule(self, '/ui/common/window_help'); // :reference to this window, path to JS module
	});
	top_bar.add(btn_help);

	var btn_settings = Ti.UI.createButton({
		title:'settings',
		right:20
	});
	btn_settings.addEventListener('click', function() {
		functions.openWindowModule(self, '/ui/common/window_settings'); // :reference to this window, path to JS module
	});
	top_bar.add(btn_settings);
	

	var msg_bar = Ti.UI.createView({
		top:0,
		left:0,
		right:0,
		height:Ti.UI.SIZE,
		backgroundColor:'#333',
		layout:'vertical'
	});

	//msg_bar.addEventListener('click', function(e){
		// hide it
		//functions.setMessage(msg_bar,null);
	//});

	msg_bar.addEventListener('postlayout', function(e){
		//console.log('msg_bar: ');
		//console.log(JSON.stringify(e.source.rect));
	});

	cont.add(msg_bar);



	var scrollView = Ti.UI.createScrollView({
		top:50,
		left:0,
		right:0,
		bottom:0,
		zIndex:1,
		backgroundColor:'transparent',
		contentHeight:Ti.UI.SIZE,
		scrollType:'vertical',
		layout:'vertical'
	});
	self.add(scrollView);

	var label_title = Ti.UI.createLabel({
		text:'Home',
		top:20,
		left:80,
		right:20,
		height:Ti.UI.SIZE,
		color:'white',
		font:{fontSize:20, fontWeight:'bold'}
	});

	scrollView.add(label_title);


	var label_body = Ti.UI.createLabel({
		text:player.getData().time,
		top:10,
		left:80,
		right:20,
		height:Ti.UI.SIZE,
		color:'#ddd',
		font:{fontSize:16}
	});

	scrollView.add(label_body);


	Ti.App.addEventListener('player.update', function(d){
		label_body.text = d.time;
		
	});



	self.addEventListener('focus', function(){
		

	});

	
	
	var is_landscape = functions.isLandscape();

	Ti.Gesture.addEventListener('orientationchange', function(e){
		//console.log('orientationchange: ', e);
		if(e.orientation===6 || e.orientation===5){
			return;
		}

		if(functions.isLandscape() === is_landscape){
			//console.log('NO orientation change');
			return;
		}

		is_landscape = functions.isLandscape();

		// console.log(functions.getDeviceWidth()+ ' x ' + functions.getDeviceHeight());
	
	});

	
	if(Ti.Platform.osname==='android'){



	} else {

		Ti.App.addEventListener('resumed', function(e){
			
			console.log('APP RESUMED');
			
		});

	}

	// if(Ti.Platform.osname==='android'){

	// 	self.addEventListener('android:back', function(e){

	// 		console.log('ANDROID:BACK!! ');

 //    });
	// }



	return self;
};





exports.createWindow = createWindow;