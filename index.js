var yaml = require('js-yaml')
var fs = require('fs')
var async = require('async')
var path = require('path')
var chalk = require('chalk')

var srcpath = './docker'

if (process.argv[2] !== undefined) {
    srcpath = process.argv[2]
}

console.log("docker folder: " + chalk.blue(srcpath));

//let's find all folders inside srcpath
var folders = fs.readdirSync(srcpath).filter(function(file){
    return fs.statSync(path.join(srcpath, file)).isDirectory()
})

console.log(chalk.blue(folders.length) + ' folders found');
console.log('will try to read ' + chalk.gray("'docker-compose.yml'") + ' files');

var fatCompose = {}

folders.forEach(function(folder) {
    console.log("./" + folder + ' :');
    try {
        var compose = yaml.safeLoad(fs.readFileSync(srcpath + '/' + folder + '/docker-compose.yml'))

        var containers = Object.keys(compose)

        containers.forEach(function(container) {
            if (compose[container].hasOwnProperty('volumes')) {
                compose[container].volumes = updateVolumes(compose[container].volumes, folder)
            }
            updateExternalLinks(compose, container)

            fatCompose[container] = compose[container]
            console.log(' - ' + container + ' ' + chalk.green('done'));
        })
    } catch (e) {
        console.log(chalk.red(e));
    } finally {
        console.log(folder + ' folder ' + chalk.green('done'));
    }
})

console.log(chalk.green("OK") + ': add all docker-compose to a big one');

try {
    console.log("will write the new " + chalk.gray("'docker-compose.yml'"));
    var dump = yaml.safeDump(fatCompose, {
        flowLevel: 3
    })
    fs.writeFileSync('docker-compose.yml', dump)
} catch (e) {
    console.log(chalk.red(e));
} finally {
    console.log(chalk.green('Successfully merged your docker-compose.yml!'));
}

//Add folder's name to the file or folder path when passing volume to the container
// return the new volumes array
function updateVolumes(volumes, folderName) {
    var newVolumes = []
    volumes.forEach(function(volume) {
        if (volume.startsWith("./")) {
            var newVolumePath = './' + folderName + '/' + volume.slice(2, volume.length - 1)
            newVolumes.push(newVolumePath)
        }

        if (volume.startsWith('../')) {
            newVolumes.push(volume.slice(1, volume.length - 1))
        }
    })

    return newVolumes
}

// Void function that will transfert container links from 'external_links' to 'links'
function updateExternalLinks(compose, dockerName) {
    if (!compose[dockerName].hasOwnProperty("links")) {
        compose[dockerName].links = []
    }

    if (compose[dockerName].hasOwnProperty("external_links")){
        compose[dockerName].external_links.forEach(function(externalLink) {
            compose[dockerName].links.push(externalLink)
        })
        delete compose[dockerName].external_links
    }

    if (compose[dockerName].links.length == 0) {
        delete compose[dockerName].links
    }
}
