Ext.define('Awddy.model.Character', {
    extend: 'Ext.data.Model',
    fields: [
        { name: 'faction',    type: 'int' },
        { name: 'name',       type: 'string' },
        { name: 'talents',    type: 'int' },
        { name: 'dps',        type: 'number' },
        { name: 'changeDate', type: 'date' },
    ]
});
