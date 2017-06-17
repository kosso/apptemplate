// functions

var req_win = null; // stop double-opening of a window due to lag/impatience/double-click/'bounce'/etc. 
function openWindowModule(win, module_path, config_data){
    if(module_path == req_win){
        return;
    }
    req_win = module_path;
    config_data = config_data || {};  
     
    var new_win = require(module_path).createWindow(config_data);
    new_win.addEventListener('open', function(e){
        req_win = null;
    });

    if(Ti.Platform.osname==='android'){
        new_win.addEventListener('androidback', function(e){
            // Use custom animations in /platform/android/res/anim 
            new_win.close({
                activityEnterAnimation: Ti.App.Android.R.anim.still,     // See: /platform/android/anim/*.xml 
                activityExitAnimation: Ti.App.Android.R.anim.slide_out   // See: /platform/android/anim/*.xml 
            });
        });
    }
    
    if(Ti.Platform.osname==='android'){
        new_win.open({
            theme: "FullscreenTheme",
            activityEnterAnimation: Ti.App.Android.R.anim.slide_in, // See: /platform/android/anim/*.xml 
            activityExitAnimation: Ti.App.Android.R.anim.still      // See: /platform/android/anim/*.xml 
        });
    } else {
        new_win.containingNav = win.containingNav;
        win.containingNav.openWindow(new_win);
    }
}


// Other useful stuff

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

exports.openWindowModule = openWindowModule;
exports.isTablet = isTablet;
exports.checkTablet = checkTablet;
exports.getDeviceHeight = getDeviceHeight;
exports.getDeviceWidth = getDeviceWidth;

