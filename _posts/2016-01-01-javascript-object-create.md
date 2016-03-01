---
layout: post
title:  "JavaScript之对象创建"
date:   2016-01-01 18:26:42 +0800
categories: JavaScript
github_issues: 4
---

## 1.构造函数模式

`JavaScript`中的构造函数是通过`new`调用的，也就是说，通过`new`关键字调用的函数都被认为是构造函数。

在构造函数的内部，`this`的指向是新创建的对象`Object`。

如果构造函数没有显式的`return`表达式，则会隐式的返回新创建的对象——`this`对象。

``` javascript
function Foo () {
  this.name = 'rccoder';
}

Foo.prototype.test = function () {
  console.log (this.name);
}

var bar = new Foo();

bar.name;    // rccoder
bar.test();  // rccoder
```

在构造函数中，显式的`return`会影响返回的值，但是仅限于返回的是 **一个对象**。**当返回值不是一个对象的时候，实际上会返回一个新创建的对象；当返回值就是一个对象的时候，返回的不是新创建的对象，而是本身就要返回的那个对象**

``` javascript
function Foo () {
  return 2;
}

new Foo();    // Foo {} 返回的不是2,而是新创建了一个对象

function Bar () {
  this.name = 'rccoder';
  return {
    foo: 1
  }
}

new Bar();   // Object {foo: 1}  返回要返回的那个对象
(new Bar()).name  // undefined
(new Bar()).foo   // 1
```

构造函数模式主要有以下几个特点：

1. 没有显式的返回对象
2. 直接将属性和方法赋值给`this`对象
3. 没有`return`语句

> 通过`new`关键字调用的函数都被认为是构造函数。

`new`之后产生的是一个新的对象，可以在`new`的时候传递参数，并且把这个参数的值赋值给`this`  指针，这样，传递进去的内容，就变成了新产生的对象的属性或者方法。

为了让代码看起来更加的“优雅”，构造函数的首字母都是大写。

除此之外，用构造函数产生的实例中，他的原型都会默认的包含一个`constructor`属性，会指向构造函数。这样就能够知道这个对象是从哪儿创建的，也就是说能够区分这个对象的类型了（下面的工厂模式就无法区分对象的类型）。

``` javascript
function Foo () {
  this.value = 1;
}

test = new Foo ();

test.constructor  == Foo ();
```



当然，构造函数也是可以直接执行的，而不是一定要`new`，直接执行的化“构造函数”中的`this`指向的就不再是新产生的对象了（实际上这种情况下就和普通的函数一样，并不会产生新的对象），往往在浏览器中是`window`.

构造函数在每次`new`的时候产生的实例都是重新创建的，因此不同实例上的同名函数是不相等的。

``` javascript
function Foo () {
  this.test = function () {

  };
}

var a = new Foo();
var b = new Foo();

a.test === b.test    // false
```

所以说，构造函数每次`new`都是产生一个新的实例，并且这个实例的属性和方法是独享的。这样往往造成了一些浪费（属性是独有的可以理解，但是就方法而言，大多数往往是一样的，这和我们想要的可能有点差别）。

## 2.工厂模式

为了不去使用`new`关键字，上面提到的构造函数必须显式的返回。当前这个时候就可以理解为不是构造函数了。

``` javascript
function Foo () {
  var value = 1;

  return {
    method: function () {
      return value;
    }
  };

};

Foo.prototype = {
  foo: function () {

  }
};

new Foo();
Foo();
```

上面加不加`new`的返回结果是完全一样的，都是一个新创建的，拥有`method`属性的对象。嗯。如果对闭包有所理解的话，他返回的就是一个闭包！

需要注意的是，上面返回的是一个包含`method`属性的自定义对象，所以他并不返回`Foo.prototype`.

``` javascript
(new Foo()).foo    // undefined
(Foo()).foo        // undefined
```

按照正常人的思路，一般选择用`new`来调用函数总是显得很奇怪，这也估计就是大多人说不要使用`new`关键字来调用函数的原因了，因为如果忘记`new`就会产生难以察觉的错误。

 嗯，是时候引出**工厂模式**了：

``` javascript
function Foo () {
  var obj = {};
  obj.value = 'rccoder';

  var privateValue = 2;

  obj.method = function (value) {
    this.value = value;
  };

  obj.getPrivate = function () {
    return privateValue;
  };

  return obj;
}
```

就像上面的代码一样，有个工厂，就这样生产出了一个个的工人。工厂模式解决了多个比较相似的对象重复创建的问题。但是这个创建只单纯的一个创建，但并不知道这个对象是从哪里创建的，也就是说无法去区分这个对象的类型。

当然还有一些其他的缺点，比如由于新创建的对象只是简单的创建，所以不能共享原型上的方法，如果要实现所谓的继承，就要从另外的一个对象去拷贝所有的属性...嗯，他放弃了原型，为了去防止`new`带来的问题。

## 3.原型模式

在构造函数模式中提到每次`new`之后创建的新的对象是互相独立的，是独享的。

> 构造函数每次`new`都是产生一个新的实例，并且这个实例的属性和方法是独享的。这样往往造成了一些浪费（属性是独有的可以理解，但是就方法而言，大多数往往是一样的，这和我们想要的可能有点差别）

就最后一句而言，我们或许可以这样写：

``` javascript
function Foo (value) {
  this.value = value;
  this.method = method;
}

function method () {
  console.log (this.value);
}
```

这样把方法去放在外面，在构造函数里面去调用这个函数，好像就`hack`的解决了上面的问题。但是这个函数好像就是全局函数了，并且和`Foo()`看上去并不怎么愉快的是一家人，谈封装也就有些牵强。

这种去共享方法的问题用`prototype`看似就可以解决，毕竟他产生的属性和方法是所有产生的实例所共享的。

``` javascript
function Foo () {
  ...
};

Foo.prototype.value = 'rccoder';
Foo.prototype.method = function () {
  console.log (this.value);
};

var test = new Foo ();
test.method();    // rccoder
```

这样看起来好像是可行的，当需要找某个对象的属性的时候，往往直接看有没有这个属性，没有的话再按照原型链向上寻找，而不是去寻找构造函数。

原型是动态的，所以不要随便的去修改原型。这个修改后会立即影响实例的结果。

> 如果我们有`Foo.prototype = Bar.prototype` 的写法，改变这两个对象任何一个的原型都会影响另外一个，这在大多的情况下是不可取的。

一般情况下不建议对原型做修改，因为很可能由于代码量太多导致维护太困难。

另外，还记得用原型模式的初衷吗？是要公用方法，而不是公用属性。纯粹的用原型会同样的公用属性，这在很多情况下看起来是很郁闷的。所以可能需要我们把原型和构造函数结合起来使用。

## 4.优雅混合使用构造函数与原型

这或许是比较理想话的使用方法了，用构造函数来区分独享的属性，用原型来共享大家都用的方法。

``` javascript
function Foo (value1, value2) {
  this.value1 = value1;
  this.value2 = value2;
}

Foo.prototype.method = function () {
  console.log (this.value1)
};

test1 = new Foo (2, 3);
test1.method();  // 2

test2 = new Foo (4, 5);
test2.method()   // 4
```

哦，对了，你可能会看见这样写上面的代码

``` javascript
function Foo (value1, value2) {
  this.value1 = value1;
  this.value2 = value2;
}

Foo.prototype = {
  constructor: Foo,
  method: function () {
    console.log (this.value1);
  }
}

test = new Foo (2, 3);
test.method();
```

别怕，这只是覆盖了`Foo`的原型而已，是真的覆盖到连`constructor`是谁都不认识了，所以需要手动的是想一下，指向谁呢？正常人的话指向的应该是构造函数吧。



> 参考资料：
> 
> 1. JavaScript密码花园
> 2. [JavaScript 原型理解与创建对象应用-于江水的博客](http://yujiangshui.com/javascript-prototype-and-create-object/)



原文链接：http://life.rccoder.net/javascript/1216.html