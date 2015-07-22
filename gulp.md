
gulp is simply vinyl, vinyl-fs, orchestrator, a CLI, and a set of guidelines to help make good plugins. it completely disrupted the build tool ecosystem and kick off a new wave of awesome projects.

- streams, way of piecing small transform operations together into a pipeline
- vinyl, simple metadata object that describes a file(like files on S3, Dropbox etc)
- vinyl-adapters(vinyl-fs), a way to access files[src(globs), dest(folder), watch(globs, fn)]
- orchestrator, way to define tasks, task dependencies, and run tasks with maximum concurrency while respecting the dependency tree.
- error management
- community

### through2
a tiny wrapper around node stream2 transform
why i don't use node's core 'stream' module

```js
fs.createReadStream('ex.txt').pipe(through2(function(chunk, enc, callback) {
    for (var i = 0; i < chunk.length; i++) {
        if(chunk[i] == 97) {
            chunk[i] == 122; // swap 'a' for 'z'
        }
    }

    this.push(chunk);

    callback();
}))
.pipe(fs.createWriteStream('out.txt'));
```

### gulp-useref

```js
module.exports.asset = function(opts) {
    opts = opts || {};

    var expand = require('brace-expansion'),
        types = opts.types || ['css', 'js'],
        restoreStream = through.obj();
        // _, concat, gulpif, types, unprocessed = 0, end = false;

    var assetStream = through.obj(function(file, enc, cb) {
        var out = useref(file.contents.toString());
        var assets = output[1];

        types.forEach(function(type) {
            var files = assets[type];

            if(!files) return;

            Object.keys(files).forEach(function(name) {

                // get relative file paths and join with search paths to send to vinyl-fs

                src = vfs.src(_.flatten(globs, true), {
                    base: file.base,
                    nosort: true,
                    nonull: true
                })

                // streams = Array.prototype.slice.call(arguments, 1)
                streams.forEach(function(stream) {
                    src.pipe(stream());
                });

                // add assets to the stream
                src
                    .pipe(gulpif(!opts.noconcat, concat(name)))
                    .pipe(through.obj(function (newFile, enc, callback) {
                        this.push(newFile);
                        callback();
                    }.bind(this)))
                    .on('finish', function () {
                        if (--unprocessed === 0 && end) {
                            this.emit('end');
                        }
                    }.bind(this));
            }, this)
        }, this);

        restoreStream.write(file, cb);
    }, function() {
        end = true;
        if(unprocessed === 0) {
            this.emit('end');
        }
    });

    assetStream.restore = function() {
        return restoreStream.pipe(through.obj(), {end: false});
    };

    return assetStream;
}
```

### gulp-util


## Serve

- Require gulp-util as gutil
- Require connect as connect
- Require open as open
- Your watch task handles building the files, and building is configured to be asynchronous


### Orchestrator
a module for sequencing and executing tasks and dependencies in maximum concurrency

add(name[,dpes][,fn]);
define a task

fn,function, performs task's operations. for asynchronous tasks, you need to provide a hit when task is complete

- take in a callback
- return a stream(complete when stream ends) or a promise


### vinyl-fs
adapter for the file system

src(globs[, opt]):
Returns a Readable stream by default


watch(globs[,opt, cb])
dest(folder[, opt])



```js
gulp.task('server', ['watch'], function(callback) {
    var devApp, devServer, devAddress, devHost, url, log=gutil.log, colors=gutil.colors;

    devApp = connect()
        .use(connect.logger('dev'))
        .use(connect.static('build'));

    // change port and hostname to something static if you prefer
    devServer = http.createServer(devApp).listen(0 /*, hostname*/);

    devServer.on('error', function(error) {
        log(colors.underline(colors.red('ERROR'))+' Unable to start server!');
        callback(error); // we couldn't start the server, so report it and quit gulp
    });

    devServer.on('listening', function() {
        devAddress = devServer.address();
        devHost = devAddress.address === '0.0.0.0' ? 'localhost' : devAddress.address;
        url = 'http://' + devHost + ':' + devAddress.port + '/index.html');

        log('');
        log('Started dev server at '+colors.magenta(url));
        if(gutil.env.open) {
            log('Opening dev server URL in browser');
            open(url);
        } else {
            log(colors.gray('(Run with --open to automatically open URL on startup)')); 
        }
        log('');
        callback(); // we're done with this task for now
    });
});
```


## gulp-useref
parse build blocks in HTML files to replace references to non-optimized scripts and stylesheets
It can handle file concatenation but not minification. Files are then passed down the stream. 

<!-- build:<type>(alternate search path) <path> -->
type: js, css or remove
By default the input files are relative to the treated file. Alternate search path allows one to change that

```js
gulp.task('html', function () {
    var assets = useref.assets();

    return gulp.src('app/*.html')
        .pipe(assets)
        .pipe(gulpif('*.js', uglify()))
        .pipe(gulpif('*.css', minifyCss()))
        .pipe(assets.restore())
        .pipe(useref())
        .pipe(gulp.dest('dist'));
});
```

