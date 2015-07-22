/*
"url": "git://github.com/typicode/json-server.git"
"description": "Serves JSON files through REST routes.",
*/


express 设置包括了：
defaults
router


在 src/router.js 中：
exports = function(source) {
    var router = express.Router()

    router.use(bodyParser.json({
        limit: '10mb'
    }))
    router.use(bodyParser.urlencoded({
        entended: false
    }))
    router.use(methodOverride())

    var db = low(source)

    router.db = db // export ?

    router.get('/db', function showDatabase() {})

    router.route('/:resource')
        .get(list)
        .post(create)

    router.router('/:resource/:id')
        .get(show)
        .put(update)
        .patch(update)
        .delete(destroy)

    router.get('/:parent/:parentId/:resource', list)

    function list(req, res, next) {
        // start/end/limit/
        // order/sort
        // q - full-text search

        if(req.query.q) {
            var q = req.query.q.toLowerCase()
            array = db(req.params.resource).filter(function(obj) {
                for(var key in obj) {
                    var value = obj[key]
                    if(_.isString(value) && value.toLowerCase().indexOf(q) !== -1) {
                        return true;
                    }
                }
            })
        } else {
            if(req.params.parent) {
                // remove 's' in str
                filters[req.params.parent.slice(0, -1)+'Id'] = +req.params.parentId
            }
            // add left(not known) query into filters
            for(key in req.query) {
                if(key !== 'callback' && key !== '_') {
                    filters[key] = utils.toNative(req.query[key])
                }
            }
            if(_(filters).isEmpty()) {
                array = db(req.params.resource).value()
            } else{
                array = db(req.params.resource).filter(filters)
            }
        }

        // sort. slice/page omit
    }

    function show/create/update() {
        var resource = db(req.params.resource)
            .get(utils.toNative(req.params.id))

        for(var key in req.body) {
            req.body[key] = utils.toNative(req.body[key])
        }
        if(resource) {
            res.jsonp(resource)
        } else {
            res.status(404).jsonp({})
        }
    }

    function destroy(req, res, next) {
        db(req.params.resource)
            .remove(utils.toNative(req.params.id))
        // remove dependents documents
        var removable = utils.getRemovable(db.object)

        _(removable).each(function(item) {
            db(item.name).remove(item.id)
        })

        res.status(200).jsonp({})
    }
}


在 bin/index.js 中
start 函数中：
var server = jsonServer.create()
server.use(jsonServer.defaults)
server.listen(port, argv.host)


在 src/defaults.js 中 注入 connect 中间件：
[logger('dev', {
    skip: function(req, res) {
        return req.path == '/favicon.ico'
    }
}), express.static(__dirname + '/public'), cors({
    origin: true,
    credentials: true
}), errorhandler()]

在 src/utils 中：
// turn string to native(like boolean, integer etc)
function toNative(value) {
    if(typeof value === 'string') {
        if(value === '' || value.trim() !== value) {
            return value
        } else if (value === 'true' || value === 'false') {
            return value === 'true'
        } else if (!isNaN(+value)) {
            return +value;
        }
    }
    return value
}

// find documents id that have unstatisfied relations
// example: a comment that references a post that doesn't exist
function getRemovable(db) {
    var removable = []
    _(db).each(function(coll, collName) {
        _(coll).each(function(doc) {
            _(doc).each(function(value, key) {
                if(/Id$/.test(key)) {
                    var refName = _.pluralize(key.slice(0, -2))
                    if(db[refName]) {
                        var ref = _.findWhere(db[refName], {id: value})
                        if(_.isUndefined(ref)) {
                            removable.push({
                                name: collName,
                                id: doc.id
                            })
                        }
                    }
                }
            })
        })
    })

    return removable
}


