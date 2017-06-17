// Info/Help tab Main window
function createWindow(config) {

	var functions = require('/mods/functions');

//	var player = require('/mods/player');
	console.log('help player.time: ', player.getData().time);

	// player.setData({
	// 	time:1000
	// });


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
        backgroundColor:'#333'
    };
    if(Ti.Platform.osname==='android'){
    	_args.windowSoftInputMode = Ti.UI.Android.SOFT_INPUT_STATE_HIDDEN // Stops textfield in scrollview getting immediate focus
    }
	var self = Ti.UI.createWindow(_args);

	var top_bar = Ti.UI.createView({
		top:0,
		left:0,
		right:0,
		height:50,
		backgroundColor:'#111'
	});
	self.add(top_bar);

	var btn_back = Ti.UI.createButton({
		title:'< ',
		left:10
	});

	btn_back.addEventListener('click', function(){
  	var _close_args = {
      animated:true
  	};
  	if(Ti.Platform.osname==='android'){
  		_close_args.activityEnterAnimation = Ti.App.Android.R.anim.still;
     _close_args.activityExitAnimation = Ti.App.Android.R.anim.slide_out;
  	}
  	self.close(_close_args);
  });
  
  top_bar.add(btn_back);


	var scrollView = Ti.UI.createScrollView({
		top:50,
		left:0,
		right:0,
		bottom:80,
		zIndex:1,
		backgroundColor:'transparent',
		contentHeight:Ti.UI.SIZE,
		scrollType:'vertical',
		layout:'vertical'
	});
	self.add(scrollView);

	var label_title = Ti.UI.createLabel({
		text:'Help!',
		top:20,
		left:80,
		right:20,
		height:Ti.UI.SIZE,
		color:'white',
		font:{fontSize:20, fontWeight:'bold'}
	});

	scrollView.add(label_title);


	var label_body = Ti.UI.createLabel({
		text:'is on the way',
		top:10,
		left:80,
		right:20,
		height:Ti.UI.SIZE,
		color:'#ddd',
		font:{fontSize:16}
	});

	scrollView.add(label_body);

	var btn_stop = Ti.UI.createButton({
		top:10,
		title:'stop',
		left:20
	});
	btn_stop.addEventListener('click', function() {
		player.stop();
	});
	scrollView.add(btn_stop);

	var btn_start = Ti.UI.createButton({
		top:10,
		title:'start',
		left:20
	});
	btn_start.addEventListener('click', function() {
		player.start();
	});
	scrollView.add(btn_start);



	var playerView = player.createPlayerView({
		bottom:0,
		height:80,
		width:Ti.UI.FILL,
		backgroundColor:'#222'
	});

	self.add(playerView);


	// Ti.App.addEventListener('player.update', function(d){
	// 	label_body.text = d.time;
		
	// });

	// self.getPlayer = function(){

	// 	console.log('playerView:',playerView);
	// 	self.add(playerView);

	// };

	// self.addEventListener('close', function(){
		
	// 	config.parentWin.getPlayer();

	// });

	return self;
};

exports.createWindow = createWindow;