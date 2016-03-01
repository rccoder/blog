---
layout: post
title:  "浅谈浏览器端JavaScript跨域解决方法"
date:   2016-03-01 15:26:42 +0800
categories: JavaScript
github_issues: 5
---
由于安全的原因，浏览器做了很多方面的工作，由此也就引入了一系列的跨域问题，需要注意的是：

**跨域并非浏览器限制了发起跨站请求，而是跨站请求可以正常发起，但是返回结果被浏览器拦截了。最好的例子是 `crsf` 跨站攻击原理，请求是发送到了后端服务器无论是否跨域！注意：有些浏览器不允许从HTTPS的域跨域访问HTTP，比如Chrome和Firefox，这些浏览器在请求还未发出的时候就会拦截请求，这是一个特例**

## 1. JSONP

`JSONP`的全称是 "JSON With Padding"， 词面意思上理解就是 "填充式的JSON"。它不是一个新鲜的东西，隶属于 `JSON` 的一种使用方法，或者说是一种使用模式，可以解决一些常见的浏览器端网页跨域问题。

正如他的名称一样，它是指被包含在调用函数中的JSON，比如这样:

``` javascript
callback({"Name": "小明", "Id" : 1823, "Rank": 7})
```

由于 `jQuery` 的一些原因，使得 `JSONP` 常常与 `Ajax` 混淆。实际上，他们没有任何关系。

由于浏览器的同源策略，使得在网页端出现了这个“跨域”的问题，然而我们发现，所有的 `src` 属性并没有受到相关的限制，比如 `img` / `script` 等。

`JSONP` 的原理就要从 `script` 说起。`script` 可以执行其他域的`js` 函数，比如这样：

``` javascript
a.html
...
<script>
  function callback(data) {
    console.log(data.url)
  }
</script>

<script src='b.js'></script>
...


b.js
callback({url: 'http://www.rccoder.net'})
```

显然，上面的代码是可以执行的，并且可以在console里面输出http://www.rccoder.net

利用这一点，假如b.js里面的内容不是固定的，而是根据一些东西自动生成的， 嗯，这就是JSONP的主要原理了。回调函数+数据就是 `JSON With Padding` 了，回调函数用来响应应该在页面中调用的函数，数据则用来传入要执行的回调函数。

至于这个数据是怎么产生的，说粗鲁点无非就是字符串拼接了。

**简单总结一下:** Ajax 是利用 XMLHTTPRequest 来请求数据的，而它是不能请求不同域上的数据的。但是，在页面上引用不同域的 js 文件却是没有任何问题的，这样，利用异步的加载，请求一个 js 文件，而这个文件的内容是动态生成的（后台语言字符串拼接出来的），里面包含的是 JSON With Padding（回调函数+数据），之前写的那个函数就因为新加载进来的这段动态生成的 js 而执行，也就是获取到了他要获取的数据。

重复一下，在一个页面中，a.html这样写，得到 UserId 为 1823 的信息:

``` javascript
a.html

...
src="http://server2.example.com/RetrieveUser?UserId=1823&callback=parseResponse">
...
```

请求这个地址会得到一个可以执行的 JavaScript。比如会得到：

``` javascript
  parseResponse({"Name": "小明", "Id" : 1823, "Rank": 7})
```

这样，a.html里面的 `parseResponse()` 这个函数就能执行并且得到数据了。

**等等，jQuery到底做了什么:**

jQuery 让 JSONP 的使用API和Ajax的一模一样：

``` javascript
$.ajax({
  method: 'jsonp',
  url: 'http://server2.example.com/RetrieveUser?UserId=1823',
  success: function(data) {
    console.log(data)
  } 
})
```

之所以可以这样是因为 jQuery 在背后倾注了心血，它会在执行的时候生成函数替换`callback=dosomthing` ，然后获取到数据之后销毁掉这个函数，起到一个临时的代理器作用，这样就拿到了数据。

**JSONP 的后话**：

JSONP的这种实现方式不受同源策略的影响，兼容性也很好；但是它之支持 GET 方式的清楚，只支持 HTTP 请求这种特殊的情况，对于两个不同域之间两个页面的互相调用也是无能为力。

## 2. CORS

`XMLHttpRequest` 的同源策略看起来是如此的变态，即使是同一个公司的产品，也不可能完全在同一个域上面。还好，网络设计者在设计的时候考略到了这一点，可以在服务器端进行一些定义，允许部分网络访问。

CORS 的全称是 Cross-Origin Resource Sharing，即跨域资源共享。他的原理就是使用自定义的 HTTP 头部，让服务器与浏览器进行沟通，主要是通过设置响应头的 `Access-Control-Allow-Origin` 来达到目的的。这样，XMLHttpRequest 就能跨域了。

值得注意的是，正常情况下的 XMLHttpRequest 是只发送一次请求的，但是跨域问题下很可能是会发送两次的请求（预发送）。

更加详细的内容可以参见：

> https://developer.mozilla.org/en-US/docs/Web/HTTP/Access_control_CORS

**CORS 的后话：**

相比之下，CORS 就支持所有类型的 HTTP 请求了，但是在兼容上面，往往一些老的浏览器并不支持 CORS。

Desktop:

| 浏览器               | 版本                        |
| ----------------- | ------------------------- |
| Chrome            | 4                         |
| Firefox (Gecko)   | 3.5                       |
| Internet Explorer | 8 (via XDomainReques)  10 |
| Opera             | 12                        |
| Safari            | 4                         |

Mobile:

| 设备                     | 版本   |
| ---------------------- | ---- |
| Android                | 2.1  |
| Chrome for Android     | yes  |
| Firefox Mobile (Gecko) | yes  |
| IE Mobile              | ?    |
| Opera Mobile           | 12   |
| Safari Mobile          | 3.2  |

## 3. window.name

window.name 在一个窗口（标签）的生命周期之内是共享的，利用这点就可以传输一些数据。

除此之外，结合 iframe 还能实现更加强大的功能：

需要3个文件： a/proxy/b

``` javascript
a.html

<script type="text/javascript">
    var state = 0, 
    iframe = document.createElement('iframe'),
    loadfn = function() {
        if (state === 1) {
            var data = iframe.contentWindow.name;    // 读取数据
            alert(data);    //弹出'I was there!'
        } else if (state === 0) {
            state = 1;
            iframe.contentWindow.location = "http://a.com/proxy.html";    // 设置的代理文件
        }  
    };
    iframe.src = 'http://b.com/b.html';
    if (iframe.attachEvent) {
        iframe.attachEvent('onload', loadfn);
    } else {
        iframe.onload  = loadfn;
    }
    document.body.appendChild(iframe);
</script>
```

``` javascript
b.html

<script type="text/javascript">
    window.name = 'I was there!';    // 这里是要传输的数据，大小一般为2M，IE和firefox下可以大至32M左右
                                     // 数据格式可以自定义，如json、字符串
</script>
```

proxy 是一个代理文件，空的就可以，需要和 a 在同一域下

## 4. document.domain

在不同的**子域** + iframe交互的时候，获取到另外一个 iframe 的 window对象是没有问题的，但是获取到的这个window的方法和属性大多数都是不能使用的。

这种现象可以借助`document.domain` 来解决。

``` 
example.com

<iframe id='i' src="1.example.com" onload="do()"></iframe>
<script>
  document.domain = 'example.com';
  document.getElementById("i").contentWindow;
</script>
```

``` javascript
1.example.com

<script>
  document.domain = 'example.com';  
</script>
```

这样，就可以解决问题了。值得注意的是：**`document.domain` 的设置是有限制的，只能设置为页面本身或者更高一级的域名。**

**document.domain的后话：**

利用这种方法是极其方便的，但是如果一个网站被攻击之后另外一个网站很可能会引起安全漏洞。

## 5.location.hash

这种方法可以把数据的变化显示在 url 的 hash 里面。但是由于 chrome 和 IE 不允许修改parent.location.hash 的值，所以需要再加一层。

a.html 和 b.html 进行数据交换。

``` html
a.html

function startRequest(){
    var ifr = document.createElement('iframe');
    ifr.style.display = 'none';
    ifr.src = 'http://2.com/b.html#paramdo';
    document.body.appendChild(ifr);
}

function checkHash() {
    try {
        var data = location.hash ? location.hash.substring(1) : '';
        if (console.log) {
            console.log('Now the data is '+data);
        }
    } catch(e) {};
}
setInterval(checkHash, 2000);
```

``` html
b.html

//模拟一个简单的参数处理操作
switch(location.hash){
    case '#paramdo':
        callBack();
        break;
    case '#paramset':
        //do something……
        break;
}

function callBack(){
    try {
        parent.location.hash = 'somedata';
    } catch (e) {
        // ie、chrome的安全机制无法修改parent.location.hash，
        // 所以要利用一个中间域下的代理iframe
        var ifrproxy = document.createElement('iframe');
        ifrproxy.style.display = 'none';
        ifrproxy.src = 'http://3.com/c.html#somedata';    // 注意该文件在"a.com"域下
        document.body.appendChild(ifrproxy);
    }
}
```

``` html
c.html

//因为parent.parent和自身属于同一个域，所以可以改变其location.hash的值
parent.parent.location.hash = self.location.hash.substring(1);
```

这样，利用中间的 c 层就可以用 hash 达到 a 与 b 的交互了。

## 6.window.postMessage()

这个方法是 HTML5 的一个新特性，可以用来向其他所有的window对象发送消息。需要注意的是我们必须要保证所有的脚本执行完才发送MessageEvent，如果在函数执行的过程中调用了他，就会让后面的函数超时无法执行。

> https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage



## 参考资料

http://www.cnblogs.com/rainman/archive/2011/02/20/1959325.html

http://www.cnblogs.com/rainman/archive/2011/02/21/1960044.html

---

## 捐赠

写文不易，赠我一杯咖啡增强一下感情可好？

![alipay](https://cloud.githubusercontent.com/assets/7554325/13387514/4e6c3b42-def2-11e5-849c-90c5f1109fe7.png)
