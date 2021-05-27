Ext.define('Awddy.view.main.CharacterList', {
    extend: 'Ext.Container',
    xtype: 'awddy.main.characterlist',
    classCls: 'awddy-main-characterlist',

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
        xtype: 'container',
        reference: 'list',
        cls: 'list',
        layout: 'vbox',
        items: [{
            xtype: 'awddy.widget.characterlistentry',
            name: 'Svnt',
            talents: '7 / 41 / 3',
            date: '30-03-2021',
        }, {
            xtype: 'awddy.widget.characterlistentry',
            name: 'Ayuvena test test test test11',
            talents: '0 / 45 / 10',
            date: '30-03-2021',
        }],
    }],
});
