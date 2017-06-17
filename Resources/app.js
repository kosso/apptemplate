/*

	A boilerplate Titanium iOS and Android app project for an app template and structure which I find myself often needing to build from scratch. 
  
	Author: @kosso
  *******************************************
*/

var win = require('/ui/window_home').createWindow();

if(Titanium.Platform.osname==='android'){
  win.open({theme: "FullscreenTheme"}); // See /platforms/android/res/values/mytheme.xml  
} else {
  var rootNavWin = Titanium.UI.iOS.createNavigationWindow({
    zIndex:1,
    window: win
  });
  win.containingNav = rootNavWin;
  rootNavWin.open();
}
