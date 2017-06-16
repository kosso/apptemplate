// view_player

/* 
Creates two visual players. One at the top (small) - which lives at the bottom of the screen 
and one large full screen sized one below it. When the view is animated up far enough, you only see the large one. Etc.
*/

function createPlayerView(args, playlist) {

	var functions = require('/mods/functions');

	if(Ti.App.audio_player1!==null && Ti.App.audio_player1.playing){
		Ti.App.audio_player1.stop();
		Ti.App.audio_player1 = null;
	}
	if(Ti.App.audio_player2!==null && Ti.App.audio_player2.playing){
		Ti.App.audio_player2.stop();
		Ti.App.audio_player2 = null;
	}

	args = args || null;

	var status;
	var current_index = -1;
	var current_tune = playlist[0];
	
	current_tune.current_time = 0; // ms
	
	var Control;

	var controls, btn_controls, btn_prev, btn_next;


	var mediainspector = require('com.kosso.mediainspector');

	// For lockscreen info on iOS only
	if(Ti.Platform.osname!=='android'){
		Control = require('com.kosso.audioplayerios');
		// Detect iOS media player remote control clicks. 
		Control.addEventListener('remotecontrol', function(e){
			console.log('remotecontrol : ', e);
			if(e.subtype==100 || e.subtype==101){ // Play or Pause lockscreen buttons.
				playPause();
			} else if(e.subtype==105){ // back
				if(current_index > 0){
					current_index--;
					self.selectPlaylistIndex(current_index);
				}
			} else if(e.subtype==104){ // forward
				if(current_index < playlist.length - 1){
					current_index++;
					self.selectPlaylistIndex(current_index);
				}
			}
		});
	}


	var current_player = 'audio_player1';

	var self = Ti.UI.createView(args);

	self.player_up = false;	
	var _top = args.top;
	var _pvh = args.pvh; // player view height

	var col_cont = Ti.UI.createView({
		width:Ti.UI.FILL,
		height:Ti.UI.FILL,
		backgroundColor:'#FFFFFF',
		opacity:0.3
	});
	self.add(col_cont);


	var line = Ti.UI.createView({
		backgroundColor:'#22eeeeee',
		height:2,
		top:0,
		touchEnabled:false,
		width:Ti.UI.FILL
	});
	self.add(line);

	var color_ok = '#225499';
	var color_error = '#440000';

	var icon_play = '\uf144';
	var icon_pause = '\uf28b';
	var icon_stop = '\uf28d';

	var icon_fwd = '\ue92b';
	var icon_back = '\ue92a';

	var artwork = null;

		// initialise player 1
	var audio_player1 = Ti.App.audioplayer.createPlayer({ 
		allowBackground: true,	// Android only. iOS ignores.
		//lifecycleContainer: win // Android only. iOS ignores.
	});
	audio_player1.name = 'audio_player1';
	audio_player1.setVolume(0.0);
	Ti.App.audio_player1 = audio_player1;
	// initialise player 2
	var audio_player2 = Ti.App.audioplayer.createPlayer({ 
		allowBackground: true,	// Android only. iOS ignores.
		//lifecycleContainer: win // Android only. iOS ignores.
	});
	audio_player2.name = 'audio_player2';
	audio_player2.setVolume(0.0);
	Ti.App.audio_player2 = audio_player2;

	var btn_control = functions.createIconButton(icon_play,60,'#dddddd','#568ad0');
    btn_control.width = 60;
    btn_control.height = 90;
    //btn_control.borderColor = 'red';
    btn_control.zIndex = 200;
    btn_control.top = 14;
    btn_control.right = 8;

	self.add(btn_control);
	self.btn_control = btn_control;

	artwork = Ti.UI.createImageView({
			touchEnabled:false,
			top:10,
			left:8,
			width:60,
			height:60,
			defaultImage:'/images/ai-trans.png',
			image:'/images/ai-trans.png'
		});
	self.add(artwork);

	if(current_tune.amazingtunes_url!==undefined){
		functions.cacheImage(current_tune, function(data){
			artwork.image = data.image;

			var _dom = mediainspector.getDominantColour(data.path);
			// console.log('>>>> ' + _dom);
			col_cont.backgroundColor = '#'+_dom.substring(2,8);

		}, true); // true for player view. Names image differently to avoid caching collision. 
	} 

	var view = Ti.UI.createView({
		layout:'vertical',
		top:5,
		left:68,
		right:65,
		height:Ti.UI.SIZE
	});

	var sliderOptions = {
		top:0,
		left:10,
		min:0,
		max:100,
		value:0,
		height:20,
		right:10,
		thumbImage:'/images/button_10.png',
		highlightedThumbImage:'/images/buttonOver_10.png',
		rightTrackImage:'/images/bar.png',
		leftTrackImage:'/images/barOver.png'
	};
	if(Ti.Platform.osname==='android'){
		sliderOptions.left = -5;
		sliderOptions.right = -10;
		sliderOptions.thumbImage = '/images/button_10.png';
		sliderOptions.highlightedThumbImage = '/images/buttonOver_10.png';
	}

	// Scrubber slider
	var slider = Ti.UI.createSlider(sliderOptions);
	view.add(slider);
	self.slider = slider;

	var _sliding = false;
	var _seeking = false;

	function seekCompleteHandler(e){
		console.log('seekCompleteHandler!', e);
		
		e.source.play();
		btn_control.text = icon_pause;
		btn_controls.text = icon_pause;
		current_tune.current_time = e.time;

		updateLockScreen(current_tune, 1.0);

	}
	audio_player1.addEventListener('seekcomplete', seekCompleteHandler);
	audio_player2.addEventListener('seekcomplete', seekCompleteHandler);

	slider.addEventListener('start', function(e){
		_sliding = true;
		
		updateLockScreen(current_tune, 0.0);

	});
	slider.addEventListener('change', function(e){
		if(_sliding){
			//console.log('slider change: ', e.value);
			if(audio_player1.playing || audio_player1.paused){
				audio_player1.pause();
				label_time.text = functions.msecsToSecsAndMinutes(Math.ceil((e.value / 100) * (current_tune.duration_secs * 1000))) + ' / ' + functions.msecsToSecsAndMinutes(current_tune.duration_secs * 1000);
			}
			if(audio_player2.playing || audio_player2.paused){
				audio_player2.pause();
				label_time.text = functions.msecsToSecsAndMinutes(Math.ceil((e.value / 100) * (current_tune.duration_secs * 1000))) + ' / ' + functions.msecsToSecsAndMinutes(current_tune.duration_secs * 1000);
			}

			btn_control.text = icon_play;
			btn_controls.text = icon_play;
		}
	});
	slider.addEventListener('stop', function(e){
		// console.log('slider stop: ', e);
		_sliding = false;
		// seek
		var _ms = 0;
		if(audio_player1.paused){
			_ms = Math.round((e.value / 100) * audio_player1.duration);
			// console.log('seek player1 to: '+_ms);
			_seeking = true;
			audio_player1.seek(_ms);
		}
		if(audio_player2.paused){
			_ms = Math.round((e.value / 100) * audio_player2.duration);
			// console.log('seek player2 to: '+_ms);
			_seeking = true;
			audio_player2.seek(_ms);
		}
	});

	var label_title = Ti.UI.createLabel({
		text:current_tune.title,
		top:3,
		left:10,
		right:0,
		height:24,
		color:'#eee',
		font:{fontSize:18, fontWeight:'bold'},
		wordWrap:false,
		touchEnabled:false
	});
	view.add(label_title);

	var label_artist = Ti.UI.createLabel({
		text:current_tune.artist,
		top:5,
		left:10,
		right:0,
		color:'#ccc',
		height:22,
		font:{fontSize:16},
		wordWrap:false,
		touchEnabled:false
	});
	view.add(label_artist);

	var label_time = Ti.UI.createLabel({
		text:'',
		top:5,
		left:10,
		width:'50%',
		height:14,
		color:'#ffffcc',
		font:{fontSize:12},
		touchEnabled:false
	});
	view.add(label_time);

	var label_playlist = Ti.UI.createLabel({
		text:'',
		top:-14,
		width:'50%',
		right:10,
		height:14,
		color:'#cccccc',
		textAlign:'right',
		font:{fontSize:10},
		touchEnabled:false
	});
	view.add(label_playlist);

	// var label_cp = Ti.UI.createLabel({
	// 	text:'audio_player1',
	// 	top:6,
	// 	left:10,
	// 	right:10,
	// 	height:Ti.UI.SIZE,
	// 	color:'#ff9900',
	// 	font:{fontSize:11},
	// 	touchEnabled:false
	// });
	// view.add(label_cp);

	self.add(view);

	// crossfading indicators
	var audio_player1_playing = Ti.UI.createView({
		width:6,
		height:6,
		borderRadius:3,
		backgroundColor:'#222',
		top:10,
		right:10,
		touchEnabled:false,
		opacity:0
	});
	self.add(audio_player1_playing);

	var audio_player2_playing = Ti.UI.createView({
		width:6,
		height:6,
		borderRadius:3,
		backgroundColor:'#222',
		top:20,
		right:10,
		touchEnabled:false,
		opacity:0
	});
	self.add(audio_player2_playing);





	var init_players_status = {
		audio_player1: {
			pi:0, // playlist index
			playing:false,
			playing_view:audio_player1_playing,
			fading:false
		}, 
		audio_player2: {
			pi:1, // playlist index
			playing:false,
			playing_view:audio_player2_playing,
			fading:false
		}
	};

	status = init_players_status;

	function playPause(){

		if(audio_player1.playing && !status['audio_player1'].fading){
			audio_player1.pause();
			btn_control.text = icon_play;
			btn_controls.text = icon_play;

			//console.log('player1 paused : ', current_tune);
			updateLockScreen(current_tune, 0);
			return;
		}
		if(audio_player1.paused){
			audio_player1.play();
			btn_control.text = icon_pause;
			btn_controls.text = icon_pause;

			updateLockScreen(current_tune, 1.0);

			return;
		}
		if(audio_player2.playing && !status['audio_player2'].fading){
			audio_player2.pause();
			btn_control.text = icon_play;
			btn_controls.text = icon_play;

			//console.log('player2 paused : ', current_tune);
			updateLockScreen(current_tune, 0);

			return;
		}
		if(audio_player2.paused){
			audio_player2.play();
			btn_control.text = icon_pause;
			btn_controls.text = icon_pause;

			updateLockScreen(current_tune, 1.0);

			return;
		}

		// Fresh start
		status = init_players_status;

		self.selectPlaylistIndex(0);

		/*
		current_index = 0;
		current_tune = playlist[0];
	
		btn_control.text = icon_pause;

		console.log('START!');
		audio_player1.start();
		audio_player1.setVolume(1.0);
		audio_player2.setVolume(0.0);
		
		console.log('FIRE INDEX');
		Ti.App.fireEvent('index', {index:current_index});

		status.audio_player1.playing = true;
		status.audio_player1.playing_view.opacity = 1.0;

		console.log('UPDATE TUNE');
		console.log(current_tune);

		self.updateTune(current_tune);
		*/
	}

	btn_control.addEventListener('click', function() {
		playPause();
	});

	


	// Metadata [ID3] listeners
	// audio_player1.addEventListener('metadata', function(e){
	// 	console.log('player1 metadata event : ', e);
	// 	// Also stored in e.source.info 
	// 	if(e.artist){
	// 		label_artist.text = e.artist;
	// 	}
	// 	if(e.title){
	// 		label_title.text = e.title;
	// 	}
	// 	if(e.none!==undefined){
	// 		label_artist.text = '--';
	// 		label_title.text = '--';
	// 	}
	// });

	// audio_player2.addEventListener('metadata', function(e){
	// 	console.log('player2 metadata event : ', e);
	// 	// Also stored in e.source.info 
	// 	if(e.artist){
	// 		label_artist.text = e.artist;
	// 	}
	// 	if(e.title){
	// 		label_title.text = e.title;
	// 	}
	// 	if(e.none!==undefined){
	// 		label_artist.text = '--';
	// 		label_title.text = '--';
	// 	}
	// });

	// Set up the initial urls
	//console.log('setup player1:'+playlist[0].nativePath);
	//if(playlist[0].nativePath){
	//	audio_player1.setUrl(playlist[0].nativePath);
	//}

	//if(playlist[1]){
	//	console.log('setup player2:'+playlist[1].nativePath);
	//	audio_player2.setUrl(playlist[1].nativePath);	
	//}

	function audio_player1Progress(e){
		if(_sliding){
			return;
		}
		if(current_player==='audio_player1' && e.source.duration){
			//console.log(status.audio_player1.pi + ' : player1 : ' + functions.msecsToSecsAndMinutes(e.progress) + ' / ' + functions.msecsToSecsAndMinutes(e.source.duration));		
			label_time.text = functions.msecsToSecsAndMinutes(e.progress) + ' / ' + functions.msecsToSecsAndMinutes(e.source.duration);
			current_tune.current_time = e.progress;
			var _perc1 = Math.round((e.progress/e.source.duration) * 100);
			slider.value = _perc1;
		}
		if(!status.audio_player1.fading && (e.source.duration - e.progress < Ti.App.crossfade_ms)) {
			// In case a seek stops within the crossfade time 
			var _diff = e.source.duration - e.progress - Ti.App.crossfade_ms; // should be -ve
			console.log('Start crossfading player 1 > 2 over '+(Ti.App.crossfade_ms + _diff)+' ms');
			status.audio_player1.fading = true;
			//status.audio_player2.fading = true;

			crossfade(Ti.App.crossfade_ms + _diff, audio_player1, audio_player2);
		}
	}
	function audio_player2Progress(e){			
		if(_sliding){
			return;
		}
		if(current_player==='audio_player2' && e.source.duration){
			//console.log(status.audio_player2.pi + ' : player2 : ' +  functions.msecsToSecsAndMinutes(e.progress) + ' / ' + functions.msecsToSecsAndMinutes(e.source.duration));
			label_time.text = functions.msecsToSecsAndMinutes(e.progress) + ' / ' + functions.msecsToSecsAndMinutes(e.source.duration);
			current_tune.current_time = e.progress;
			var _perc2 = Math.round((e.progress/e.source.duration) * 100);
			slider.value = _perc2;
		}	
		if(!status.audio_player2.fading && (e.source.duration - e.progress < Ti.App.crossfade_ms)) {
			// In case a seek stops within the crossfade time 
			var _diff = e.source.duration - e.progress - Ti.App.crossfade_ms; // should be -ve
			console.log('Start crossfading player 2 > 1 over '+(Ti.App.crossfade_ms + _diff)+' ms');
			status.audio_player2.fading = true;
			//status.audio_player1.fading = true;

			crossfade(Ti.App.crossfade_ms + _diff, audio_player2, audio_player1);
		}
	}

	audio_player1.addEventListener('progress', audio_player1Progress);
	audio_player2.addEventListener('progress', audio_player2Progress);

	self.selectPlaylistIndex = function(index){

		audio_player1.removeEventListener('progress', audio_player1Progress);
		audio_player2.removeEventListener('progress', audio_player2Progress);

		current_index = index;
		current_player = 'audio_player1';

		if(audio_player1.playing){
			audio_player1.pause();
		}
		if(audio_player2.playing){
			audio_player2.pause();
		}
		slider.value = 0;
		status = init_players_status;
		status.audio_player1.pi = index;

		if((index + 1) >= playlist.length ){
			status.audio_player2.pi = 0;
		} else {
			status.audio_player2.pi = index + 1;
		}
		self.updateTune(playlist[status.audio_player1.pi]);

		if(playlist.length == (current_index + 1)){
			btn_next.opacity = 0.4;
		} else {
			btn_next.opacity = 1.0;
		}
		console.log('CURRENT_INDEX: '+current_index);

		if(current_index == 0){
			btn_prev.opacity = 0.4;
		} else {
			btn_prev.opacity = 1.0;
		}

		Ti.App.fireEvent('index', {index:status.audio_player1.pi});
		btn_control.text = icon_pause;
		btn_controls.text = icon_pause;

		var _url1 = playlist[status.audio_player1.pi].nativePath;		
		var _url2 = playlist[status.audio_player2.pi].nativePath;		
		// console.log('select url1: '+_url1);
		// console.log('set up url2: '+_url2);
		audio_player1.destroy();
		audio_player2.destroy();
		
		audio_player1.setUrl(_url1);
		audio_player2.setUrl(_url2);

		audio_player1.start();
		audio_player1.setVolume(1.0);
		audio_player2.setVolume(0.0);
		
		audio_player1.addEventListener('progress', audio_player1Progress);
		audio_player2.addEventListener('progress', audio_player2Progress);

		status.audio_player1.playing = true;
		status.audio_player2.playing = false;
		status.audio_player1.fading = false;
		status.audio_player2.fading = false;
		
		status.audio_player1.playing_view.opacity = 1.0;
		status.audio_player2.playing_view.opacity = 0.0;

	};

	function updateLockScreen(tune, playing_rate){
		if(Ti.Platform.osname==='android'){
			return;
		}
		//console.log('updateLockScreen: ',tune);
		try{
			var lockscreen_info = {
				artist: 		'Amazing Instore ['+(current_index+1)+'/'+playlist.length+']',
				duration: 		Math.round(tune.duration_secs), // secs
				title: 			tune.title + ' - ' + tune.artist,
				albumArtwork: 	tune.image,
				rate: 			playing_rate,
				currentTime: 	Math.round(tune.current_time / 1000), // secs
			};
			console.log('lockscreen_info: ',lockscreen_info);
			//Control.showPlaylistControls(false, false);
			Control.setNowPlayingInfo(lockscreen_info);
		} catch(error){
			console.log('error setting lockscreen_info');
			console.log(error);
		}
	}


	var _cols = null;



	// Allow us to update from window_home.js
	self.updateTune = function(tune, title, artist, image){
		// console.log('updateTune: ', tune);
		if(tune!==null){
			current_tune = tune;
			current_tune.current_time = 0;
			label_title.text = tune.title;
			label_title_m.text = tune.title;
			label_artist.text = tune.artist;
			label_artist_m.text = tune.artist;
			label_playlist.text = (current_index + 1) + ' / ' + playlist.length;
			functions.cacheImage(tune, function(data){
				if(data!==null){
					//console.log('update image:');
					//console.log(data.image);
					//console.log(data.url);
					artwork.image = data.image;

					artwork_big.backgroundImage = data.url;
					// artwork_bg.backgroundImage = data.url;

					// console.log('GET DOMINANT COLOUR: '+data.path);
					var dom = mediainspector.getDominantColour(data.path);
					//console.log('>>>> ' + dom);

					/*
					if(Ti.Platform.osname!=='android'){
						console.log('GET MAIN COLOURS: '+data.path);
						var mc = mediainspector.getMainColours(data.path);
						console.log('>>>> ', mc);
						if(_cols !== null){
							self.remove(_cols);
						}
						_cols = Ti.UI.createView({
							height:10,
							width:Ti.UI.FILL,
							bottom:0
						})
						var p = Math.ceil(100 / mc.length);
						for(var col in mc){
							var _c = Ti.UI.createView({
								height:10,
								width:p+'%',
								left:(col * p)+'%',
								backgroundColor:'#'+mc[col]
							});
							_cols.add(_c);
						}
						self.add(_cols);
					}
					*/

					/*
					console.log('GET MAIN COLOURS: '+data.path);
					var mc = mediainspector.getMainColours(data.path);
					console.log('>>>> ', mc);

					if(_cols !== null){
						self.remove(_cols);
					}

					_cols = Ti.UI.createView({
						height:40,
						width:Ti.UI.FILL,
						bottom:0
					})

					var p = Math.ceil(100 / mc.length);
					for(var col in mc){
						var _c = Ti.UI.createView({
							height:40,
							width:p+'%',
							left:(col * p)+'%',
							backgroundColor:'#'+mc[col]
						});
						_cols.add(_c);
					}

					self.add(_cols);
					*/

					/*
					var _r = parseInt(dom.substring(2,4), 16);
					var _g = parseInt(dom.substring(4,6), 16);
					var _b = parseInt(dom.substring(6,8), 16);
					var lum = ( 0.299*_r + 0.587*_g + 0.114*_b );
					console.log('LUMINOSITY: '+ lum);
					if(lum > 70){
						label_title.color = '#111';
						label_artist.color = '#222';
						label_time.color = '#333';
						label_playlist.color = '#111';
					} else {
						label_title.color = '#eee';
						label_artist.color = '#ccc';
						label_time.color = '#ffffcc';
						label_playlist.color = '#ddd';
					}
					*/

					// self.backgroundColor = '#33'+dom.substring(2,8);
					col_cont.backgroundColor = '#'+dom.substring(2,8);

					if(Ti.Platform.osname!=='android'){
						tune.image = 'file://'+data.url; // local. medium.
						updateLockScreen(tune, 1.0);
					}

				}
			}, true);// true for player view. Gets filename.mp3_medium.jpg image
			label_time.text = '';
			
		}
		// Manual overrides
		if(title!==undefined){
			label_title.text = title;
		}
		if(artist!==undefined){
			label_artist.text = artist;
		}
		if(image!==undefined){
			artwork.image = image;
		}

	};

	function crossfade(dur, player_from, player_to){
		// console.log('starting '+player_to.name);
		player_to.start();
		status[player_to.name].playing = true;
		//status[player_to.name].playing_view.opacity = 1.0;
		if(player_from.playing){
			// fade out player_from then stop.
			fade(player_from, linear, dur, 1.0, 0.0, function(player){ 
				// console.log(player.name + ' fade complete.. stopping. pi: '+status[player.name].pi);				
				player.pause();
				status[player.name].playing = false;

				// prepare next tune or loop
				if((status[player.name].pi + 2) == playlist.length){
					status[player.name].pi = 0;
				} else if((status[player.name].pi + 1) == playlist.length){
					status[player.name].pi = 1;
				} else {
					status[player.name].pi = status[player.name].pi + 2;
				}
				// Apply url of next tune in the playlist....
				var _url = playlist[status[player.name].pi].nativePath;				
				// Wait a second, just to ease things a bit after releasing the last tune..
				setTimeout(function(){
					// console.log('set next '+player.name+' : pi : '+status[player.name].pi + ' : ' + _url);
					// console.log('status: ', status);
					player.destroy();
					
					player.setUrl(_url);
				},1000);
			}); 
		}

		current_player = player_to.name;

		// fade in player_to
		fade(player_to, linear, dur, 0.0, 1.0); 

		// label_cp.text = current_player + ' : ' + status[current_player].pi;
		// Fire index to window_home.js
		current_index = status[current_player].pi
		Ti.App.fireEvent('index', {index:status[current_player].pi});
		self.updateTune(playlist[status[current_player].pi]);
		

	}

	// Delta functions
	function linear(progress) {
		return progress;
	}
	function quad(progress) {
		return Math.pow(progress, 2)
	}
	function circ(progress) {
	    return 1 - Math.sin(Math.acos(progress))
	}

	function fade(player, delta, duration, from, to, cb) {
		var v;
		//status[player.name].fading = true;
		//console.log('fade '+player.name);
		status[player.name].playing_view.opacity = 0;

		status[player.name].fader_int = null;
		animate({
			name:player.name,
			delay: 10, // 100th of a second
			duration: duration || 1000, // 1 second by default
			delta: delta,
			step: function(delta) {
				v = (from + ((to - from) * delta)).toFixed(2);
				//console.log(player.name + ' vol: '+v);
				player.setVolume(v);
				status[player.name].fading = true;
				status[player.name].playing_view.opacity = v;
				if(v === to.toFixed(2)){
					status[player.name].fading = false;
					if(cb!=undefined){
						//console.log('animate callback!');
						clearInterval(status[player.name].fader_int);
						status[player.name].fader_int = null;
						cb(player);
					}
				}
			}
		});
		
		function animate(opts) {
			// Generates 0.0 to 1.0 over opts.duration in ms.
			var start = new Date;
			status[opts.name].fader_int = setInterval(function() {
				var timePassed = new Date - start;
				var progress = timePassed / opts.duration;
				if (progress > 1) progress = 1;
				var delta = opts.delta(progress);
				opts.step(delta); // make the change
				if (progress == 1) {
					//console.log('clear animate interval');
					clearInterval(status[opts.name].fader_int);
					status[opts.name].fader_int = null;
				}
			}, opts.delay || 10);
		}

	}




	var btn_shuffle = functions.createIconButton('\uf074',30,'#aaa','#873e3e');
    btn_shuffle.width = 30;
    btn_shuffle.height = 30;
    btn_shuffle.zIndex = 2;
    btn_shuffle.top = 80;
    btn_shuffle.left = 32;
	btn_shuffle.addEventListener('click', function() {
		Ti.App.fireEvent('shuffle');
	});
	self.add(btn_shuffle);
	self.btn_shuffle = btn_shuffle;


	function animationBounce(view, from, to){

		// bounce at the end
		function easeOutElastic(t) { return .01 * t / (--t) * Math.sin(20 * t) } 
		// bounce at start
		function easeInElastic(t) { return (.04 - .04 / t) * Math.sin(25 * t) + 1 }
		// bounce and start and end
		function easeInOutElastic(t) { return (t -= .5) < 0 ? (.01 + .01 / t) * Math.sin(50 * t) : (.02 - .01 / t) * Math.sin(50 * t) + 1 }

		function makeEaseOut(delta) {  
			return function(progress) {
				var p = 1 - delta(1 - progress);
				return p;
			}
		}

		function animate(opts) {
			var start = new Date;
			var id = setInterval(function() {
				var timePassed = new Date - start;
				var progress = timePassed / opts.duration;
				if (progress > 1) progress = 1;
				var delta = opts.delta(progress);
				opts.step(delta);
				if (progress == 1) {
					clearInterval(id);
				}
			}, opts.delay || 10);
		}

		function move(_view, delta, duration) {
			var v;
			animate({
				delay: 10,
				duration: duration || 1000,
				delta: delta,
				step: function(delta) {
					v = (from + ((to - from) * delta)).toFixed(2);
					_view.top = v;
				}
			});
		}
		var bounceEaseOut = makeEaseOut(easeOutElastic)
		move(view, bounceEaseOut, 750);
	}



	var container = Ti.UI.createView({
		top:_pvh,
		bottom:0,
		left:0,
		right:0//,
		// backgroundColor:'#121212',
		//touchEnabled:false
	});


	var artwork_big_size;
 	var ctrl_bottom = 40;
	var controls_height;
	var controls_size = 35;
	var controls_opacity = 0.6;
	var size_fac = 0.65;
	self.setArtSize = function(){
		//console.log('setArtSize...');
		if(functions.isLandscape()){
			//console.log('... in landscape');
			artwork_big_size = functions.getDeviceHeight();
			size_fac = 0.65;
			// phone in landscape
			if(!functions.checkTablet()){
				ctrl_bottom = null; // the middle
				controls_width = Math.round(functions.getDeviceWidth() * 0.85);
				controls_size = 60;
				controls_opacity = 1.0;
				//console.log('... on a phone');
			} else {
				controls_width = Math.round(artwork_big_size * size_fac);
				controls_size = 35;
				ctrl_bottom = 40;
				controls_opacity = 0.6;
				//console.log('... on a tablet');
			}
			
		} else {
			if(!functions.checkTablet()){
				size_fac = 0.75;
			}
			//console.log('... in portrait');
			artwork_big_size = functions.getDeviceWidth();
			ctrl_bottom = 60;
			controls_size = 35;
			controls_width = Math.round(artwork_big_size * size_fac);
			controls_opacity = 0.6;

		}

		var _a = artwork_big_size;
		artwork_big_size = Math.round(_a * size_fac);
		//controls_height = Math.round(_a * 0.1);
		if(controls){

			//console.log('setting controls');
			controls.bottom = ctrl_bottom;
			//controls.height = controls_height;
			controls.width = controls_width;
			controls.opacity = controls_opacity;
			setButton(btn_controls);
			setButton(btn_prev);
			setButton(btn_next);

		}

		
		if(artwork_big){
			artwork_big.height = artwork_big_size;
			artwork_big.width = artwork_big_size;
		}

	};

	self.setArtSize();

	//if(functions.getDeviceHeight() < artwork_big_size){
	//	artwork_big_size = functions.getDeviceHeight();
	//}

	// Big backgroud art.
	//var artwork_bg_size = functions.getDeviceWidth();
	//if(functions.getDeviceHeight() > artwork_bg_size){
	//	artwork_bg_size = functions.getDeviceHeight();
	//}

	// var _a = artwork_big_size;

	//artwork_big_size = Math.round(_a * 0.7);
	//var controls_height = Math.round(_a * 0.1);

	
	//var artwork_bg = Ti.UI.createView({
	//	width:artwork_bg_size,
	//	height:artwork_bg_size,
	//	opacity:0.1,
	//	backgroundImage:'/images/medium_at_square.default'//,
	//	//touchEnabled:false
	//});
 	// container.add(artwork_bg);
	
 	var art_cont = Ti.UI.createView({
 		layout:'vertical',
 		height:Ti.UI.SIZE,
 		bubbleParent:true,
 		//borderColor:'#ff9900',
 		width:artwork_big_size
 	});

	var artwork_big = Ti.UI.createView({
		width:artwork_big_size,
		height:artwork_big_size,
		backgroundColor:'#aa222222'//,
		//touchEnabled:false
	});
	art_cont.add(artwork_big);

 	artwork_big.addEventListener('click', function(e){
 	//	console.log('artwork click');
 	});


	var label_title_m = Ti.UI.createLabel({
		text:current_tune.title,
		top:10,
		height:22,
		width:artwork_big_size,
		color:'#eee',
		font:{fontSize:16, fontWeight:'bold'},
		textAlign:'center',
		wordWrap:true//,
		//touchEnabled:false
	});
	art_cont.add(label_title_m);

	var label_artist_m = Ti.UI.createLabel({
		text:current_tune.artist,
		top:1,
		color:'#ccc',
		height:20,
		width:artwork_big_size,
		font:{fontSize:15},
		textAlign:'center',
		wordWrap:true//,
		//touchEnabled:false
	});
	art_cont.add(label_artist_m);


 	container.add(art_cont);




	if(current_tune.amazingtunes_url!==undefined){
		functions.cacheImage(current_tune, function(data){
			artwork_big.backgroundImage = data.url;

		}, true);

		// functions.cacheImage(current_tune, function(data){
		// 	console.log('IMAGE URL: '+data.url);
		// 	artwork_bg.backgroundImage = data.url;
		// }, true); 
	} 

	var _logo = Ti.UI.createLabel({
		text:'\ue900',
		font:{fontFamily:'amazing-icomoon', fontSize:16},
		color:'#eee',
		top:10,
		//left:15,
		zIndex:100,
		opacity:0.6,
		height:Ti.UI.SIZE//,
		//touchEnabled:false
	});
	container.add(_logo);

	self.setArtSize();


	controls = Ti.UI.createView({
		height:Ti.UI.SIZE,
		width:artwork_big_size,
		opacity:controls_opacity,
		//backgroundColor:'#22ffffff',
		bottom:ctrl_bottom
	});

	function setButton(b){
		var e = 0;
		if(b==btn_controls){
			e = 10;
		}
		b.font = {fontFamily:'amazing-icomoon', fontSize:controls_size+e};
		//b.width = controls_size + 5;
		//b.height = controls_size + 5;
	}

	btn_controls = functions.createIconButton(icon_play,controls_size,'#dddddd','#ffffff');
    //btn_controls.width = controls_size + 5;
    //btn_controls.height = controls_size + 5;

	btn_controls.shadowColor = '#99000000';
	btn_controls.shadowOffset = {x:2, y:2};
	btn_controls.shadowRadius = 6;

    controls.add(btn_controls);

	btn_prev = functions.createIconButton(icon_back,controls_size,'#dddddd','#ffffff');
    //btn_prev.width = controls_size + 5;
    //btn_prev.height = controls_size + 5;
    btn_prev.left = 0;
    btn_prev.opacity = 0.4;
    controls.add(btn_prev);

   	btn_next = functions.createIconButton(icon_fwd,controls_size,'#dddddd','#ffffff');
    //btn_next.width = controls_size + 5;
    //btn_next.height = controls_size + 5;
    btn_next.right = 0;
    controls.add(btn_next);


	container.add(controls);

	self.add(container);


	btn_controls.addEventListener('click', function() {
		playPause();
	});

	btn_next.addEventListener('click', function(e){
		if((current_index+1) == playlist.length){
			return;
		}
		self.selectPlaylistIndex(current_index + 1);
	});

	btn_prev.addEventListener('click', function(e){
		if(current_index <= 0){
			return;
		}
		self.selectPlaylistIndex(current_index - 1);
	});

	self.top_set = _top;

	self.addEventListener('click', function(){
		_top = functions.getDeviceHeight() - _pvh;

		if(!self.player_up){
			// console.log('GO UP');
			self.setArtSize();
			animationBounce(self, _top, 0-_pvh, function(){
				self.top_set = 0-_pvh;
			});
		} else {
			// console.log('GO DOWN');
			animationBounce(self, -50, _top, function(){
				self.top_set = _top;
			});
		}
		self.player_up = !self.player_up;
	});

	current_index = 0;

	return self;

}

exports.createPlayerView = createPlayerView;