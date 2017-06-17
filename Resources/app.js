/*

  *******************************************
*/

var os = Titanium.Platform.osname;

var win = require('/ui/common/window_home').createWindow();

var player = require('/mods/player');

if(os==='android'){
  win.open({theme: "AmazingTheme"});
 //win.open();

} else {
  var rootNavWin = Titanium.UI.iOS.createNavigationWindow({
    zIndex:1,
    window: win
  });
  win.containingNav = rootNavWin;
  rootNavWin.open();
}
