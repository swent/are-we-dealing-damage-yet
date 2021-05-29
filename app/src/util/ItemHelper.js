Ext.define('Awddy.util.ItemHelper', {
    singleton: true,

    _itemSlotCompatibilityMappings: {
        finger: ['finger1', 'finger2'],
        finger1: ['finger', 'finger2'],
        finger2: ['finger', 'finger1'],
        trinket: ['trinket1', 'trinket2'],
        trinket1: ['trinket', 'trinket2'],
        trinket2: ['trinket', 'trinket1'],
        mainhand: ['onehand', 'twohand'],
        offhand: ['onehand'],
        onehand: ['mainhand', 'offhand'],
        twohand: ['mainhand'],
    },

    checkItemSlotCompatibility(itemSlot1, itemSlot2) {
        if (itemSlot1 === itemSlot2) {
            return true;
        }
        const compatibleItemSlots = this._itemSlotCompatibilityMappings[itemSlot1];
        if (compatibleItemSlots && compatibleItemSlots.includes(itemSlot2)) {
            return true;
        }
        return false;
    }
});


