
# template engine

『Pro Django 2』

way of generating text-based output, such as HTML or emails.

a good template language, drawing a clear line between templates and Python code.

- what template syntax look likes(tags, filters, variable evaulate, etc)
- how templates are loaded, paresed, and rendered.
- how variables are managed within template
- how new tags and filters can be created
- what differences between compile, precompile, render

### Insider

- Swig API
- swig opts
- cache opts
- template loader

- setFilter
- setTag
- setExtension

- precompile
- render
- renderFIle
- compile
- compileFile

- run

```js
render(source, options) // specific options file path when source is string of template, instead of file path. make extend/include etc works

compile()
string source into renderable template function

function(source, options) {

    if(cached) return cached;

    pre = this.precompile(source, options);

    utils.extend(compiled, pre.tokend);
    if(key) {
        cacheSet(key, options, compiled);
    }

    return compiled;


    function compiled(locals) {

        return pre.tpl(self, lcls, filters, utils, efn);
    }
}


// pre-compile a string into cache-able template function
function precompile(source, options) {
    var tokens = self.parse(source, options),
        parent = getParents(token, options),
        tpl,
        err;

    try {
        tpl = new Function('_swig', '_ctx', '_filters', '_utils', '_fn',
        '  var _ext = _swig.extensions,\n'+
        '    _output = "";\n' +
        parser.compile(tokens, parents, options) + '\n' +
        '  return _output;\n'
        );
    } catch (e) {utils.throwError(e, null, options.filename);}

    return {
        tpl: tpl,
        tokens: tokens
    };
}

// parse a given source string into tokens
function parse() {
    var locals = getLocals(options);

    return parser.parse(this, source, options, tags, filters);
}



// paser.js
exports.parse = function(swig, source, opts, tags, filters) {
    // splitter for var, tag, comment blocks
    // is a variable, is a tag, is content string, is comment?
    parseVariable(chunk.replace(varStrip, ''), line);
    token = parseTag(chunk.replace(tagStrip, ''), line);
    if(token) {
        if(token.name === 'extends') {
          parent = token.args.join('').replace(/^\'|\'$/g, '').replace(/^\"|\"$/g, '');
        } else if (token.block && !stack.length) {
          blocks[token.args.join('')] = token;
        }
    }
    utils.each(source.split(splitter), function(chunk) {
        if(!chunk) {}
    });
}
function TokenParser(tokens, filters, autoescape, line, filename) {

    this.parse = function() {

    }
}

TokenParser.prototype = {
    // set a custom method to be called when a token type is found

}

exports.compile = function (compiler, args, content, parents, options, blockName) {
  var fnName = args.shift();

  return '_ctx.' + fnName + ' = function (' + args.join('') + ') {\n' +
    '  var _output = "",\n' +
    '    __ctx = _utils.extend({}, _ctx);\n' +
    '  _utils.each(_ctx, function (v, k) {\n' +
    '    if (["' + args.join('","') + '"].indexOf(k) !== -1) { delete _ctx[k]; }\n' +
    '  });\n' +
    compiler(content, parents, options, blockName) + '\n' +
    ' _ctx = _utils.extend(_ctx, __ctx);\n' +
    '  return _output;\n' +
    '};\n' +
    '_ctx.' + fnName + '.safe = true;\n';
};
```

Template Loaders

Extending Swig

```js
filterFn.safe = true; // disable auto-escaping on its output

swig.setTag(name, parse, compile, ends, blockLevel)
parse(str, line, parser, types, stack, options, swig)
compile(compiler, args, content, parents, options, blockName)
ends: whether or not a tag must have an {% end[tagName]
blockLevel: allow tag be outside block when extending a parent template

TYPES: token type enum
```


### Tags

else
elif
for
if
autoescape
spaceless:
remove whitespace between html tags

```html
{% spaceless %}
  {% for num in foo %}
  <li>{{ loop.index }}</li>
  {% endfor %}
{% endspaceless %}
// => <li>1</li><li>2</li><li>3</li>
```

filter:
apply a filter to entire block of template


```html
{% filter replace(".", "!", "g") %}Hi. My name is Paul.{% endfilter %}
// => Hi! My name is Paul!
```

raw:
force content to not be auto-escaped

```html
// foobar = '<p>'
{% raw %}{{ foobar }}{% endraw %}
```

set
block
extends
import
include:
include a partial in place(local variable context can be altered)

```html
// only, literal, restricts to with context as local variables(for best performance)
// my_obj = { food: 'tacos', drink: 'horchata' };
{% include "./partial.html" with my_obj only %}
// => I like tacos and horchata.
```

macro:
create custom. reusable snippets within your templates
can be imported from one template to another using {% import ... %}

```html
{% macro input(type, name, id, label, value, error) %}
    <label for="{{ name }}">{{ label }}</label>
    <input type="{{ type }}" name="{{ name }}" id="{{ id }}" value="{{ value }}"{% if error %} class="error"{% endif %}>
{% endmacro %}

{{ input("text", "fname", "fname", "First Name", fname.value, fname.errors) }}
```

parent:
inject content from the parent template's block of the same name into current block

```html
{% extends "./foo.html" %}
{% block content %}
  My content.
  {% parent %}
{% endblock %}
```

### Filters

title
capitalize
upper
lower
date: date('Y-m-d') Format a date or Date-compatible string.
json
replace: search, replacement, flag(g, i, m)

last
first
join
sort
uniq
reverse
*groupBy

default: If the input is falsey, a default value can be specified.
escape
safe: force input to not be auto-escaped, replace `raw`
addslashes
striptags
url_encode
url_decode

Usage

```html
// people = [{ age: 23, name: 'Paul' }, { age: 26, name: 'Jane' }, { age: 23, name: 'Jim' }];
{% for agegroup in people|groupBy('age') %}
  <h2>{{ loop.key }}</h2>
  <ul>
    {% for person in agegroup %}
    <li>{{ person.name }}</li>
    {% endfor %}
  </ul>
{% endfor %}
```

