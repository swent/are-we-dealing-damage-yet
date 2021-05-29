Ext.define('Awddy.store.Items', {
    extend: 'Ext.data.Store',
    alias: 'store.awddy.items',
    model: 'Awddy.model.Item',

    proxy: {
        type: 'memory',
        reader: {
            type: 'json',
        },
    },
});
