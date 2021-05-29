Ext.define('Awddy.model.Item', {
    extend: 'Ext.data.Model',
    alias: 'model.awddy.item',
    fields: [
        {name: 'id', type: 'int'},
        {name: 'name', type: 'string'},
        {name: 'itemLevel', type: 'int'},
        {name: 'iconKey', type: 'string'},
        {name: 'setId', type: 'int'},
        {name: 'rarity', type: 'string'},
        {name: 'slot', type: 'string'},
        {name: 'category', type: 'string'},

        {name: 'stats', type: 'auto'},
        {name: 'procs', type: 'auto'},
    ],
});
