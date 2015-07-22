# Intro
es6, es2015 通过 babel(6to5) or traucar 编译transpile 到 es5 用于浏览器环境

http://babeljs.io/repl/

## 箭头函数 arrows

```js
// Arrow 
[1, 2].forEach((i, idx)=>{
    console.log(i);
});

[1,2].map(i=>i*2);

[1,2].map((i, idx)=>({key: idx, val: i}));

// fat arrow bind this
```


## 类 classes

simple sugar over prototype-based oo ppatern(more declarative)

- extends - prototype-based inheritance
- super calls
- instance and static(with static prefix keyword)
- constructors
- get/set prefix keyword

```js
// Classes
class Mesh {}
class Matrix4 {}
class SkinnedMesh extends Mesh {
  constructor(geometry, materials) {
    super(geometry, materials);
    this.bones = [];
  }
  update(camera) {
    //...
    super.update(camera);
  }
  get boneCount() {
    return this.bones.length;
  }
  set matricType(matrixType) {
    this.idMatric = matricType;
  }
  static defaultMatric() {
    return new Matrix4();
  }
}

var skinMesh1 = new SkinnedMesh('geo', 'materials');
console.log(skinMesh1.boneCount);
```

## 增强的对象字面量 enhanced object literals

to support setting the prototype at construction
shorthand for foo: foo assignments
defining methods
making super calls
computing property names with expressions

so bring object literals and class declarations closer together.

```js
// enhanced object literals
var theProtoObj = [],
  handler;
var obj = {
  __proto__: theProtoObj,
  handler,
  toString() {
    return 'd '+super.toString();
  },
  ['prop_'+(()=>42)()]: 42
};
```

## 模板字符串 template strings (string interpolation)

Security:
Template strings MUST NOT be constructed by untrusted users, because they have access to variables and functions.

多行，和 interpolation 很实用

```js

// https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/template_strings

`In JavaScript this is
  not legal.`

var name = 'siva', time = 'today';
`hello ${name}, how are you ${time}`;

function tag(strings, ...values) {
  console.log(strings.raw[0]);
  console.log(strings[0]); // "Hello "
  console.log(strings[1]); // " world "
  console.log(values[0]);  // 15
  console.log(values[1]);  // 50

  return "Bazinga!";
}
function tag2(strings, exp1, exp2) {
  console.log(strings.raw[0]);
  console.log(strings[0]); // "Hello "
  console.log(strings[1]); // " world "
  console.log(exp1);  // 15
  console.log(exp2);  // 50

  return "Bazinga!";
}
function p(strings) {
  console.log(strings);
}
var a = 5, b = 10;
tag`Hello ${ a + b } world ${ a * b}`;
p(tag2`Hello ${ a + b } world ${ a * b}`);

```

## 解构 destructuring

allow binding using pattern matching(arrays and objects, is fail-soft. allow nested object binding)

```js
var [a, , b] = [1,2,3];
var getASTNode = ()=>{
  return {
    op: 'op',
    lhs: {op: 'lhs.op'},
    rhs: 'rhs'
  };
}
// object matching
var { op: a, lhs: { op: b }, rhs: c }
       = getASTNode();
p(b);

var {op, lhs, rhs} = getASTNode();

function g({lhs: {op: x}}) {
  console.log(x);
}
g({lhs: {op: 'test'}})

var [a=1]=[2];
p(a)
var [a=1]=[]; // fail-soft with default
p(a)
```

## 参数增强 default+rest+spread

Rest replace the need for arguments.

```js
function defaultF(x, y=12) {
  return x+y;
}
f(3) === 15;
function restF(x, ...y) {
  return x * y.length;
}
f(3, 'hello', true, 122);
function spreadF(x, y, z) {
  return x + y + z;
}
f(...[1, 2, 3]);
```

## 变量申明 let, const

block-scoped binding constructs

```js
// let + const
function f() {
  {
    let x;
    {
      const x = 'sneaky';
      // x = 'ff'; or warn read-only
    }
    x = 'inner';
  }
}
```

## 迭代 iterators, for..of

custom iterator-based iteration with for..of. Don’t require realizing an array, enabling lazy design patterns like LINQ.

```js
// iterators + for..of
var fibonacci = {
  [Symbol.iterator]() {
    let pre = 0, cur = 1;
    return {
      next() {
        [pre, cur] = [cur, pre + cur];
        return { done: false, value: cur }
      }
    }
  }
}

for (var n of fibonacci) {
  // truncate the sequence at 1000
  if (n > 1000)
    break;
  console.log(n);
}
```

## 生成器 generators

Generators simplify iterator-authoring using function*(returns a Generator instance) and yield(expression form which returns a value (or throws)).

```js
// Generator
fibonacci = {
  [Symbol.iterator]: function*() {
    let [pre, cur] = [0, 1];
    for(;;) {
      [pre, cur] = [cur, pre+cur];
      yield cur;
    }
  }
};

for (var n of fibonacci) {
  // truncate the sequence at 1000
  if (n > 1000)
    break;
  console.log(n);
}
```

## unicode
## 模块 modules

support for exporting/importing symbols from/to modules without global namespace pollution.

default & wildcard

```js
//  lib/math.js
export function sum (x, y) { return x + y }
export var pi = 3.141593

//  someApp.js
import * as math from "lib/math"
console.log("2π = " + math.sum(math.pi, math.pi))

//  otherApp.js
import { sum, pi } from "lib/math"
console.log("2π = " + sum(pi, pi))


//  lib/mathplusplus.js
export * from "lib/math"
export var e = 2.71828182846
export default (x) => Math.exp(x)

//  someApp.js
import exp, { pi, e } from "lib/mathplusplus"

```

## 模块加载器 modules loader
## 新类型 map, set, weakmap, weakset

```js
let m = new Map()
m.set("hello", 42)
m.set(s, 34)
m.get(s) === 34
m.size === 2
for (let [ key, val ] of m.entries())
    console.log(key + " = " + val)
```

## 代理 proxies
hooking into runtime-level object meta-operations

```js
let target = {
    foo: 'welcome, foo'
}
let proxy = new Proxy(target, {
    get (receiver, name) {
        return name in receiver ? receiver[name] : `Hello, ${name}`
    }
})
```

## 符号 symbols

unique and immutatble data type to be used as an identifier for object properties. optional description for debugging.

```js
Symbol("foo") !== Symbol("foo")
const foo = Symbol()
typeof foo === "symbol"
let obj = {}
obj[foo] = "foo"

JSON.stringify(obj) // {}
Object.keys(obj) // []
Object.getOwnPropertyNames(obj) // []
Object.getOwnPropertySymbols(obj) // [ foo ]
```

## 可子类的内置类型 subclassable built-ins

object property assignment: Object.assign
array element finding (find, findIndex)
string repeat, search
number type checking, safety checking, comparison, truncation, sign determination

```js
'hello'.startsWith|endsWith|includes
'foo'.repeat(3)

<Array>.find(x=>x>3) // equals:
<Array>.filter(function(x) {return x > 3})[0]


Number.isNaN(42) // equals
var isNaN = function(n) {
    return n !== n;
}
Number.isSafeInteger(9007199254740992) // equals
var isSafeInteger = (n) => {
    return (
        typeof n === 'number'
        && Math.round(n) === n
        && -(Math.pow(2, 53) -1) <= n
        && n <= (Math.pow(2, 53) -1)
    );
}

```

## promises

first class representation value that may be available in the future.

```js
function timeout(duration=0) {
    return new Promise((resolve, reject) => {
        setTimeout(resolve, duration);
    });
}

var p = timeout(1000).then(() => {
    return timeout(2000);
}).then(() => {
    throw new Error("hmm");
}).catch(err => {
    return Promise.all([timeout(100), timeout(200)]);
})

function fetchAsync (url, timeout, onData, onError) {
    ...
}
let fetchPromised = (url, timeout) => {
    return new Promise((resolve, reject) => {
        fetchAsync(url, timeout, resolve, reject);
    });
}
Promise.all([
    fetchPromised('http://backend/foo.txt', 500),
    fetchPromised('http://backend/bar.txt', 500),
    fetchPromised('http://backend/baz.txt', 500)
]).then((data) => {
    let [foo, bar, baz] = data
    console.log(`success: foo=${foo} bar=${bar} baz=${baz}`)
}, (err) => {
    console.log(`error: ${err}`);
})

```

## 增强的 math, number, string, array, object APIs
## 二进制和八进制的字面量 binary and octal literals
## reflect api

full reflection API exposing runtime-level meta-operations on objects. useful for implementing proxies

```js
let obj = { a: 1 }
Object.defineProperty(obj, "b", { value: 2 })
obj[Symbol("c")] = 3
Reflect.ownKeys(obj) // [ "a", "b", Symbol(c) ]
```

## tails call

递归算法优化： tail optimize, 调用栈优化（tail-position call are guaranteed to not grow the stack unboundedly.)

```js
function factorial(n, acc=1) {
    if (n <= 1) return acc;
    return factorial(n-1, n*acc);
}
factorial(100000)
```

