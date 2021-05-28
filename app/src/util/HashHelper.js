Ext.define('Awddy.util.HashHelper', {
    singleton: true,

    _hashIndex: {
        id: 0,
        nameLen: 6,
        name: 8,
        dps: 8,
        date: 12,
        race: 15,
        talents: 16,
        slotHead: 17,
        slotNeck: 27,
        slotShoulder: 35,
        slotBack: 45,
        slotChest: 55,
        slotWrist: 65,
        slotHands: 75,
        slotWaist: 85,
        slotLegs: 93,
        slotFeet: 103,
        slotRing1: 113,
        slotRing2: 119,
        slotTrinket1: 125,
        slotTrinket2: 129,
        slotMainHand: 133,
        slotOffHand: 143,
        slotTotem: 153,
        opponent: 155,
        encounterType: 156,
    },

    _raceMapping: {
        '0': 'draenei',
        '1': 'orc',
        '2': 'troll',
        '3': 'tauren',
    },
    _opponentMapping: {
        '0': 'lady-vashj',
    },
    _encounterTypeMapping: {
        '0': 'patchwork',
    },

    parseHash(hash) {
        const id = hash.substr(this._hashIndex.id, 6),
              nameLen = parseInt('0x' + hash.substr(this._hashIndex.nameLen, 2)),
              name = hash.substr(this._hashIndex.name, nameLen),
              dps = hash.substr(this._hashIndex.dps + nameLen, 4),
              date = hash.substr(this._hashIndex.date + nameLen, 3),
              race = hash.substr(this._hashIndex.race + nameLen, 1),
              talents = hash.substr(this._hashIndex.talents + nameLen, 1),
              slotHead = hash.substr(this._hashIndex.slotHead + nameLen, 10),
              slotNeck = hash.substr(this._hashIndex.slotNeck + nameLen, 8),
              slotShoulder = hash.substr(this._hashIndex.slotShoulder + nameLen, 10),
              slotBack = hash.substr(this._hashIndex.slotBack + nameLen, 10),
              slotChest = hash.substr(this._hashIndex.slotChest + nameLen, 10),
              slotWrist = hash.substr(this._hashIndex.slotWrist + nameLen, 10),
              slotHands = hash.substr(this._hashIndex.slotHands + nameLen, 10),
              slotWaist = hash.substr(this._hashIndex.slotWaist + nameLen, 8),
              slotLegs = hash.substr(this._hashIndex.slotLegs + nameLen, 10),
              slotFeet = hash.substr(this._hashIndex.slotFeet + nameLen, 10),
              slotRing1 = hash.substr(this._hashIndex.slotRing1 + nameLen, 6),
              slotRing2 = hash.substr(this._hashIndex.slotRing2 + nameLen, 6),
              slotTrinket1 = hash.substr(this._hashIndex.slotTrinket1 + nameLen, 4),
              slotTrinket2 = hash.substr(this._hashIndex.slotTrinket2 + nameLen, 4),
              slotMainHand = hash.substr(this._hashIndex.slotMainHand + nameLen, 10),
              slotOffHand = hash.substr(this._hashIndex.slotOffHand + nameLen, 10),
              slotTotem = hash.substr(this._hashIndex.slotTotem + nameLen, 2),
              opponent = hash.substr(this._hashIndex.opponent + nameLen, 1),
              encounterType = hash.substr(this._hashIndex.encounterType + nameLen, 1);

        return {
            id,
            name,
            dps,
            changeDate: date,
            race,
            talents,
            slotHead,
            slotNeck,
            slotShoulder,
            slotBack,
            slotChest,
            slotWrist,
            slotHands,
            slotWaist,
            slotLegs,
            slotFeet,
            slotRing1,
            slotRing2,
            slotTrinket1,
            slotTrinket2,
            slotMainHand,
            slotOffHand,
            slotTotem,
            opponent,
            encounterType,
        };
    },

    hashToRace(hash) {
        const result = this._raceMapping[hash];
        if (!result) {
            throw new Error('race hash invalid: ' + hash);
        }
        return result;
    },

    raceToHash(race) {
        const result = Object
            .keys(this._raceMapping)
            .find(hash => this._raceMapping[hash] === race);
        if (!result) {
            throw new Error('race invalid: ' + race);
        }
        return result;
    },

    nameToHash(name) {
        const nameCut = name.substr(0, 255);
        return this.makeSureIsLength(nameCut.length.toString(16), 2) + nameCut;
    },

    hashToDps(hash) {
        return parseInt('0x' + hash) / 10;
    },

    dpsToHash(dps) {
        return this.makeSureIsLength(parseInt(Math.min(dps, 6553.5) * 10).toString(16), 4);
    },

    hashToDate(hash) {
        return new Date(1609455600000 + parseInt('0x' + hash) * 86400000);
    },

    dateToHash(date) {
        return this.makeSureIsLength(parseInt((date.getTime() - 1609455600000) / 86400000).toString(16), 3);
    },

    hashToItem(hash, sockets, enchant) {
        return {
            itemId: parseInt('0x' + hash.substr(0, 2)),
            gem1Id: sockets >= 1 ? parseInt('0x' + hash.substr(2, 2)) : null,
            gem2Id: sockets >= 2 ? parseInt('0x' + hash.substr(4, 2)) : null,
            gem3Id: sockets >= 3 ? parseInt('0x' + hash.substr(6, 2)) : null,
            enchantId: enchant ? parseInt('0x' + hash.substr(2 + sockets * 2, 2)) : null,
        };
    },

    itemToHash(item, sockets, enchant) {
        return `${
            this.makeSureIsLength(item.itemId.toString(16), 2)
        }${
            sockets >= 1 ? this.makeSureIsLength(item.gem1Id.toString(16), 2) : ''
        }${
            sockets >= 2 ? this.makeSureIsLength(item.gem2Id.toString(16), 2) : ''
        }${
            sockets >= 3 ? this.makeSureIsLength(item.gem3Id.toString(16), 2) : ''
        }${
            enchant ? this.makeSureIsLength(item.enchantId.toString(16), 2) : ''
        }`;
    },

    hashToOpponent(hash) {
        const result = this._opponentMapping[hash];
        if (!result) {
            throw new Error('opponent hash invalid: ' + hash);
        }
        return result;
    },

    opponentToHash(opponent) {
        const result = Object
            .keys(this._opponentMapping)
            .find(hash => this._raceMapping[hash] === opponent);
        if (!result) {
            throw new Error('opponent invalid: ' + opponent);
        }
        return result;
    },

    hashToEncounterType(hash) {
        const result = this._encounterTypeMapping[hash];
        if (!result) {
            throw new Error('encounter type hash invalid: ' + hash);
        }
        return result;
    },

    encounterTypeToHash(encounterType) {
        const result = Object
            .keys(this._encounterTypeMapping)
            .find(hash => this._encounterTypeMapping[hash] === encounterType);
        if (!result) {
            throw new Error('encounter type invalid: ' + encounterType);
        }
        return result;
    },

    makeSureIsLength(string, length) {
        while (string.length < length) {
            string = '0' + string;
        }
        return string;
    }
});
