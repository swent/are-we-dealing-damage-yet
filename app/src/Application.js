Ext.define('Awddy.Application', {
	extend: 'Ext.app.Application',
	name: 'Awddy',
	requires: [
		'Awddy.*',
		'Ext.layout.*',
	],

	async launch() {
		await this.initializeViewport();

		const hash = '6d6d6d04svnt09540c80011aabbcc9911aabbcc11aabbcc9911aabbcc9911aabbcc9911aabbcc9911aabbcc9911aabbcc11aabbcc9911aabbcc9911aa9911aa9911aa11aa11aabbcc9911aabbcc991100';

		const char = Awddy.model.Character.fromHash(hash);
		console.log(char);
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
