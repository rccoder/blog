---
layout: post
title:  "JavaScript之闭包相关"
date:   2015-12-30 18:26:42 +0800
categories: JavaScript
github_issues: 3
---

> Like most modern programming languages, JavaScript uses lexical scoping. This means that functions are executed using the variable scope that was in effect when they were defined, not the variable scope that is in effect when they are invoked. In order to implement lexical scoping, the internal state of a JavaScript function object must in- clude not only the code of the function but also a reference to the current scope chain. (Before reading the rest of this section, you may want to review the material on variable scope and the scope chain in §3.10 and §3.10.3.) This combination of a function object and a scope (a set of variable bindings) in which the function’s variables are resolved is called a closure in the computer science literature. (This is an old term that refers to the fact that the function’s variables have bindings in the scope chain and that therefore the function is “closed over” its variables.)
> 
> Technically, all JavaScript functions are closures: they are objects, and they have a scope chain associated with them. Most functions are invoked using the same scope chain that was in effect when the function was defined, and it doesn’t really matter that there is a closure involved. Closures become interesting when they are invoked under a different scope chain than the one that was in effect when they were defined. This happens most commonly when a nested function object is returned from the function within which it was defined. There are a number of powerful programming techniques that involve this kind of nested function closures, and their use has become relatively common in JavaScript programming. Closures may seem confusing when you first en- counter them, but it is important that you understand them well enough to use them comfortably.
> 
> *JavaScript, The Definite Guide*

翻译成中文的话也许是这样：

和大多数的现代化编程语言一样，`JavaScript`是采用词法作用域的，这就意味着函数的执行依赖于函数定义的时候所产生（而不是函数调用的时候产生的）的变量作用域。为了去实现这种词法作用域，`JavaScript`函数对象的内部状态不仅包含函数逻辑的代码，除此之外还包含当前作用域链的引用。函数对象可以通过这个作用域链相互关联起来，如此，函数体内部的变量都可以保存在函数的作用域内，这在计算机的文献中被称之为闭包。

从技术的角度去将，所有的`JavaScript`函数都是闭包：他们都是对象，他们都有一个关联到他们的作用域链。绝大多数函数在调用的时候使用的作用域链和他们在定义的时候的作用域链是相同的，但是这并不影响闭包。当调用函数的时候闭包所指向的作用域链和定义函数时的作用域链不是同一个作用域链的时候，闭包become interesting。这种interesting的事情往往发生在这样的情况下： 当一个函数嵌套了另外的一个函数，外部的函数将内部嵌套的这个函数作为对象返回。一大批强大的编程技术都利用了这类嵌套的函数闭包，当然，`javascript`也是这样。可能你第一次碰见闭包觉得比较难以理解，但是去明白闭包然后去非常自如的使用它是非常重要的。

通俗点说，在程序语言范畴内的闭包是指函数把其的变量作用域也包含在这个函数的作用域内，形成一个所谓的“闭包”，这样的话外部的函数就无法去访问内部变量。所以按照第二段所说的，严格意义上所有的函数都是闭包。

需要注意的是：我们常常所说的闭包指的是让外部函数访问到内部的变量，也就是说，按照一般的做法，是使内部函数返回一个函数，然后操作其中的变量。这样做的话一是可以读取函数内部的变量，二是可以让这些变量的值始终保存在内存中。

`JavaScript`利用闭包的这个特性，就意味着当前的作用域总是能够访问外部作用域中的变量。

``` javascript
function counter (start) {
  var count = start;
  return {
    add: function () {
      count ++;
    },
    get: function () {
      return count;
    },
  };
}

var foo = counter (4);

foo.add();  
foo.get()   //5
```

上面的代码中，`counter`函数返回的是两个闭包（两个内部嵌套的函数），这两个函数维持着对他们外部的作用域`counter`的引用，因此这两个函数没有理由不可以访问`count` ;

在`JavaScript`中没有办法在外部访问`count`（`JavaScript`不可以强行对作用域进行引用或者赋值），唯一可以使用的途径就是以这种闭包的形式去访问。

对于闭包的使用，最长见的可能是下面的这个例子：

``` javascript
for (var i = 0; i < 10; i++) {
  setTimeout (function (i) {
    console.log (i);    //10 10 10 ....
  }, 1000);
}
```

--在上面的例子中，当`console.log`被调用的时候，匿名函数保持对外部变量的引用，这个时候`for` 循环早就已经运行结束，输出的`i`值也就一直是`10`。但这在一般的意义上并不是我们想要的结果。--

setTimeout　中的 i　都共享的是这个函数中的作用域, 也就是说，他们是共享的。这样的话下一次循环就使得　i　值进行变化，这样共享的这个 i 就会发生变化。这就使得输出的结果一直是　10

为了获得我们想要的结果，我们一般是这样做：

``` javascript
for (var i = 0; i < 10; i++) {
  (function (e) {
    setTimeout (function () {
      console.log (e);
    }, 1000);
  })(i);
}
```

外部套着的这个函数不会像`setTimeout`一样延迟，而是直接立即执行，并且把`i`作为他的参数，这个时候`e`就是对`i`的一个拷贝。当时间达到后，传给`setTimeout`的时候，传递的是`e`的引用。这个值是不会被循环所改变的。

除了上面的写法之外，这样的写法显然也是没有任何问题的：

``` javascript
for (var i = 0; i < 10; i++) {
  setTimeout((function(e) {
    return function() {
      console.log (e);
    }
  })(i), 1000);
}
```

或许，还可以借助这个故事理解一下：

> I'm a big fan of analogy and metaphor when explaining difficult concepts, so let me try my hand with a story.
> 
> **Once upon a time:**
> 
> There was a princess...
> 
> ``` 
> function princess() {
> ```
> 
> She lived in a wonderful world full of adventures. She met her Prince Charming, rode around her world on a unicorn, battled dragons, encountered talking animals, and many other fantastical things.
> 
> ``` 
>     var adventures = [];
> 
>     function princeCharming() { /* ... */ }
> 
>     var unicorn = { /* ... */ },
>         dragons = [ /* ... */ ],
>         squirrel = "Hello!";
> ```
> 
> But she would always have to return back to her dull world of chores and grown-ups.
> 
> ``` 
>     return {
> ```
> 
> And she would often tell them of her latest amazing adventure as a princess.
> 
> ``` 
>         story: function() {
>             return adventures[adventures.length - 1];
>         }
>     };
> }
> ```
> 
> But all they would see is a little girl...
> 
> ``` 
> var littleGirl = princess();
> ```
> 
> ...telling stories about magic and fantasy.
> 
> ``` 
> littleGirl.story();
> ```
> 
> And even though the grown-ups knew of real princesses, they would never believe in the unicorns or dragons because they could never see them. The grown-ups said that they only existed inside the little girl's imagination.
> 
> But we know the real truth; that the little girl with the princess inside...
> 
> ...is really a princess with a little girl inside.
> 
> *http://stackoverflow.com/a/6472397/4681656*
