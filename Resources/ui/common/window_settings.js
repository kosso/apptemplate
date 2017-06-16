// Info/Help tab Main window
function createWindow() {

	var functions = require('/mods/functions');

	var player = require('/mods/player');
	console.log('settings player.time: ', player.getData().time);

	// player.setData({
	// 	time:100
	// });

	var _args = {
        top:0,
        left:0,
        right:0,
        bottom:100,
        zIndex:2,
        fullscreen:true,
        navBarHidden:true,
        tabBarHidden:true,
        navTintColor:'#333',
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

	var btn_help = Ti.UI.createButton({
		title:'help',
		right:20
	});
	btn_help.addEventListener('click', function() {

		functions.openWindowModule(self, '/ui/common/window_help'); // :reference to this window, path to JS module
	});
	top_bar.add(btn_help);


	var btn_back = Ti.UI.createButton({
		title:'< ',
		left:10
	});

  btn_back.addEventListener('click', function(){
      self.close({animated:true});
  });
  top_bar.add(btn_back);


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
		text:'Settings',
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


	
	return self;
};

exports.createWindow = createWindow;