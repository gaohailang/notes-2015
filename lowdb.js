/*
"url": "git://github.com/typicode/lowdb.git"
"description": "Flat JSON file database",
*/

入口：
function low (file, options) {
    var checksum

    options = _.assign({
        autosave: true,
        async: true
    }, options)

    // save, saveSync

    function save() {
        if(file && options.autosave) {
            var str = low.stringify(db.object)
            if(str === checksum) return
            checksum = str
            options.async ? disk.write(file, str) : disk.writeSync(file, str)
        }
    }

    function saveSync(f) {
        f = f ? f: file
        disk.writeSync(f, low.stringify(db.object))
    }

    db.object = {}
    if(file) {
        var data = disk.read(file)
        if(data) {
            try{
                db.object = low.parse(data)
            } catch(e) {
                e.message += ' in file:' + file
                throw e
            }
        } else {
            db.saveSync()
        }
    }

    // 使用 db 方法
    function db(key) {
        if(db.object[key]) {
            var array = db.object[key]
        } else {
            var array = db.object[key] = []
            save()
        }

        // 抱保证每次 lodash fn 后， 调用 save
        var short = lowChain(array, save)
        short.chain = function() {
            return lodashChain(array, save)
        }
        return short
    }
    return db
}

low.parse // proxy to JSON
low.stringify = function(obj) {
    return JSON.stringify(obj, null, 2)
}

/*
chain: Creates a lodash object that wraps the given value with explicit method chaining enabled.
flow: Creates a function that returns the result of invoking the provided functions with the this binding of the created function, where each successive invocation is supplied the return value of the previous.
*/
function lodashChain(array, cb) {
    var chain = _.chain(array)
    function addCallbackOnValue(c) {
        c.value = _.flow(c.value, function(arg) {
            cb()
            return arg
        })
    }
    addCallbackOnValue(chain)

    _.functions(chain).forEach(function(method) {
        chain[method] = _.flow(chain[method], function(arg) {
            var isChain = _.isObject(arg) && arg.__chain__
            if(isChain) addCallbackOnValue(arg)
            return arg
        })
    })
    return chain
}
