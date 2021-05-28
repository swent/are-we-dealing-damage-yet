Ext.define('Awddy.store.Characters', {
    extend: 'Ext.data.Store',
    alias: 'store.awddy.characters',
    model: 'Awddy.model.Character',

    proxy: {
        type: 'memory',
        reader: {
            type: 'json',
        },
    },

    data: [{
        faction: 0,
        name: 'Svnt',
        talents: 0,
        dps: 133.38,
        changeDate: new Date(),
    }, {
        faction: 1,
        name: 'Avenghath',
        talents: 1,
        dps: 733.38993,
        changeDate: new Date(),
    }],
});
