Ext.define('Awddy.Application', {
	extend: 'Ext.app.Application',
	name: 'Awddy',
	requires: [
		'Awddy.*',
		'Ext.layout.*',
	],
	stores: [
		'Awddy.store.Items',
	],

	async launch() {
		await this.initializeViewport();

		const hash = '6d6d6d04svnt09540c800111aabbcc99111aabbcc111aabbcc99111aabbcc99111aabbcc99111aabbcc99111aabbcc99111aabbcc111aabbcc99111aabbcc99111aa99111aa99111aa111aa111aabbcc99111aabbcc9911100';
		const char = Awddy.model.Character.fromHash(hash);
		const compareHash = char.getHash();
		console.log(char, hash === compareHash);
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
