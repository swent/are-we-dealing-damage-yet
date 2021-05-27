Ext.define('Awddy.view.main.CharacterList', {
    extend: 'Ext.Container',
    xtype: 'awddy.main.characterlist',
    classCls: 'awddy-main-characterlist',
    requires: [
        // 'Ext.grid.Grid ',
    ],

    layout: 'vbox',
    items: [{
        xtype: 'label',
        reference: 'header',
        cls: 'header',
        html: 'Your Characters',
    }, {
        xtype: 'awddy.widget.toolbar',
        reference: 'toolbar',
        cls: 'toolbar',
        items: [{
            xtype: 'button',
            cls: [
                'createbutton',
                'awddy-button-bordered',
            ],
            iconCls: 'x-icon-el',
            text: 'Create New',
        }],
    }, {
        xtype: 'grid',
        reference: 'grid',
        cls: 'grid',
        store: {
            type: 'awddy.characters',
        },
        columns: [{
            text: 'Faction',
            dataIndex: 'faction',
            width: 70,
        }, {
            text: 'Name',
            dataIndex: 'name',
            flex: 1,
        }, {
            text: 'Talents',
            dataIndex: 'talents',
            width: 100,
        }, {
            text: 'Last DPS',
            dataIndex: 'dps',
            width: 100,
        }, {
            text: 'Last Change',
            dataIndex: 'changeDate',
            width: 100,
        }],
    }],
});
