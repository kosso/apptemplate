// Various helpers
var req_win = null; // stop double-opening of a window due to lag/impatience/double-click/'bounce'/etc. 

function openWindowModule(win, module_path, config_data){
    if(module_path == req_win){
        return;
    }
    req_win = module_path;
    config_data = config_data || {};  
     
    config_data.parentWin = win;

    var new_win = require(module_path).createWindow(config_data);
    new_win.addEventListener('open', function(e){
        req_win = null;
    });
    //new_win.parentWin = win;

    if(os==='android'){
        new_win.addEventListener('androidback', function(e){
            // Use custom animations in /platform/android/res/anim 
            new_win.close({
                //animated:true, 
                activityEnterAnimation: Ti.App.Android.R.anim.still,
                activityExitAnimation: Ti.App.Android.R.anim.slide_out
            });
        });
    }
    /*
    new_win.addEventListener('swipe',function(e){
        if(e.direction==='right'){
            if(os==='android'){
                // Use custom animations in /platform/android/res/anim 
                new_win.close({
                    activityExitAnimation : Ti.App.Android.R.anim.slide_none,
                    activityEnterAnimation : Ti.App.Android.R.anim.slide_out_right
                });
            } else {
                new_win.close({animated:true});
            }
        }
    });
    */
    if(os==='android'){
        new_win.open({
            animated:true, 
            theme: "AmazingTheme",
            activityEnterAnimation: Ti.App.Android.R.anim.slide_in,
            activityExitAnimation: Ti.App.Android.R.anim.still
        });
    } else {
        new_win.containingNav = win.containingNav;
        win.containingNav.openWindow(new_win);//,{animated:true}
    }


}



function openCustomBrowser(currentWin, url, share_tune_data, evals, video_data, news_data, hide_share_button){

    if (Titanium.Network.online === false) {
        alert('No network connection detected.\n\nAre you connected to wifi or a mobile network?');
        return;
    }    
    evals = evals || null;
    share_tune_data =  share_tune_data || null;
    news_data =  news_data || null;
    video_data =  video_data || null;
    hide_share_button = hide_share_button || false;
    url = url.replace('Http://','http://');   
    //url = url + '?from_app=true'; // For Apple. yeah. Thanks Apple.
    var current_url = url;
    var w = Ti.UI.createWindow({
        fullscreen:true,
        navBarHidden:true,
        top:0,
        bottom:0
    });
    if(!isTablet()){
        w.orientationModes = [Ti.UI.PORTRAIT, Ti.UI.UPSIDE_PORTRAIT];
    }
    var top_view = Ti.UI.createView({
        top:0,
        left:0,
        right:0,
        zIndex:1,
        backgroundColor:'#222',
        bottom:0,
        height:50
    });
    var logo = Ti.UI.createImageView({
        image:'/images/amazingradio@2x.png',
        right:10,
        width:158,
        height:40
    });

    top_view.add(logo);
    var back_button = Titanium.UI.createButton({
        width:70,
        left:0,
        height:50,
        color:'#9dcb3b',
        title:'\uf053',
        font: {fontFamily:'amazing-icomoon', fontSize:24},
        backgroundColor:'transparent',
        backgroundImage:'/images/blank.png'
    });

    top_view.add(back_button);

    back_button.addEventListener('click',function(){
       if(Ti.Platform.osname=='android'){
            // Use custom animations in /platform/android/res/anim 
            w.close({
                activityEnterAnimation : Ti.App.Android.R.anim.slide_none,
                activityExitAnimation : Ti.App.Android.R.anim.slide_out_left_to_right
            });
        } else {
            w.close({animated:true});
        }
    });

    w.add(top_view);

    if(Ti.Platform.osname=='android'){
        w.addEventListener('androidback', function(e){
            // Use custom animations in /platform/android/res/anim 
            w.close({
                activityEnterAnimation : Ti.App.Android.R.anim.slide_none,
                activityExitAnimation : Ti.App.Android.R.anim.slide_out_left_to_right
            });
        });
    }

    var barcol = '#222';

    // If logged into amazingtunes account, set the cookies for the mobile site

    if(Ti.App.Properties.getString("amazing_access_token")!=undefined && Ti.App.Properties.getString("amazing_access_token")!=null){

        var cookie_at = Ti.Network.createCookie({
            name:"amazing_access_token",
            value:Ti.App.Properties.getString("amazing_access_token"),
            domain: ".amazingtunes.com",
            path: "/"
        });
        Ti.Network.addHTTPCookie(cookie_at);

        var cookie_aud = Ti.Network.createCookie({
            name:"amazing_user_data",
            value:JSON.stringify(Ti.App.Properties.getObject("amazing_user_data")),
            domain: ".amazingtunes.com",
            path: "/"
        });
        Ti.Network.addHTTPCookie(cookie_aud);

        var cookie_wt = Ti.Network.createCookie({
            name:"welcome_text_dismissed",
            value:"true",
            domain: ".amazingtunes.com",
            path: "/"
        });
        Ti.Network.addHTTPCookie(cookie_wt);

    }
    //  "yyyy-_MM_-ddTHH:mm:ss.SSS+0000" 

    var webwindow = Ti.UI.createWebView({
        hideLoadIndicator:true,
        top:50, left:0, right:0, bottom:40, translucent:false
    });

    if(Ti.Platform.osname=='android'){
        webwindow.enableZoomControls = false;
    }
    webwindow.url = url;
    var web_toolbar;
    // 0xe863
    //var back_button = Ti.UI.createButton({
    //   image: '/images/btn_back.png',enabled:false
    //});

    var back_button = createIconButton('\uf053',24,'#aaa','#873e3e');
    back_button.width = '20%';
    back_button.height = 40;
    back_button.zIndex = 2;
    back_button.top = 0;
    back_button.left = 0;
    back_button.opacity = 0.5;
    back_button.addEventListener('click', function(){
        webwindow.goBack();
    });
    // 0xe874
    //var refresh_button = Ti.UI.createButton({
    //     systemButton:Ti.UI.iPhone.SystemButton.REFRESH
    //});
    var refresh_button = createIconButton('\uf021',24,'#aaa','#873e3e');
    refresh_button.width = '20%';
    refresh_button.height = 40;
    refresh_button.zIndex = 2;
    refresh_button.top = 0;
    refresh_button.left = '20%';
    refresh_button.addEventListener('click', function(){
        webwindow.reload();
    });    
    // 0xe864
    //var forward_button = Ti.UI.createButton({
    //   image: '/images/btn_fwd.png',enabled:false
    //});
    var forward_button = createIconButton('\uf054',24,'#aaa','#873e3e');
    forward_button.width = '20%';
    forward_button.height = 40;
    forward_button.zIndex = 2;
    forward_button.top = 0;
    forward_button.left = '40%';
    forward_button.opacity = 0.5;
    forward_button.addEventListener('click', function(){
        webwindow.goForward();
    });
    // 0xe8e5
    //var share_button = Ti.UI.createButton({
    //    systemButton:Ti.UI.iPhone.SystemButton.ACTION
    //}); 

    if(hide_share_button===false){
        var share_button = createIconButton('\uf1e0',24,'#aaa','#873e3e');
        share_button.width = '20%';
        share_button.height = 40;
        share_button.zIndex = 2;
        share_button.top = 0;
        share_button.right = 0;
        share_button.addEventListener('click',function(){
            sharing.showShareOptions(w,share_tune_data, video_data, news_data, webwindow.url);        
        });
    }

    web_toolbar = Ti.UI.createView({
        backgroundColor:barcol,
        bottom:-2,
        borderWidth:2,
        borderColor:'#444',
        height:42,
        left:-2,
        right:-2
    });

    web_toolbar.add(back_button);
    web_toolbar.add(refresh_button);
    web_toolbar.add(forward_button);
    if(hide_share_button===false){
        web_toolbar.add(share_button);
    }

    var style;
    if(Titanium.Platform.osname!='android'){
        style = Ti.UI.iOS.ActivityIndicatorStyle.BIG;
    } else {
        style = Ti.UI.ActivityIndicatorStyle.BIG;
    }

    var loadInd = Ti.UI.createActivityIndicator({
        height:80,
        width:80,
        zIndex:100,
        backgroundColor:'#aa000000',
        style:style
    }); 
    
    w.add(loadInd);

    w.add(web_toolbar);

    w.add(webwindow);

    // For some reason - probably due to JS or something, beforeload fires too many times.. so..
    var has_loaded_once = false;
    webwindow.addEventListener('beforeload',function(e){
        //console.log('webview beforeload event');
        if(!has_loaded_once){
            loadInd.show();
        }
    });

    webwindow.addEventListener('load',function(e){

        if(webwindow.canGoForward()){
            forward_button.enabled = true;
            forward_button.opacity = 1.0;
        } else {            
            forward_button.enabled = false;
            forward_button.opacity = 0.5;

        }
        if(webwindow.canGoBack()){
            back_button.enabled = true;
            back_button.opacity = 1.0;

        } else {            
            back_button.enabled = false;
            back_button.opacity = 0.5;
        }
        current_url = e.url;
        //console.log('WEBVIEW LOADED e.url : '+e.url);
        //console.log(webwindow.html);
        has_loaded_once = true;
        
        loadInd.hide();
        
        if(evals!=null){
            //console.log('running evals : ');
            //console.log(evals);
            webwindow.evalJS(evals);
        }
        //console.log('HTML: ');
        //console.log(e.source.html);
    });
    if(currentWin!=undefined){
        Piwik_tracker.trackEvent({
            category:"browser",
            name: url,
            action:"open"
        }); 
        if(os=='android'){
            w.open({
                //theme: "Theme.AppCompat.Fullscreen",
                animated:true, 
                theme: "AmazingTheme",
                activityEnterAnimation : Ti.App.Android.R.anim.slide_in_right_to_left,
                activityExitAnimation : Ti.App.Android.R.anim.slide_none
            });
        } else {
            w.containingNav = currentWin.containingNav;
            currentWin.containingNav.openWindow(w);
        }    
    }
}

function openWindow(win, url, config_data){    
    config_data = config_data || null;
    if (Titanium.Network.online === false) {
        alert('No network connection detected.\n\nAre you connected to wifi or a mobile network?');
        return;
    }
    if(url == req_win){
        //console.log('the last requested window is still being opened. Slow down!');
        return;
    }    
    req_win = url;
    var new_win = Ti.UI.createWindow({
        top:0,
        left:0,
        right:0,
        bottom:0,
        fullscreen:true,
        navBarHidden:true,
        tabBarHidden:true,
        navTintColor:'#333',
        tintColor:'#333',
        backgroundColor:'#111',
        url:url
    });
    if(!isTablet()){
        win.orientationModes = [Ti.UI.PORTRAIT, Ti.UI.UPSIDE_PORTRAIT];
    }
    new_win.addEventListener('open', function(e){
        req_win = null;
    });
    // add provided config_data to window
    if(config_data!=null){
        for(key in config_data){
            new_win[key] = config_data[key];
        }
    }
    if(os=='android'){
        new_win.open({
            animated:true, 
            theme: "AmazingTheme",
            activityEnterAnimation : Ti.App.Android.R.anim.slide_in_right_to_left,
            activityExitAnimation : Ti.App.Android.R.anim.slide_none
        });
    } else {
        new_win.containingNav = win.containingNav;
        win.containingNav.openWindow(new_win);//,{animated:true}
    }
}



function getDeviceWidth(){
    if(Ti.Platform.osname=='android'){
        return Math.round(Ti.Platform.displayCaps.platformWidth / Ti.Platform.displayCaps.logicalDensityFactor);
    }
    return Ti.Platform.displayCaps.platformWidth;
}

function getDeviceHeight(){
    if(Ti.Platform.osname=='android'){
        return Math.round(Ti.Platform.displayCaps.platformHeight / Ti.Platform.displayCaps.logicalDensityFactor);
    }
    return Ti.Platform.displayCaps.platformHeight;
}

function isTablet(){
    return Titanium.Platform.osname === 'ipad' || (Titanium.Platform.osname === 'android' && Titanium.Platform.Android.physicalSizeCategory > 2);
}

function checkTablet(){
    var platform = Ti.Platform.osname;
    switch (platform) {
        case 'ipad':
            return true;
        case 'android':
            var psc = Ti.Platform.Android.physicalSizeCategory;
            var tiAndroid = Ti.Platform.Android;
            return psc === tiAndroid.PHYSICAL_SIZE_CATEGORY_LARGE || psc === tiAndroid.PHYSICAL_SIZE_CATEGORY_XLARGE;
        default:
            return Math.min(
            Ti.Platform.displayCaps.platformHeight,
            Ti.Platform.displayCaps.platformWidth
        ) >= 400
    }
}

function isLandscape(){
    if(getDeviceWidth() > getDeviceHeight()){
        return true;
    } else {
        return false;
    }
}




exports.openWindow = openWindow;
exports.openWindowModule = openWindowModule;
exports.openCustomBrowser = openCustomBrowser;
exports.isTablet = isTablet;
exports.checkTablet = checkTablet;
exports.isLandscape = isLandscape;

