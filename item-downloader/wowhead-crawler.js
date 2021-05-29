const https = require('https');
const fs = require('fs');
const path = require('path');

const version = '2.1.0';
const debugLogging = false;
const toDownload = JSON.parse(
    fs.readFileSync(path.resolve(__dirname, 'to-download.json'), { encoding: 'utf8' })
);

const extraStats = {
    "Devilsaur Gauntlets": {
        physicalHitChance: 1,
    },
    "Devilsaur Leggings": {
        physicalHitChance: 1,
    },
    "Dal'Rend's Sacred Charge": {
        attackPower: 25,
    },
    "Dal'Rend's Tribal Guardian": {
        attackPower: 25,
    },
    'Warblade of the Hakkari': {
        swordSkill: 3,
    },
};

async function getHttp(url) {
    const key = url.split('/').reverse()[0];
    let data = '',
        destroyed = false,
        timeout = null;

    return new Promise(resolve => {
        https.get(url, function (res) {
            res.on('data', function (d) {
                data += d.toString('utf8');
                if (timeout) {
                    clearTimeout(timeout);
                }
                timeout = setTimeout(() => {
                    if (!destroyed) {
                        destroyed = true;
                        console.warn(`[${key}] Request ended due to timeout !`);
                        resolve(data);
                    }
                }, 1000);
            });
            res.on('end', function () {
                if (timeout) {
                    clearTimeout(timeout);
                }
                if (!destroyed) {
                    destroyed = true;
                    if (debugLogging) console.log(`[${key}] Request ended gracefully !`);
                    resolve(data);
                }
            });
        });
    });
}

async function downloadImage(url, destination) {
    let buffers = [],
        destroyed = false,
        timeout = null;

    return new Promise(resolve => {
        https.get(url, function (res) {
            res.on('data', function (d) {
                buffers.push(d);
                if (timeout) {
                    clearTimeout(timeout);
                }
                timeout = setTimeout(() => {
                    if (!destroyed) {
                        destroyed = true;
                        fs.writeFileSync(destination, Buffer.concat(buffers));
                        resolve();
                    }
                }, 3000);
            });
            res.on('end', function () {
                if (timeout) {
                    clearTimeout(timeout);
                }
                if (!destroyed) {
                    destroyed = true;
                    fs.writeFileSync(destination, Buffer.concat(buffers));
                    resolve();
                }
            });
        });
    });
}

class StringCapture {
    content = null;
    constructor(string) {
        this.content = string;
    }
    seekStart(startString) {
        this.content = this.content.substring(this.content.indexOf(startString) + startString.length);
        return this;
    }
    captureUntil(endString) {
        return this.content.substring(0, this.content.indexOf(endString));
    }
}

class WowHeadLoader {
    urlsToLoad;
    parallelism;
    results;

    constructor(urls, parallelism) {
        this.urlsToLoad = urls;
        this.parallelism = parallelism;
        this.results = [];
    }

    async downloadAll() {
        return new Promise(resolve => {
            const parallelPromises = [];
            for (let i = 0; i < this.parallelism; i++) {
                parallelPromises.push(this.startNewPromise());
            }
            Promise.all(parallelPromises).then(() => resolve(this.results));
        });
    }

    async startNewPromise() {
        return new Promise(async resolve => {
            while (this.urlsToLoad.length) {
                const nextUrl = this.urlsToLoad.splice(0, 1);
                const result = await this.downloadAndParse(nextUrl[0]);
                this.results.push(result);
            }
            resolve();
        });
    }

    async downloadAndParse(url) {
        const urlParts = url.split('/').reverse(),
              key = urlParts[0],
              wowHeadId = parseInt(urlParts[1].split('=')[1]);

        try {
            if (debugLogging) console.log(`[${key}] Sending request ...`);
            const body = await getHttp(url);

            if (debugLogging) console.log(`[${key}] Parsing basic data ...`);
            const itemHtml = new StringCapture(body)
                .seekStart('].tooltip_enus = "')
                .captureUntil('";')
                .replace(/\\"/g, '"')
                .replace(/\\\//g, '/');
            fs.writeFileSync(path.resolve(__dirname, 'temp', wowHeadId.toString() + '.html'), itemHtml, { encoding: 'utf8' });

            const image = new StringCapture(body)
                .seekStart('<script>WH.Gatherer.addData(')
                .seekStart('"icon"')
                .seekStart('"')
                .captureUntil('"');

            const name = new StringCapture(itemHtml)
                .seekStart('<!--nstart-->')
                .seekStart('>')
                .captureUntil('<');

            const itemLvl = parseInt(new StringCapture(itemHtml)
                .seekStart('<!--ilvl-->')
                .captureUntil('<'));

            const setId = itemHtml.includes('<a href="/item-set=') ? parseInt(new StringCapture(itemHtml)
                    .seekStart('/item-set=')
                    .captureUntil('"')) :
                null;

            let isWeapon = false;
            let slot = new StringCapture(itemHtml)
                .seekStart('<!--nstart-->')
                .seekStart('<table')
                .seekStart('<td>')
                .captureUntil('</td>')
                .toLowerCase()
                .replace(/ /g, '-');
            if (['main-hand', 'off-hand', 'one-hand'].includes(slot)) {
                isWeapon = true;
                slot = slot.replace('-', '');
            } else if (slot === 'ranged') {
                isWeapon = true;
            }

            const rarityKey = new StringCapture(itemHtml)
                    .seekStart('<!--nstart-->')
                    .seekStart('"')
                    .captureUntil('"'),
                rarity = rarityKey === 'q1' ? 'common' : (rarityKey === 'q2' ? 'uncommon' : (rarityKey === 'q3' ? 'rare' : (rarityKey === 'q4' ? 'epic' : 'legendary')));

            const category = new StringCapture(itemHtml)
                .seekStart('<!--scstart')
                .seekStart('class')
                .seekStart('>')
                .captureUntil('<')
                .toLowerCase();

            const statsString = new StringCapture(itemHtml)
                .seekStart('</table>')
                .seekStart('</table>')
                .captureUntil('<!--e-->');

            const advStatsString = new StringCapture(itemHtml)
                .seekStart('</table>')
                .seekStart('</table>')
                .seekStart('</table>')
                .seekStart('<td>')
                .captureUntil('</td>');

            const result = {
                wowHeadId,
                name: name,
                itemLevel: itemLvl,
                setId: setId,
                slot: slot,
                category: category,
                rarity: rarity,
                stats: {},
                procs: {},
                imageId: image,
            };

            if (isWeapon) {
                if (debugLogging) console.log(`[${key}] Parsing weapon stats ...`);
                const weaponStatsCapture = new StringCapture(itemHtml)
                    .seekStart('</table>')
                    .seekStart('<!--dmg-->');
                result.stats.weaponMinDamage = parseInt(weaponStatsCapture.captureUntil(' - '));
                weaponStatsCapture.seekStart(' - ');
                result.stats.weaponMaxDamage = parseInt(weaponStatsCapture.captureUntil(' Damage'));
                weaponStatsCapture.seekStart('<!--spd-->');
                result.stats.weaponSpeed = parseFloat(weaponStatsCapture.captureUntil('</th>'));
            }

            if (debugLogging) console.log(`[${key}] Parsing basic stats ...`);
            const strength = statsString.match(/\+[0-9]+ Strength/g);
            if (strength) result.stats.strength =
                parseInt(new StringCapture(strength[0]).seekStart('+').captureUntil(' '));
            const agility = statsString.match(/\+[0-9]+ Agility/g);
            if (agility) result.stats.agility =
                parseInt(new StringCapture(agility[0]).seekStart('+').captureUntil(' '));
            const stamina = statsString.match(/\+[0-9]+ Stamina/g);
            if (stamina) result.stats.stamina =
                parseInt(new StringCapture(stamina[0]).seekStart('+').captureUntil(' '));
            const intellect = statsString.match(/\+[0-9]+ Intellect/g);
            if (intellect) result.stats.intellect =
                parseInt(new StringCapture(intellect[0]).seekStart('+').captureUntil(' '));
            const spirit = statsString.match(/\+[0-9]+ Spirit/g);
            if (spirit) result.stats.spirit =
                parseInt(new StringCapture(spirit[0]).seekStart('+').captureUntil(' '));
            const armor = statsString.match(/<!--amr-->[0-9]+ Armor</g);
            if (armor) result.stats.armor =
                parseInt(new StringCapture(armor[0]).seekStart('>').captureUntil(' '));
            const fireResistance = statsString.match(/\+[0-9]+ Fire Resistance/g);
            if (fireResistance) result.stats.fireResistance =
                parseInt(new StringCapture(fireResistance[0]).seekStart('+').captureUntil(' '));
            const shadowResistance = statsString.match(/\+[0-9]+ Shadow Resistance/g);
            if (shadowResistance) result.stats.shadowResistance =
                parseInt(new StringCapture(shadowResistance[0]).seekStart('+').captureUntil(' '));
            const natureResistance = statsString.match(/\+[0-9]+ Nature Resistance/g);
            if (natureResistance) result.stats.natureResistance =
                parseInt(new StringCapture(natureResistance[0]).seekStart('+').captureUntil(' '));
            const frostResistance = statsString.match(/\+[0-9]+ Frost Resistance/g);
            if (frostResistance) result.stats.frostResistance =
                parseInt(new StringCapture(frostResistance[0]).seekStart('+').captureUntil(' '));
            const arcaneResistance = statsString.match(/\+[0-9]+ Arcane Resistance/g);
            if (arcaneResistance) result.stats.arcaneResistance =
                parseInt(new StringCapture(arcaneResistance[0]).seekStart('+').captureUntil(' '));

            const defenseRating = advStatsString.match(/Increases defense rating by <!--rtg12-->[0-9]+\./g);
            if (defenseRating) result.stats.defenserating =
                parseInt(new StringCapture(defenseRating[0]).seekStart('>').captureUntil('.'));
            const dodgeRating = advStatsString.match(/Increases your dodge rating by <!--rtg13-->[0-9]+\./g);
            if (dodgeRating) result.stats.dodgerating =
                parseInt(new StringCapture(dodgeRating[0]).seekStart('>').captureUntil('.'));
            const parryRating = advStatsString.match(/Increases your parry rating by <!--rtg14-->[0-9]+\./g);
            if (parryRating) result.stats.parryrating =
                parseInt(new StringCapture(parryRating[0]).seekStart('>').captureUntil('.'));
            const shieldBlockValue = advStatsString.match(/Increases the block value of your shield by [0-9]+\./g);
            if (shieldBlockValue) result.stats.shieldblockvalue =
                parseInt(new StringCapture(shieldBlockValue[0]).seekStart('by ').captureUntil('.'));
            const shieldBlockRating = advStatsString.match(/Increases your shield block rating by <!--rtg15-->[0-9]+\./g);
            if (shieldBlockRating) result.stats.shieldblockrating =
                parseInt(new StringCapture(shieldBlockRating[0]).seekStart('>').captureUntil('.'));
            const resilienceRating = advStatsString.match(/Improves your resilience rating by <!--rtg35-->[0-9]+\./g);
            if (resilienceRating) result.stats.resiliencerating =
                parseInt(new StringCapture(resilienceRating[0]).seekStart('>').captureUntil('.'));

            if (debugLogging) console.log(`[${key}] Parsing advanced stats ...`);
            const attackPower = advStatsString.match(/Increases attack power by [0-9]+\./g);
            if (attackPower) result.stats.attackpower =
                parseInt(new StringCapture(attackPower[0]).seekStart('by ').captureUntil('.'));
            const physicalCritRating = advStatsString.match(/Improves critical strike rating by <!--rtg32-->[0-9]+\./g);
            if (physicalCritRating) result.stats.physicalcritrating =
                parseInt(new StringCapture(physicalCritRating[0]).seekStart('>').captureUntil('.'));
            const physicalHitRating = advStatsString.match(/Improves hit rating by <!--rtg31-->[0-9]+\./g);
            if (physicalHitRating) result.stats.physicalhitrating =
                parseInt(new StringCapture(physicalHitRating[0]).seekStart('>').captureUntil('.'));
            const physicalHasteRating = advStatsString.match(/Improves haste rating by <!--rtg36-->[0-9]+\./g);
            if (physicalHasteRating) result.stats.physicalhasterating =
                parseInt(new StringCapture(physicalHasteRating[0]).seekStart('>').captureUntil('.'));
            const armorPenetration = advStatsString.match(/Your attacks ignore [0-9]+ of your opponent's armor/g);
            if (armorPenetration) result.stats.armorpenetration =
                parseInt(new StringCapture(armorPenetration[0]).seekStart('ignore ').captureUntil(' '));
            const expertiseRating = advStatsString.match(/Increases your expertise rating by <!--rtg37-->[0-9]+\./g);
            if (expertiseRating) result.stats.expertiserating =
                parseInt(new StringCapture(expertiseRating[0]).seekStart('>').captureUntil('.'));

            const manaRegFive = advStatsString.match(/Restores [0-9]+ mana per 5 sec\./g);
            if (manaRegFive) result.stats.manaregfive =
                parseInt(new StringCapture(manaRegFive[0]).seekStart('Restores ').captureUntil(' '));

            // const swordSkill = advStatsString.match(/Increased Swords \+[0-9]+\./g);
            // if (swordSkill) result.stats.swordSkill =
            //     parseInt(new StringCapture(swordSkill[0]).seekStart('+').captureUntil('.'));
            // const maceSkill = advStatsString.match(/Increased Maces \+[0-9]+\./g);
            // if (maceSkill) result.stats.maceSkill =
            //     parseInt(new StringCapture(maceSkill[0]).seekStart('+').captureUntil('.'));
            // const axeSkill = advStatsString.match(/Increased Axes \+[0-9]+\./g);
            // if (axeSkill) result.stats.axeSkill =
            //     parseInt(new StringCapture(axeSkill[0]).seekStart('+').captureUntil('.'));
            // const daggerSkill = advStatsString.match(/Increased Daggers \+[0-9]+\./g);
            // if (daggerSkill) result.stats.daggerSkill =
            //     parseInt(new StringCapture(daggerSkill[0]).seekStart('+').captureUntil('.'));
            // const bowSkill = advStatsString.match(/Increased Bows \+[0-9]+\./g);
            // if (bowSkill) result.stats.bowSkill =
            //     parseInt(new StringCapture(bowSkill[0]).seekStart('+').captureUntil('.'));
            // const gunSkill = advStatsString.match(/Increased Guns \+[0-9]+\./g);
            // if (gunSkill) result.stats.gunSkill =
            //     parseInt(new StringCapture(gunSkill[0]).seekStart('+').captureUntil('.'));
            // const crossBowSkill = advStatsString.match(/Increased Crossbows \+[0-9]+\./g);
            // if (crossBowSkill) result.stats.crossBowSkill =
            //     parseInt(new StringCapture(crossBowSkill[0]).seekStart('+').captureUntil('.'));

            if (debugLogging) console.log(`[${key}] Parsing done !`);

            /* Add extra stats */
            if (extraStats[name]) {
                for (const key in extraStats[name]) {
                    result.stats[key] = extraStats[name][key];
                }
            }

            return result;
        } catch (error) {
            console.error(`[${key}] ${error}`);
        }
    }
}

async function main() {
    const urls = [],
          itemIdStorageFilename = path.resolve(__dirname, 'itemid-storage.json'),
          itemIdDictionary = fs.existsSync(itemIdStorageFilename) ?
              JSON.parse(fs.readFileSync(itemIdStorageFilename, { encoding: 'utf8' })) :
              {},
          parallelism = 10;

    for (const key in toDownload) {
        const entries = toDownload[key];
        entries.forEach(entry => urls.push(entry));
    }

    console.log('##################################################');
    console.log(`# wowhead-crawler v${version}`);
    console.log(`  > Downloading ${urls.length} item(s) parallelized in ${parallelism} threads ...`);

    const results = await (new WowHeadLoader(urls, parallelism)).downloadAll();
    results.sort((a, b) => a.itemLevel > b.itemLevel ? -1 : b.itemLevel > a.itemLevel ? 1 : 0);

    /* Prep folders */
    const distFolder = path.resolve(__dirname, 'dist');
    if (fs.existsSync(distFolder)) {
        fs.rmdirSync(distFolder, { recursive: true, });
        await sleep(250);
    }
    const iconsFolder = path.resolve(distFolder, 'icons');
    fs.mkdirSync(distFolder);
    fs.mkdirSync(iconsFolder);

    /* Process results */
    const itemDictionary = {};
    let imageCounter = 0;
    const imageDict = {};
    let currentMaxItemId = Math.max.apply(Math, [-1].concat(Object.values(itemIdDictionary))) + 1;
    results.forEach(result => {
        if (!imageDict[result.imageId]) {
            imageDict[result.imageId] = imageCounter++;
        }
        result.imageId = imageDict[result.imageId];
        if (!itemDictionary[result.slot]) {
            itemDictionary[result.slot] = [];
        }
        itemDictionary[result.slot].push(result);
        /* Assign previous id or generate new */
        if (!itemIdDictionary[result.wowHeadId]) {
            itemIdDictionary[result.wowHeadId] = currentMaxItemId++;
        }
        result.id = itemIdDictionary[result.wowHeadId];
    });

    /* Download images */
    const downloadPromises = Object
        .keys(imageDict)
        .map(key => downloadImage(
            `https://wow.zamimg.com/images/wow/icons/large/${key}.jpg`,
            path.join(iconsFolder, `${imageDict[key]}.jpg`)));

    /* Save itemId storage */
    const itemIdStoragePromise = new Promise(resolve =>
        fs.writeFile(itemIdStorageFilename, JSON.stringify(itemIdDictionary), { encoding: 'utf8' }, resolve));

    /* Write json file */
    const jsonPromise = new Promise(resolve => fs.writeFile(
        path.join(distFolder, 'items.json'),
        JSON.stringify(itemDictionary),
        { encoding: 'utf8', }, resolve));

    /* Write css */
    const cssPromise = new Promise(resolve => fs.writeFile(path.join(distFolder, 'items.css'), Object.keys(imageDict).map(key => `
.awddy-itemicon-${imageDict[key]} {
  background-image: url(icons/items/${imageDict[key]}.jpg);
}`).join('\n'), { encoding: 'utf8', }, resolve));

    /* Copy item-sets json */
    const setsJson = new Promise(resolve =>
        fs.copyFile(path.resolve(__dirname, 'item-sets.json'), path.resolve(distFolder, 'item-sets.json'), resolve));

    /* Wait for all to finish */
    await Promise.all(downloadPromises.concat([itemIdStoragePromise, jsonPromise, cssPromise, setsJson]));

    console.log('  > Crawling finished !');
    process.exit();
}

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

main();
