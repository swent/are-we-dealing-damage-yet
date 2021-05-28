Ext.define('Awddy.model.Character', {
    extend: 'Ext.data.Model',
    fields: [
        { name: 'id',               type: 'string' },
        { name: 'name',             type: 'string' },
        { name: 'dps',              type: 'number' },
        { name: 'changeDate',       type: 'date' },
        { name: 'race',             type: 'string' },
        { name: 'talents',          type: 'int' },
        { name: 'equipmentSet',     type: 'auto' },
        { name: 'opponent',         type: 'string' },
        { name: 'encounterType',    type: 'string' },
    ],

    getHash() {

    },

    statics: {

        fromHash(hash) {
            const parsed = Awddy.util.HashHelper.parseHash(hash);
            return Ext.create('Awddy.model.Character', {
                id: parsed.id,
                name: parsed.name,
                dps: Awddy.util.HashHelper.hashToDps(parsed.dps),
                changeDate: Awddy.util.HashHelper.hashToDate(parsed.changeDate),
                race: Awddy.util.HashHelper.hashToRace(parsed.race),
                talents: parseInt('0x' + parsed.talents),
                equipmentSet: Ext.create('Awddy.model.EquipmentSet', {
                    head: Awddy.util.HashHelper.hashToItem(parsed.slotHead, 3, true),
                    neck: Awddy.util.HashHelper.hashToItem(parsed.slotNeck, 3, false),
                    shoulder: Awddy.util.HashHelper.hashToItem(parsed.slotShoulder, 3, true),
                    back: Awddy.util.HashHelper.hashToItem(parsed.slotBack, 3, true),
                    chest: Awddy.util.HashHelper.hashToItem(parsed.slotChest, 3, true),
                    wrist: Awddy.util.HashHelper.hashToItem(parsed.slotWrist, 3, true),
                    hands: Awddy.util.HashHelper.hashToItem(parsed.slotHands, 3, true),
                    waist: Awddy.util.HashHelper.hashToItem(parsed.slotWaist, 3, false),
                    legs: Awddy.util.HashHelper.hashToItem(parsed.slotLegs, 3, true),
                    feet: Awddy.util.HashHelper.hashToItem(parsed.slotFeet, 3, true),
                    ring1: Awddy.util.HashHelper.hashToItem(parsed.slotRing1, 1, true),
                    ring2: Awddy.util.HashHelper.hashToItem(parsed.slotRing2, 1, true),
                    trinket1: Awddy.util.HashHelper.hashToItem(parsed.slotTrinket1, 1, false),
                    trinket2: Awddy.util.HashHelper.hashToItem(parsed.slotTrinket2, 1, false),
                    mainHand: Awddy.util.HashHelper.hashToItem(parsed.slotMainHand, 3, true),
                    offHand: Awddy.util.HashHelper.hashToItem(parsed.slotOffHand, 3, true),
                    totem: Awddy.util.HashHelper.hashToItem(parsed.slotTotem, 0, false),
                }),
                opponent: Awddy.util.HashHelper.hashToOpponent(parsed.opponent),
                encounterType: Awddy.util.HashHelper.hashToEncounterType(parsed.encounterType),
            });
        }
    }
});
