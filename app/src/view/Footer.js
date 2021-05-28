Ext.define('Awddy.view.Footer', {
    extend: 'Ext.Component',
    xtype: 'awddy.footer',
    classCls: 'awddy-footer',

    html: 'lutz.heissenberger@gmail.com&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;version ' +
        Ext.manifest.version.split('.').splice(0, 3).join('.'),
});
