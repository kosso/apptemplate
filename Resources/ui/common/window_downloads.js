// Downloader window

function createWindow(__files) {
	// {missing:, available}
	console.log('NUKE EM');
	NappDownloadManager.cleanUp();

	var functions = require('/mods/functions');
	var _napp_info = NappDownloadManager.getAllDownloadInfo();
	console.log('DOWNLOADER INFO length: ' + _napp_info.length);	
	console.log('missing file count: ', __files.missing.length);

	var storage_threshold = 209715200; // 200mb 

	var _playlist = null;
	var table_data = [];
	var tableView = null;
	var downloading = false;
	var busy = false;
	var overlay = null;
	var _i = 0;
	var _f = 0;
	var color_ok = '#225499';
	var color_error = '#440000';
	var dls = {};
	var icon_play = '\uf144';
	var icon_pause = '\uf28b';
	var icon_stop = '\uf28d';
	var _files = [];

	var total_expected_bytes = 0;

	var warning_msg = 'Tunes are still downloading to this device.\n\nClosing this window will pause the downloads.\n\nAny remaining files can be downloaded next time you open this window.';
	var warning_opts = {
		buttonNames: ['CANCEL', 'OK. CLOSE IT'],
		title:'WARNING',
		message: warning_msg
	};


	var _args = {
        top:0,
        left:0,
        right:0,
        bottom:0,
        zIndex:2,
        fullscreen:true,
        navBarHidden:true,
        tabBarHidden:true,
        navTintColor:'#333',
        tintColor:'#333',
        backgroundColor:'#333'
    };
    if(Ti.Platform.osname==='android'){
    	_args.windowSoftInputMode = Ti.UI.Android.SOFT_INPUT_STATE_HIDDEN // Stops textfield in scrollview getting immediate focus
    }
	var self = Ti.UI.createWindow(_args);

	self.addEventListener('close', function(){

		NappDownloadManager.removeEventListener('progress', progressEvent); 
		NappDownloadManager.removeEventListener('paused', downloaderEvent);
		NappDownloadManager.removeEventListener('failed', downloaderEvent);
		NappDownloadManager.removeEventListener('completed', downloaderEvent);
		NappDownloadManager.removeEventListener('cancelled', downloaderEvent); 
		NappDownloadManager.removeEventListener('started', downloaderEvent);

		NappDownloadManager.stopDownloader();
	});


	var overlay = functions.createOverlay();
	self.add(overlay);
	overlay.message = '   loading file list ...';
	overlay.show();
	busy = true;

	var top_bar = Ti.UI.createView({
		top:0,
		left:0,
		right:0,
		height:50,
		backgroundColor:'#111'
	});
	self.add(top_bar);

    var btn_back = functions.createIconButton('\uf053',30,'#ccc','#376cb5');
    btn_back.width = 40;
    btn_back.height = 40;
    btn_back.zIndex = 2;
    btn_back.top = 6;
    btn_back.left = 10;
    btn_back.addEventListener('click', function(){

		if(downloading === true || busy === true){
	      	var exitDlg = Ti.UI.createAlertDialog(warning_opts);
           	exitDlg.addEventListener('click', function(e){
	      		if(e.index===1){
		      		self.close({animated:true});
	      		}
	      	});
	      	setTimeout(function(){
		      	exitDlg.show();
	      	}, 250);

     	} else {
     		self.close({animated:true});
     	}

    });
    top_bar.add(btn_back);

	var label_title = Ti.UI.createLabel({
		text:'downloader',
		left:60,
		right:20,
		height:Ti.UI.SIZE,
		color:'white',
		font:{fontSize:18}
	});

	top_bar.add(label_title);

	var cont = Ti.UI.createView({
		top:50,
		left:0,
		right:0,
		bottom:0,
		layout:'vertical'
	});
	self.add(cont);

	var msg_bar = Ti.UI.createView({
		top:0,
		left:0,
		right:0,
		height:Ti.UI.SIZE,
		backgroundColor:color_ok,
		layout:'vertical'
	});

	msg_bar.addEventListener('postlayout', function(e){
		//console.log('msg_bar: ');
		//console.log(JSON.stringify(e.source.rect));
	});

	cont.add(msg_bar);
	
	var btn_control = functions.createIconButton('\uf019',32,'#fff','#89cf73');
    btn_control.width = 40;
    btn_control.height = 40;
    btn_control.zIndex = 2;
    btn_control.top = 6;
    btn_control.right = 10;
	btn_control.addEventListener('click', function() {

		if (Titanium.Network.online === false) {
	        alert('A network connection is required for this task.\n\nAre you connected to wifi or a mobile network?\n\nPlease connect and try again.');
	        return;
	    }

		if(downloading===false){
			console.log('DOWNLOADING FALSE??');

			var d_msg = 'Do you want to start the download process?\n\nWhen the process is complete, this window will close and the playlist will refresh.\n\nIf you wish to cancel the downloads, you may close this window and the playlist will refresh with the available tunes.';

			var d_opts = {
				buttonNames: ['CANCEL', 'START'],
				title:'DOWNLOADS',
				message: d_msg
			};
			
	    	var checkinDlg = Ti.UI.createAlertDialog(d_opts);
	       	checkinDlg.addEventListener('click', function(e){
	       		console.log('check in index: '+e.index);
	      		if(e.index==1){
					overlay.message = '   downloading .. ';
					overlay.top = 50;
					overlay.show();
					busy = true;
		      		setTimeout(function(){	
						startDownloads();
		      		}, 500);
	      		}
	      	});
	      	lost_focus = true;
	      	setTimeout(function(){
		      	checkinDlg.show();
         	}, 250);

		}
	});
	top_bar.add(btn_control);

	btn_control.addEventListener('longpress', function(){
		if(downloading===true){
			stopDownloads();
			self.close({animated:true});
		}

	});

	function stopDownloads(){
		console.log('stop downloads');
		NappDownloadManager.removeEventListener('progress', progressEvent); 
		NappDownloadManager.removeEventListener('paused', downloaderEvent);
		NappDownloadManager.removeEventListener('failed', downloaderEvent);
		NappDownloadManager.removeEventListener('completed', downloaderEvent);
		NappDownloadManager.removeEventListener('cancelled', downloaderEvent); 
		NappDownloadManager.removeEventListener('started', downloaderEvent);
		NappDownloadManager.stopDownloader();
		downloading = false;
		busy = false;
	}
	
	function startDownloads(){
		functions.setMessage(msg_bar, 'starting download');
		if(__files!==null){
			if(__files.missing.length > 0){
				Ti.App.Properties.setBool('refresh_ui', true);

				// Downloader listeners
				NappDownloadManager.addEventListener('progress', progressEvent); 
				NappDownloadManager.addEventListener('paused', downloaderEvent);
				NappDownloadManager.addEventListener('failed', downloaderEvent);
				NappDownloadManager.addEventListener('completed', downloaderEvent);
				NappDownloadManager.addEventListener('cancelled', downloaderEvent); 
				NappDownloadManager.addEventListener('started', downloaderEvent);

				NappDownloadManager.restartDownloader();
				btn_control.visible = false;
				setTimeout(function(){
					downloadTunes(__files.missing);
				}, 1000);
			}
		}
	}

	function loadPlaylist(mac){
		var cache_file_name = mac+'.json';
	    var f = Titanium.Filesystem.getFile(Ti.App.storage_location, cache_file_name);
	    if(f.exists()){
	    	_playlist = JSON.parse(f.read());
	    	btn_control.visible = true;
	        console.log('loaded playlist: ' + cache_file_name);
	        // console.log(_playlist[0]);
	        console.log('tune count: ' + _playlist[0].tunes.length);
	    	//functions.setMessage(msg_bar, 'playlist loaded: '+_playlist[0].tunes.length+' tunes');
			//functions.setMessage(msg_bar, '\nmissing: '+__files.missing.length, true); // append true
			//functions.setMessage(msg_bar, '\navailable: '+__files.available.length, true); // append true
			//functions.setMessage(msg_bar, '\n\nclick the button in the top right to start downloading', true);
			total_expected_bytes = 0;
			for(var m in __files.missing.length){
				total_expected_bytes += __files.missing[m].file_size_bytes;
			}
			setTimeout(function(){
				buildTable(__files.missing); 	

				functions.setMessage(msg_bar, 'ready to download: '+__files.missing.length+ ' tunes ['+functions.humanFileSize(total_expected_bytes, true)+']'); // append true
				var _space = functions.getSpaceAvailable();
				functions.setMessage(msg_bar, '\nstorage space available: '+functions.humanFileSize(_space, true), true);
				if(Ti.Platform.osname==='android'){
					functions.setMessage(msg_bar, '\n'+(Ti.App.Properties.getBool('is_ext', false) ? 'external':'internal')+' storage in use', true); // append true
				}
				if(total_expected_bytes > (_space - storage_threshold) ){
					functions.setMessage(msg_bar, '\n\nYOU DO NOT HAVE ENOUGH STORAGE SPACE TO COMPLETE THE DOWNLOADS', true);
					btn_control.visible = false;
				} else {
					btn_control.visible = true;
					functions.setMessage(msg_bar, '\n\nclick the button in the top right to start downloading', true);
				}

			},1000);
			
	    } else {
	    	console.log('playlist not found : '+cache_file_name);
	    	btn_control.visible = false;
	    	functions.setMessage(msg_bar, 'playlist not found');
	    }
	    f = null;
	}

	function downloadTunes(files_list){

		if(Ti.Platform.osname!=='android'){
			Ti.App.setIdleTimerDisabled(true);
		}
		_i = 0;		
		downloading = true;
	    console.log('starting download : ' + files_list.length + ' files');

	    btn_control.text = icon_pause;


		_files = [];
	 	for(var i = 0; i < files_list.length; i++){
	    	_files[i] = Ti.Filesystem.getFile(Ti.App.storage_location, files_list[i].filename);
			if (_files[i].exists()) {
				_files[i].deleteFile();
			}
	        dls[files_list[i].filename].progress.value = 0;
	        var _url = Ti.App.control + '/connect/download_media/'+files_list[i].filename + '?password='+Ti.App.storage_key;
	        var _dl_args = {
				name : files_list[i].filename,
				url : _url,
				filePath : _files[i].nativePath,
				headers: { 'User-Agent' : Ti.App.client_name},
				priority : NappDownloadManager.DOWNLOAD_PRIORITY_NORMAL // NORMAL, HIGH or LOW
			};
			// console.log('ADDING DOWNLOAD: ' + files_list[i].filename);
	        // This will immediately trigger the download. 
	        try{
		        NappDownloadManager.addDownload(_dl_args);	        	
	        } catch(ex){
	        	console.log('addDownload exception: ', ex);
	        	
	        }
	    }
	}

	function progressEvent(e){
		if(dls[e.name]===undefined){
			console.log('NO ROW BY THIS NAME!: '+e.name);
		}

		var progress = e.downloadedBytes * 100.0 / e.totalBytes;
		var text = functions.humanFileSize(e.downloadedBytes, true) + '/' + functions.humanFileSize(e.totalBytes, true) + ' ' + Math.round(progress) + '% : ' + e.bps + ' bps';
		// Update the prgress on the reference to the named tableview row. 
		dls[e.name].progress.value = progress;
		dls[e.name].label_progress.text = text;
	}
	
	function downloaderEvent(e){
		console.log("DownloadManager Event: " + e.type);
		// console.log( typeof e === 'object' ? JSON.stringify(e, null, '\t') : e);
		if(e.type === 'started'){
			console.log('>> started: '+e.url);

		} else if(e.type === 'failed'){
			console.log('>> failed: '+e.url);
			dls[e.name].progress.value = 0;
			dls[e.name].label_progress.text = 'DOWNLOAD FAILED';
			dls[e.name].backgroundColor = '#440000';
			_f++;
		} else if(e.type === 'completed'){
			console.log('>> completed: '+e.url);
			_i++;
			// console.log('tune: ', dls[e.name].tune);
			// now cache table and player images.
			functions.cacheImage(dls[e.name].tune, null); // small
			functions.cacheImage(dls[e.name].tune, null, true); // medium
			tableView.deleteRow(dls[e.name]);
			delete dls[e.name];
			functions.setMessage(msg_bar, 'playlist downloaded: '+ _i + ' / '+__files.missing.length+' tunes');

			overlay.message = '   downloading .. '+ _i + ' / '+__files.missing.length;

			if(_i === (_files.length - _f)){

				overlay.hide();
				busy = false;

				NappDownloadManager.removeEventListener('progress', progressEvent); 
				NappDownloadManager.removeEventListener('paused', downloaderEvent);
				NappDownloadManager.removeEventListener('failed', downloaderEvent);
				NappDownloadManager.removeEventListener('completed', downloaderEvent);
				NappDownloadManager.removeEventListener('cancelled', downloaderEvent); 
				NappDownloadManager.removeEventListener('started', downloaderEvent);


				NappDownloadManager.stopDownloader();
				downloading = false;
				functions.setMessage(msg_bar, _files.length+' tunes downloaded');
				if(_f!==0){
					functions.setMessage(msg_bar, _f+' downloads failed', true);
				}
				btn_control.text = icon_play;
				if(Ti.Platform.osname!=='android'){
					Ti.App.setIdleTimerDisabled(false);
				}
				setTimeout(function(){
					self.close({animated:true});
				},1000);
			}
		}
	}

	function buildTable(files){
		// files __files.missing|__files.available
		table_data = [];
		total_expected_bytes = 0;
		dls = null;
		dls = {};
		if(tableView!=null){
			self.remove(tableView);
			tableView = null;
		}

		for(var i = 0; i < files.length; i++){
			dls[files[i].filename] = buildDownloaderRow(files[i]);
	    	// console.log(i + ' : ' +  _playlist[0].tunes[i].amazingtunes_id + ' : ' + _playlist[0].tunes[i].artist + ' : ' + _playlist[0].tunes[i].title + ' : ' + _playlist[0].tunes[i].filename);
			table_data.push(dls[files[i].filename]);
		}

		tableView = Ti.UI.createTableView({
			data:table_data,
			top:0,
			left:0,
			right:0,
			bottom:0,
			zIndex:10,
			backgroundColor:'transparent',
			separatorStyle:Titanium.UI.TABLE_VIEW_SEPARATOR_STYLE_NONE
		});
		cont.add(tableView);

		tableView.addEventListener('click', function(e){
	        var _url = Ti.App.control + '/connect/download_media/'+e.source.tune.filename + '?password='+Ti.App.storage_key;

	        console.log('===================================');
			console.log(e.source.tune);
			console.log(NappDownloadManager.getDownloadInfo(_url));

			var _f = Ti.Filesystem.getFile(Ti.App.storage_location, e.source.tune.filename);
			if(_f.exists()){
				console.log('IT EXISTS: size : ' + _f.size + ' : expected: ' + e.source.tune.file_size_bytes);
				if(_f.size < e.source.tune.file_size_bytes){
					console.log('TO SMALL!');
				} else {
					console.log('LOOKS OK');
				}
			} else {
				console.log('DOES NOT EXIST');
			}

	        console.log('===================================');

		});

		busy = false;
		overlay.hide();

	}

	

	function buildDownloaderRow(tune){
		//console.log('add row: '+tune.title);

		total_expected_bytes += tune.file_size_bytes;

		var _tablerow_args = {
			height:Ti.UI.SIZE,
			backgroundSelectedColor:'transparent',
			backgroundColor:'transparent'
		};
		if(Ti.Platform.osname!=='android'){
			_tablerow_args.selectionStyle = Ti.UI.iOS.TableViewCellSelectionStyle.NONE;
		}
		var row = Ti.UI.createTableViewRow(_tablerow_args);

		var view = Ti.UI.createView({
			layout:'vertical',
			top:6,
			left:5,
			right:5,
			height:Ti.UI.SIZE,
			borderRadius:0,
			touchEnabled:false
		});
		var label_title = Ti.UI.createLabel({
			text:tune.title,
			top:6,
			left:10,
			right:10,
			height:Ti.UI.SIZE,
			color:'#eee',
			font:{fontSize:16, fontWeight:'bold'},
			touchEnabled:false
		});
		view.add(label_title);

		var label_artist = Ti.UI.createLabel({
			text:tune.artist,
			top:3,
			left:10,
			right:10,
			color:'#ccc',
			height:Ti.UI.SIZE,
			font:{fontSize:14},
			touchEnabled:false
		});
		view.add(label_artist);

		var label_filename = Ti.UI.createLabel({
			text:tune.filename,
			top:3,
			left:10,
			right:10,
			height:Ti.UI.SIZE,
			color:'#ffffcc',
			font:{fontSize:12},
			touchEnabled:false
		});
		view.add(label_filename);

		var progressOptions = {
			top:2,
			left:10,
			min:0,
			max:100,
			value:0,
			height:22,
			right:10,
			tintColor:color_ok,
			touchEnabled:false
		};

		var progress = Ti.UI.createProgressBar(progressOptions);
		view.add(progress);
		row.progress = progress;

		var label_progress = Ti.UI.createLabel({
			text:'ready : ' + functions.humanFileSize(tune.file_size_bytes, true),
			touchEnabled:false,
			top:1,
			left:10,
			right:10,
			height:14,
			bottom:8,
			color:'#bbb',
			wordWrap:false,
			font:{fontSize:11}
		});
		view.add(label_progress);
		row.label_progress = label_progress;
		row.add(view);

		var sep = Ti.UI.createView({
			backgroundColor:'#111',
			left:0,
			right:0,
			height:2,
			bottom:0,
			touchEnabled:false
		});	
		row.add(sep);
		row.tune = tune;

		return row;


	}




	
	top_bar.addEventListener('click', function(){
		if(tableView!==null){
			tableView.scrollToTop(0);
		}
	});

	if(Ti.Platform.osname==='android'){

		self.addEventListener('android:back', function(e){
      		if(downloading === true || busy === true){
		      	var exitDlg = Ti.UI.createAlertDialog(warning_opts);
		      	exitDlg.addEventListener('click', function(e){
		      		if(e.index===1){
			      		self.close({animated:true});
		      		}
		      	});
		      	exitDlg.show();
	      	} else {
	      		self.close({animated:true});
	      	}
    	});
	}

	self.addEventListener('open', function(){
		_config = Ti.App.Properties.getObject('config', null);
		if(_config===null){
			_playlist = null;
			self.close({animated:true});
		} else {
			

			if(__files.missing.length > 0){
				buildTable(__files.missing);

				functions.setMessage(msg_bar, 'ready to download: '+__files.missing.length+ ' tunes ['+functions.humanFileSize(total_expected_bytes, true)+']'); // append true
				var _space = functions.getSpaceAvailable();
				functions.setMessage(msg_bar, '\nstorage space available: '+functions.humanFileSize(_space, true), true);
				if(Ti.Platform.osname==='android'){
					functions.setMessage(msg_bar, '\n'+(Ti.App.Properties.getBool('is_ext', false) ? 'external':'internal')+' storage in use', true); // append true
				}
				if(total_expected_bytes > (_space - storage_threshold) ){
					functions.setMessage(msg_bar, '\n\nYOU DO NOT HAVE ENOUGH STORAGE SPACE TO COMPLETE THE DOWNLOADS', true);
					btn_control.visible = false;
				} else {
					btn_control.visible = true;
					functions.setMessage(msg_bar, '\n\nclick the button in the top right to start downloading', true);
				}
	
			}

		}
	});

	return self;
};

exports.createWindow = createWindow;