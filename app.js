#!/usr/bin/env node

var fs = require('fs');
var path = require('path');
var os = require('os');
var exec = require('child_process').exec;

var pkg = require('./package.json');
var pwd = process.cwd();
var LOCALPATH = process.env.HOME || process.env.USERPROFILE;
var HOSTS = os.platform() == 'win32' ? 'C:/Windows/System32/drivers/etc/hosts' : '/etc/hosts';
var EOL = os.EOL;
var isWin = (/^win/).test(os.platform()) ? true: false;

var program = require('commander');
var request = require('request');
var hosts = require('hosts-group');

var getCleanHost = function(str) {
    var hostsArr = [];
    var lines = str.split(EOL);
    for (var i = 0; i < lines.length; i++) {
        if (lines[i] !== '' && !/\#/.test(lines[i]) && !/localhost/.test(lines[i])) {
            hostsArr.push(lines[i]);
        }
    }
    return hostsArr.join('\n');
}

var update = function(){
    request('https://raw.githubusercontent.com/racaljk/hosts/master/hosts', function(error, res, body) {
        if (error) {
            console.log(error);
        }
        if (res.statusCode == 200) {
            hosts.removeGroup('vpn');
            hosts.addGroup('vpn', '获取最新https://github.com/racaljk/hosts并应用hosts');
            var hostsArr = getCleanHost(body);
            fs.appendFile(HOSTS, hostsArr, function(err, data) {
                if (err) {
                    console.log(err);
                }
                // 更新dns
                isWin ? exec('ipconfig /flushdns') : exec('sudo killall -HUP mDNSResponder');
                console.log('更新成功！');
            });
        }
    })
}


var remove = function(){
    hosts.removeGroup('vpn');
}

program.version(pkg.version);
program.command('update').description('update hosts').action(function() {
    update();
});
program.command('remove').description('remove vpn hosts').action(function() {
    remove();
});
program.parse(process.argv);
