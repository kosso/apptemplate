// Dummy Home window

function createWindow() {

	var functions = require('/lib/functions');
	var shared_view = require('/ui/shared_view');

	console.log('home shared_view.time: ', shared_view.getData().time);

	var _args = {
      top:0,
      left:0,
      right:0,
      bottom:0,
      zIndex:2,
      fullscreen:true,
      navBarHidden:true,
      tabBarHidden:true,
      navTintColor:'#fff',
      tintColor:'#fff',
      backgroundColor:'#888'
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
		functions.openWindowModule(self, '/ui/window_help'); // :reference to this window, path to JS module
	});
	top_bar.add(btn_help);

	var btn_settings = Ti.UI.createButton({
		title:'settings',
		right:20
	});
	btn_settings.addEventListener('click', function() {
		functions.openWindowModule(self, '/ui/window_settings'); // :reference to this window, path to JS module
	});
	top_bar.add(btn_settings);
	

	var scrollView = Ti.UI.createScrollView({
		top:50,
		left:0,
		right:0,
		bottom:80,
		zIndex:1,
		backgroundColor:'#aa000000',
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
		text:'welcome home',
		top:10,
		left:80,
		right:20,
		height:Ti.UI.SIZE,
		color:'#ddd',
		font:{fontSize:16}
	});

	scrollView.add(label_body);




	var btn_help = Ti.UI.createButton({
		title:'help',
		left:20
	});
	btn_help.addEventListener('click', function() {

		functions.openWindowModule(self, '/ui/window_help'); // :reference to this window, path to JS module
	});
	top_bar.add(btn_help);


	var btn_stop = Ti.UI.createButton({
		top:10,
		title:'stop',
		left:20
	});
	btn_stop.addEventListener('click', function() {
		shared_view.stop();
	});
	scrollView.add(btn_stop);

	var btn_start = Ti.UI.createButton({
		top:10,
		title:'start',
		left:20
	});
	btn_start.addEventListener('click', function() {
		shared_view.start();
	});
	scrollView.add(btn_start);

	var sharedView = shared_view.createSharedView({
		bottom:0,
		height:80,
		width:Ti.UI.FILL,
		backgroundColor:'#222'
	});

	self.add(sharedView);



	
	/*
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
	*/

	/*	
	if(Ti.Platform.osname==='android'){

	} else {
		Ti.App.addEventListener('resumed', function(e){
			console.log('APP RESUMED');
		});
	}
	*/


	if(Ti.Platform.osname==='android'){

		self.addEventListener('android:back', function(e){

			if(shared_view.isRunning()){

				var close_warning_msg = 'The timer is running. Are you sure you want to exit?';
				var close_warning_opts = {
					cancel: 0,
					buttonNames: ['CANCEL', 'EXIT'],
					destructive: 1,
					message: close_warning_msg
				};

    		var cexitDlg = Ti.UI.createAlertDialog(close_warning_opts);
      	cexitDlg.addEventListener('click', function(e){
      		if(e.index===1){

      			shared_view.stop();
      			
	          console.log('KILL APP');
		        Ti.Android.currentActivity.finish();
      		}
      	});
      	cexitDlg.show();

    	} else {
    		Ti.Android.currentActivity.finish();
    	}
    });
	}

	return self;
};





exports.createWindow = createWindow;