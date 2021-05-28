/* Avoid the theme from applying the x-big class to html-root */
Ext.theme.getDocCls = () => '';

/* Create app */
Ext.application({
	extend: 'Awddy.Application',
	name: 'Awddy'
});
