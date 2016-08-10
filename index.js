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
var composes = []

//check all found folders if user can read docker-compose.yml
folders.forEach(function(folder) {
    try {
        fs.accessSync(srcpath + '/' + folder + '/docker-compose.yml', fs.constants.R_OK)

        composes.push({
            folder: folder,
            compose: yaml.safeLoad(fs.readFileSync(srcpath + '/' + folder + '/docker-compose.yml'))
        })
    } catch (e) {
        console.log(chalk.yellow('./' + folder + ' : ' + e));
    } finally {
    }
})

console.log(chalk.blue(composes.length) + ' docker-compose.yml found');
console.log(chalk.bgMagenta('gonna merge them m8'));

//now that we have loaded all docker-compose files, let's merge them
composes.forEach(function(c) {
    try {
        var compose = c.compose
        var containers = Object.keys(compose)

        containers.forEach(function(container) {
            if (compose[container].hasOwnProperty('volumes')) {
                compose[container].volumes = updateVolumes(compose[container].volumes, c.folder)
            }
            updateExternalLinks(compose, container)

            fatCompose[container] = compose[container]
            console.log(' - ' + container + ' ' + chalk.green('done'));
        })
        console.log(c.folder + ' folder ' + chalk.green('done'));
    } catch (e) {
        console.log(chalk.red(e));
    } finally {

    }
})

console.log(chalk.green("OK") + ': add all docker-compose to a big one');

try {
    //verify that the last char of srcpath is not a '/'
    if (srcpath.endsWith('/')) {
        srcpath = srcpath.slice(0, -1)
    }
    var path = srcpath + "/docker-compose.yml"

    console.log("will write the new " + chalk.gray("'" + path + "'"));
    var dump = yaml.safeDump(fatCompose, {
        flowLevel: 3
    })

    fs.writeFileSync(path, dump)

    console.log(chalk.green('Successfully merged all your docker-compose.yml!'));
} catch (e) {
    console.log(chalk.red(e));
} finally {

}

//Add folder's name to the file or folder path when passing volume to the container
// return the new volumes array
function updateVolumes(volumes, folderName) {
    var newVolumes = []
    volumes.forEach(function(volume) {
        var newVolumePath = volume

        if (volume.startsWith("./")) {
            var newVolumePath = './' + folderName + '/' + volume.slice(2, volume.length)
        }

        if (volume.startsWith('../')) {
            newVolumePath = volume.slice(1, volume.length)
        }

        newVolumes.push(newVolumePath)
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
