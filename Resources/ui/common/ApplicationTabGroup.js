function ApplicationTabGroup() {
	//create module instance
	var self = Ti.UI.createTabGroup();
 
	// Create modules to be required for : Home and Settings. > return a window.
	// Provide a handheld and tablet version if neccessary. 

	var WinHome = require('/ui/common/window_home');
	var WinSettings = require('/ui/common/window_settings');
	var WinHelp = require('/ui/common/window_help');

	var win_home = WinHome.createWindow();
	var win_settings = WinSettings.createWindow();
	var win_help = WinHelp.createWindow();


	var tab_home = Ti.UI.createTab({
		title: 'home',
		icon: '/images/KS_nav_ui.png',
		window: win_home
	});
	win_home.containingTab = tab_home;

	var tab_settings = Ti.UI.createTab({
		title:'settings',
		icon: '/images/KS_nav_views.png',
		window: win_settings
	});
	win_settings.containingTab = tab_settings;

	var tab_help = Ti.UI.createTab({
		title: 'help',
		icon: '/images/KS_nav_views.png',
		window: win_help
	});
	win_help.containingTab = tab_help;

	self.addTab(tab_home);
	self.addTab(tab_settings);
	self.addTab(tab_help);

	return self;
};

module.exports = ApplicationTabGroup;
