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
        flex: 1,
        store: 'Awddy.store.Characters',
        columns: [{
            text: 'Faction',
            dataIndex: 'faction',
            width: Ext.os.is.Phone ? 50 : 70,
            renderer: (record, value) => `<img width="${
                    Ext.os.is.Phone ? 34 : 48
                }" height="${
                    Ext.os.is.Phone ? 34 : 48
                }" src="resources/icons/${
                    value === 0 ? 'alliance' : 'horde'
                }-128.png" />`,
            cell: {
                encodeHtml: false,
            },
        }, {
            text: 'Name',
            dataIndex: 'name',
            flex: 1,
        }, {
            text: 'Talents',
            dataIndex: 'talents',
            width: Ext.os.is.Phone ? 70 : 100,
            renderer: (value, record) => {
                return Awddy.util.DisplayHelper.getTalentDisplayString(value);
            },
        }, {
            text: 'Last DPS',
            dataIndex: 'dps',
            width: 100,
            hidden: Ext.os.is.Phone,
        }, {
            text: 'Last Change',
            dataIndex: 'changeDate',
            width: Ext.os.is.Phone ? 95 : 100,
        }],
    }],
});
