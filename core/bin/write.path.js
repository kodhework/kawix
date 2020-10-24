var Path = require("path")
var fs = require("fs")
var Os = require("os")
exports.write = function (dir) {
    var file = Path.join(Os.homedir(), ".bashrc")
    if (process.getuid() == 0) {
        file = "/etc/bash.bashrc"
    }
    var newline = "\n#kwcore PATH\nexport PATH=\"$PATH:" + dir
    var content = ''
    if (fs.existsSync(file)) {
        content = fs.readFileSync(file, 'utf8')
    }
    if (content.indexOf(newline) < 0) {
        fs.writeFileSync(file, content + newline + "\"\n")
    }


    if (process.getuid() != 0) {
        file = Path.join(Os.homedir(), ".profile")
    }
    else {
        file = "/etc/profile"
    }
    content = ''
    if (fs.existsSync(file)) {
        content = fs.readFileSync(file, 'utf8')
    }
    if (content.indexOf(newline) < 0) {
        fs.writeFileSync(file, content + newline + "\"\n")
    }
}