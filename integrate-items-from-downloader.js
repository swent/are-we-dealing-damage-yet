const path = require('path');
const fs = require('fs');

console.log('##################################################');
console.log('# items-integrator');

/* Define paths */
const iconsFolder = path.resolve(__dirname, 'resources', 'icons'),
      itemIconsFolder = path.resolve(iconsFolder, 'items'),
      jsonFolder = path.resolve(__dirname, 'resources', 'json'),
      itemsJsonDestination = path.resolve(__dirname, 'resources', 'json', 'items.json'),
      itemSetsJsonDestination = path.resolve(__dirname, 'resources', 'json', 'item-sets.json'),
      itemDownloaderDistFolder = path.resolve(__dirname, 'item-downloader', 'dist'),
      itemIconsSourceFolder = path.resolve(itemDownloaderDistFolder, 'icons'),
      cssDestination = path.resolve(__dirname, 'app', 'sass', 'etc', 'app', 'item-icons.scss');

console.log('  > Cleaning up old resources ...');
/* Cleanup of old resources */
if (fs.existsSync(itemIconsFolder)) {
    fs.rmdirSync(itemIconsFolder, { recursive: true, });
}
fs.mkdirSync(itemIconsFolder);
if (!fs.existsSync(jsonFolder)) {
    fs.mkdirSync(jsonFolder);
}
if (fs.existsSync(itemsJsonDestination)) {
    fs.rmSync(itemsJsonDestination);
}
if (fs.existsSync(itemSetsJsonDestination)) {
    fs.rmSync(itemSetsJsonDestination);
}
if (fs.existsSync(cssDestination)) {
    fs.rmSync(cssDestination);
}

console.log('  > Integrating new resources ...');

/* Copy icons */
const iconPromise = new Promise(resolve => fs.readdir(itemIconsSourceFolder, (_err, files) => {
    const copyPromises = files.map(file => new Promise(resolveInner => fs.copyFile(
        path.resolve(itemIconsSourceFolder, file),
        path.resolve(itemIconsFolder, file),
        resolveInner)));
    Promise.all(copyPromises).then(resolve);
}));

/* Copy json */
const itemsJsonPromise = new Promise(resolve => fs.copyFile(
    path.resolve(itemDownloaderDistFolder, 'items.json'),
    itemsJsonDestination,
    resolve));
const itemSetsJsonPromise = new Promise(resolve => fs.copyFile(
    path.resolve(itemDownloaderDistFolder, 'item-sets.json'),
    itemSetsJsonDestination,
    resolve));

/* Copy css */
const itemsCssPromise = new Promise(resolve => fs.copyFile(
    path.resolve(itemDownloaderDistFolder, 'items.css'),
    cssDestination,
    resolve));

Promise.all([iconPromise, itemsJsonPromise, itemSetsJsonPromise, itemsCssPromise])
    .then(() => console.log('  > Integration finished !'));
