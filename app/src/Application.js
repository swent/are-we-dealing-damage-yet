Ext.define('Awddy.Application', {
	extend: 'Ext.app.Application',
	name: 'Awddy',
	requires: [
		'Awddy.*',
		'Ext.layout.*',
	],
	// defaultToken: 'homeview',

	removeSplash: function () {
		Ext.getBody().removeCls('launching')
		var elem = document.getElementById("splash")
		elem.parentNode.removeChild(elem)
	},

	launch: function () {
		this.removeSplash();
		Ext.Viewport.add([{ xtype: 'awddy.viewport' }])
	},

	onAppUpdate: function () {
		Ext.Msg.confirm('Application Update', 'This application has an update, reload?',
			function (choice) {
				if (choice === 'yes') {
					window.location.reload();
				}
			}
		);
	}
});
