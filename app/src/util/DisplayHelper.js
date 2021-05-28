Ext.define('Awddy.util.DisplayHelper', {
	singleton: true,

	getTalentDisplayString(talentIndex) {
		switch (talentIndex) {
			case 0:
				return '14 / 43 / 3';
			case 1:
				return '0 / 45 / 15';
			default:
				throw new Error('talentIndex invalid: ' + talentIndex);
		}
	}
});
