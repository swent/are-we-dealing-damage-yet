Ext.define('Awddy.view.widget.CharacterListEntry', {
    extend: 'Ext.Widget',
    xtype: 'awddy.widget.characterlistentry',
    classCls: 'awddy-widget-characterlistentry',

    config: {
        name: '',
        talents: '',
        date: '',
    },

    factionIconElCls: 'faction-icon-el',
    nameElCls       : 'name-el',
    talentsElCls    : 'talents-el',
    dateElCls       : 'date-el',
    buttonElCls     : 'button-el',

    getTemplate() {
        return [{
            tag      : 'div',
            reference: 'factionIconElement',
            cls      : this.factionIconElCls,
        }, {
            tag      : 'span',
            reference: 'nameElement',
            cls      : this.nameElCls,
        }, {
            tag      : 'span',
            reference: 'talentsElement',
            cls      : this.talentsElCls,
        }, {
            tag      : 'span',
            reference: 'dateElement',
            cls      : this.dateElCls,
        }, {
            tag      : 'div',
            reference: 'buttonElement',
            cls      : this.buttonElCls,
            listeners: {
                click: 'toggleCollapsed',
            },
        }];
    },

    updateName(value) {
        this.nameElement.setHtml(value);
    },

    updateTalents(value) {
        this.talentsElement.setHtml(value);
    },

    updateDate(value) {
        this.dateElement.setHtml(value);
    },

    toggleCollapsed() {
        console.log('click');
    },

});
