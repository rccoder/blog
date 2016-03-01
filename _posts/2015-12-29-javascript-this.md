---
layout: post
title:  "JavaScript 之 this 指向问题"
date:   2015-12-29 18:26:42 +0800
categories: JavaScript
github_issues: 2
---

## 1. 一等公民对象——函数

在提this指向问题之前，肯定是有必要说明一等公民对象`function` ，既然`function`是对象，那么就能像普通的值一样传递。嗯，在匿名函数中，这样的做法是非常常见的。

函数会在代码的运行前进行解析，这就保证了函数存在于当前上下文的任意一个地方，即在函数定义的前面去调用也是正确的。

``` javascript
foo();

function foo () {};
```

函数是一个对象，所以我们常常会看见把一个匿名的函数给一个值。

``` javascript
var foo = function () {
  
};
```

赋值语句只有在执行的时候才会运行，也就是说所看到的`var foo = 1` 是分为两部分的：

``` javascript
var foo;
...
foo = 1;
...
```

所以可能会出现下面的问题

``` javascript
foo;     //undefined
foo();   //TypeError
var foo = function () {
  console.log(1);
}
```

因为他和下面的写法是一样的

``` javascript
var foo;

foo;

foo();

foo = function () {
  console.log(1);
}
```

正常的，我们这样写是没有问题的

``` javascript
foo;   // undefined 

var foo = function () {
  console.log(1);
}

foo(); // 1
```

## 2. this指向问题

`this`　是和执行上下问环境息息相关的。他是上下文环境的一个属性，而不是某个变量对象的属性。

这个特点很重要,因为和变量不同,this是没有一个类似搜寻变量的过程。当你在代码中使用了this,这个

this的值就直接从执行的上下文中获取了,而不会从作用域链中搜寻。this的值只取决中进入上下文时的情

况。

这样，`javascript`中的`this`和一般语言中的`this`是有点区别的，在不同的情况下，指向也有所不同：

1. 全局范围内
   
   指向的是全局对象。在普通浏览器中指向的是`window`, 在Node中指向的是全局对象`global`（全局环境中） 或者`module.exports`(模块环境中)。
   
2. 函数调用中
   
   在普通的函数调用中，this依旧指向全局对象。（这个设计似乎并没有什么作用，应该是一个错误的设计。并且在很多的情况下不注意都会引来很多的麻烦）
   
   ``` javascript
   Foo.method = function () {
     function test () {
      //这里的this指向的不是Foo.而是全局对象
     }    
   }
   ```
   
   一般我们会创建一个局部的变量去指代上一层的对象
   
   ``` javascript
   Foo.method = function () {
     that = this;   //按照下面一条规则，这儿的this指向的是Foo
     function (test) {
       // that
     }
   }
   ```
   
3. 方法调用中
   
   指向调用它的对象
   
4. 调用构造函数
   
   指向新创建的对象
   
5. 显式设置`this`
   
   指向显式指向的对象。即指向`call`或者`apply`的第一个参数。

**注意：**

像下面这样对方法进行赋值的时候，函数内`this`的指向也不是赋值时所调用方法的对象。

``` javascript
var test = Obj.method();

test(); // 第二条规则，this指向的不是Obj
```
