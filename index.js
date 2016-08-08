var yaml = require('js-yaml')
var fs = require('fs')
var async = require('async')
var path = require('path')
var chalk = require('chalk')

var srcpath = './docker'

//let's find all docker-compose.yml file
var array = fs.readdirSync(srcpath).filter(function(file){
    return fs.statSync(path.join(srcpath, file)).isDirectory()
})

array.forEach(function(folder) {
    try {
        var dockerCompose = yaml.safeLoad(fs.readFileSync(srcpath + '/' + folder + '/docker-compose.yml'))
        var dockerName = Object.keys(dockerCompose)[0]
        console.log(dockerCompose[dockerName].container_name);
    } catch (e) {
        console.log(chalk.red(e));
    } finally {

    }
})
