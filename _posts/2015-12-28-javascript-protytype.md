---
layout: post
title:  "JavaScript 之原型周边"
date:   2015-12-28 18:26:42 +0800
categories: JavaScript
github_issues: 5
---

## 简介

如果之间学习过`cpp`  、`java` 之类的语言，都会知道他们是可以基于类 `class` 进行继承的， 在`JavaScript` 中，并没有类继承这个概念，要实现`JavaScript` 中的继承，需要原型来帮助。

比如在下面的这段代码中：

``` javascript

function Foo () {

  this.value = 1;

};

Foo.prototype = {

  method: function () {};

};

//设置Bar的原型为Foo()的实例

Bar.prototype = new Foo();

Bar.prototype.foo = 'Hello World';

//修正Bar的constructor

Bar.prototype.constructor = Bar;

//创建一个Bar的实例

var test = new Bar();

```

在这段代码中，就一直维护着一个原型链，抽象化的理解起来可能是这样的：

``` 
test [Bar的实例]
     Bar.prototype [Foo的实例]
        {foo: 'Hello World!'}
        Foo.prototype
            {method: function(){}}
            Object.prototype
                {...}
```

很好去理解，test 是从`Bar.prototype` 和 `Foo.prototype` 中继承下来的，所以他能够访问`Foo` 实例属性中的`value` 。

需要注意的是，在 `new Bar` 操作中，并不会重新创建一个`Foo` 的实例，而是会重复的使用在他的原型上的那个实例。

除此之外，原型是共享的，如果我们有`Foo.prototype = Bar.prototype` 的写法，改变这两个对象任何一个的原型都会影响另外一个，这在大多的情况下是不可取的。

当对象查找一个属性的时候，他会沿着原型链一直往上追踪，直到直到为之。当然 `Object.prototypr` 就是这个链的最后一层了，如果还是没找到，就会返回`undefined` 。

## hasOwnProperty

在性能方面，原则上应该尽量避免原型链太长。正如用`for ... in ...` 去遍历的时候，他会去遍历整个原型链，这往往在比较高的性能要求或者普通的遍历中是不可取的。

为了去判断一个对象包含的属性是他本身就有的还是在原型链上的，需要使用继承在`Object prototype` 上的`hasOwnProperty` 方法。

比如在下面的例子中

``` javascript
Oboject.prototype.bar = 1;

var foo = {
  value: 2；
};

foo.var          //通过原型链继承自Object，输出1
'bar' in foo;    //通过整个原型链进行查找，输出true

foo.hasOwnProperty('bar');    //false
foo.hasOwnProperty('value')   //true
```

在`for ... in ...` 的遍历中，一般建议使用`hasOwnProperty` 的方法。 

需要注意的是： `javascript`并没有对`hasOwnProperty` 做相关的保护，如果恰巧对象有这个叫做`hasOwnProperty` 的属性，那么产生的结果应该不是我们所期待的。比如像下面这样：

``` javascript
var foo = {
  hasOwnProperty: function () { return flase};
  bar: '1';
};

foo.hasOwnProperty('bar') //正如你猜的那样，返回的值永远是false
```

这时候可能需要做的就是调用外部的`hasOwnproperty`， 对，就是用`call` 或者`apply`。像下面这样：

``` javascript
//返回true
Object.hasOwnProperty.call(foo, 'bar');
Object.hasOwnProperty.apply(foo, ['bar']);
```