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
        slotNeck: 28,
        slotShoulder: 37,
        slotBack: 48,
        slotChest: 59,
        slotWrist: 70,
        slotHands: 81,
        slotWaist: 92,
        slotLegs: 101,
        slotFeet: 112,
        slotFinger1: 123,
        slotFinger2: 130,
        slotTrinket1: 137,
        slotTrinket2: 142,
        slotMainHand: 147,
        slotOffHand: 158,
        slotTotem: 169,
        opponent: 172,
        encounterType: 173,
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
              slotHead = hash.substr(this._hashIndex.slotHead + nameLen, 11),
              slotNeck = hash.substr(this._hashIndex.slotNeck + nameLen, 9),
              slotShoulder = hash.substr(this._hashIndex.slotShoulder + nameLen, 11),
              slotBack = hash.substr(this._hashIndex.slotBack + nameLen, 11),
              slotChest = hash.substr(this._hashIndex.slotChest + nameLen, 11),
              slotWrist = hash.substr(this._hashIndex.slotWrist + nameLen, 11),
              slotHands = hash.substr(this._hashIndex.slotHands + nameLen, 11),
              slotWaist = hash.substr(this._hashIndex.slotWaist + nameLen, 9),
              slotLegs = hash.substr(this._hashIndex.slotLegs + nameLen, 11),
              slotFeet = hash.substr(this._hashIndex.slotFeet + nameLen, 11),
              slotFinger1 = hash.substr(this._hashIndex.slotFinger1 + nameLen, 7),
              slotFinger2 = hash.substr(this._hashIndex.slotFinger2 + nameLen, 7),
              slotTrinket1 = hash.substr(this._hashIndex.slotTrinket1 + nameLen, 5),
              slotTrinket2 = hash.substr(this._hashIndex.slotTrinket2 + nameLen, 5),
              slotMainHand = hash.substr(this._hashIndex.slotMainHand + nameLen, 11),
              slotOffHand = hash.substr(this._hashIndex.slotOffHand + nameLen, 11),
              slotTotem = hash.substr(this._hashIndex.slotTotem + nameLen, 3),
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
            slotFinger1,
            slotFinger2,
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
            itemId: parseInt('0x' + hash.substr(0, 3)),
            gem1Id: sockets >= 1 ? parseInt('0x' + hash.substr(3, 2)) : null,
            gem2Id: sockets >= 2 ? parseInt('0x' + hash.substr(5, 2)) : null,
            gem3Id: sockets >= 3 ? parseInt('0x' + hash.substr(7, 2)) : null,
            enchantId: enchant ? parseInt('0x' + hash.substr(3 + sockets * 2, 2)) : null,
        };
    },

    itemToHash(item, sockets, enchant) {
        return `${
            this.makeSureIsLength(item.itemId.toString(16), 3)
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
            .find(hash => this._opponentMapping[hash] === opponent);
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
