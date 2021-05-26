Ext.define('Awddy.view.Viewport', {
    extend: 'Ext.Container',
    xtype: 'awddy.viewport',
    classCls: 'awddy-viewport',
    viewModel: {
        type: 'awddy.viewportviewmodel',
    },
    requires: [

    ],
    layout: 'fit',
    items: [
        { xtype: 'awddy.header', reference: 'header', docked: 'top', },
        { xtype: 'awddy.footer', reference: 'footer', docked: 'bottom', },
        { xtype: 'awddy.main.characterlist', reference: 'mainview' },
    ]
});
