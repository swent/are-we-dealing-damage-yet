Ext.define('Awddy.Application', {
	extend: 'Ext.app.Application',
	name: 'Awddy',
	requires: [
		'Awddy.*',
		'Ext.layout.*',
	],
	stores: [
		'Awddy.store.Characters',
	],

	async launch() {
		await this.initializeViewport();

		this.loadUrlHash();

		const hash = '6d6d6d04svnt09540c800111aabbcc99111aabbcc111aabbcc99111aabbcc99111aabbcc99111aabbcc99111aabbcc99111aabbcc111aabbcc99111aabbcc99111aa99111aa99111aa111aa111aabbcc99111aabbcc9911100';
		const char = Awddy.model.Character.fromHash(hash);
		const compareHash = char.getHash();
		console.log(char, hash === compareHash);
	},

	loadUrlHash() {
		const store = this.getStore('Awddy.store.Characters'),
			hash = window.location.search.includes('?') && window.location.search.includes('char=') ?
				window.location.search.substr(1).split('&').find(param => param.startsWith('char')).split('=')[1] :
				null;

		if (hash) {
			let newChar;
			try {


				newChar = Awddy.model.Character.fromHash(hash);
				const existingChar = store.data.items
					.find(char => char.data.name === newChar.data.name && char.data.id === newChar.data.id);

				if (existingChar) {
					// Update char?
					console.log('update?');
				} else {
					// Import char
					let nameToImport = newChar.data.name;
					while (store.data.items
						.find(char => char.data.name === nameToImport)) {
						nameToImport += '_2';
					}
					newChar.set('name', nameToImport);
					store.load(newChar);
				}

			} catch (err) {
				console.error('hash in url is faulty');
			}
		}
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
