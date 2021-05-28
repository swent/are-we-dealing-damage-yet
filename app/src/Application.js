Ext.define('Awddy.Application', {
	extend: 'Ext.app.Application',
	name: 'Awddy',
	requires: [
		'Awddy.*',
		'Ext.layout.*',
	],

	async launch() {
		await this.initializeViewport();
	},

	async initializeViewport() {
		await this.removeSplash();
		Ext.Viewport.add([{ xtype: 'awddy.viewport' }]);
	},

	async removeSplash() {
		return new Promise((resolve) => {
			Ext.getBody().removeCls('launching');
			const splash = document.getElementById('splash');

			setTimeout(() => splash.parentNode.removeChild(splash), 400);
			setTimeout(() => resolve(), 100);
		});
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
