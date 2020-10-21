# WebGL基础介绍

谈起WebGL可能有一些人比较陌生，实际上WebGL是一种3D绘图标准，这种绘图技术标准允许把JavaScript和OpenGL ES 2.0结合在一起，通过增加OpenGL ES 2.0的一个JavaScript绑定，WebGL可以为HTML5 Canvas提供硬件3D加速渲染，这样Web开发人员就可以借助系统显卡来在浏览器里更流畅地展示3D场景和模型了，还能创建复杂的导航和数据视觉化。显然，WebGL技术标准免去了开发网页专用渲染插件的麻烦，可被用于创建具有复杂3D结构的网站页面，甚至可以用来设计3D网页游戏等等。

>此链接可以查看你的游览器是否支持WebGL以及支持的版本。
[检测浏览器是否支持WebGL](https://link.jianshu.com/?t=http%3A%2F%2Fwebglreport.com)

看WebGL的背景实际上是JavaScript操作一些OpenGL接口，也就意味着，可能会编写一部分GLSL ES 2.0的代码，没错，你猜对了，WebGL只是绑定了一层，内部的一些核心内容，如着色器，材质，灯光等都是需要借助GLSL ES语法来操作的.

基于WebGL周边也衍生了众多的第三方库，如开发应用类的Three.js，开发游戏类的Egert.js等，都大大的降低了学习WebGL的成本，但是本着有问题解决问题，没问题制造问题在解决问题的程序猿态度，还是觉得应该稍微了解一下WebGL一些基本的概念，以便能更好的去理解不同框架带来的便捷以及优势。一些简单的效果其实无需多引入一个体积可观的三方库来实现。如下图的效果：

![avatar](https://upload-images.jianshu.io/upload_images/11557323-b47ab98806fa588e.gif?imageMogr2/auto-orient/strip|imageView2/2/w/1022/format/webp)

波浪预览
接下来先简单介绍一下使用到的知识要点。

## 创建webGL对象
不同浏览器生命WebGL对象方式有所区别，虽然大部分浏览器都支持experimental-webgl，而且以后会变成webgl，所以创建时做一下兼容处理
```js
var canvas = document.getElementById("glcanvas");
gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
```
## 着色器
WebGL依赖一种新的称为着色器（shader）的绘图机制。着色器提供了灵活且强大的绘制二维或三维图形的方法，所有WebGL必须使用它。着色器不仅强大，而且更复杂，仅仅通过一条简单的绘图指令是不能操作它的。

WebGL需要两种着色器

- 顶点着色器（Vertex shader）：顶点着色器是用来描述顶点特性（如位置、颜色等）的程序。**顶点(Vertex)**是指二维或三维空间的一个点，比如二维或三维空间线与线之间的交叉点或者端点。
- 片元着色器（Fragment shader）：进行逐片元处理过程（如光照等）的程序。**片元(fragment)**是一个WebGL的术语，你可以将其理解成像素。
> 着色器语言使用的是GLSL ES语言，所以在javascript需要将之存放在字符串中，等待调用编译

创建顶点着色器：
```js
var VSHADER_SOURCE =
'void main() {\n' +
' gl_Position = vec4(0.0, 0.0, 0.0, 1.0);\n' +
' gl_PointSize = 10.0;\n' +
'}\n';
```
创建片元着色器：
```js
var FSHADER_SOURCE =
'void main() {\n' +
' gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);\n' +
'}\n';
```
浏览器的整个过程如下：
![avatar](https://upload-images.jianshu.io/upload_images/11557323-14a7159aba1f661d.jpg?imageMogr2/auto-orient/strip|imageView2/2/w/600/format/webp)

WebGL渲染过程

着色器中包含几个内置变量：gl_Position, gl_PointSize, gl_FragColor。

> 着色器语言中涉及到vec4的数据类型，此数据类型是一个思维浮点数组，所以其值不可以是整形如(1,1,1,1)，正确应为：(1.0,1.0,1.0,1.0)

- gl_Position: 为一种vec4类型的变量，且必须被赋值。四维坐标矢量，我们称之为齐次坐标，即(x,y,z,w)等价于三维左边(x/w,y/w,z/w)，w相当于深度，没有特殊要求设置为1.0即可。

- gl_PointSize：表示顶点的尺寸，也是浮点数，为非必填项，如果不填则默认显示为1.0。

- gl_FragColor：该变量为片元着色器唯一的内置变量，表示其颜色，也是一个vec4类型变量，分别代表（R,G,B,A），不过颜色范围是从0.0-1.0对应Javascript中的#00-#FF。

有了着色器我们就可以着手去绘制图像了，既然绘制3D图形，必然会有对应的三维坐标系，WebGL采用右手坐标系，如图所示：

![avatar](https://upload-images.jianshu.io/upload_images/11557323-3e34d99a84f6aa21.jpg?imageMogr2/auto-orient/strip|imageView2/2/w/351/format/webp)

坐标系
## 使用着色器
让我们来看看如何把着色器代码编译并且使用起来
着色器代码需要载入到一个程序中，webgl使用此程序才能调用着色器。
```js
var program = gl.createProgram();
// 创建顶点着色器
var vShader = gl.createShader(gl.VERTEX_SHADER);
//创建片元着色器
var fShader = gl.createShader(gl.FRAGMENT_SHADER);
//shader容器与着色器绑定
gl.shaderSource(vShader, VSHADER_SOURCE);
gl.shaderSource(fShader, FSHADER_SOURCE);
//将GLSE语言编译成浏览器可用代码
gl.compileShader(vShader);
gl.compileShader(fShader);
//将着色器添加到程序上
gl.attachShader(program, vShader);
gl.attachShader(program, fShader);
//链接程序，在链接操作执行以后，可以任意修改shader的源代码，
//对shader重新编译不会影响整个程序，除非重新链接程序
gl.linkProgram(program);
//加载并使用链接好的程序
gl.useProgram(program);
```
让我们尝试绘制一个点
```js
gl.clearColor(0.0,0.0,0.0,1.0);
gl.clear(gl.COLOR_BUFFER_BIT);
gl.drawArrays(gl.POINTS, 0 ,1);
```
我们来看一看最终结果,果然出来了一个点

![avatar](https://upload-images.jianshu.io/upload_images/11557323-500c88b57a0f69e9.jpg?imageMogr2/auto-orient/strip|imageView2/2/w/634/format/webp)

绘制单点的结果
程序创建完之后，我们需要需要对着色器进行动态控制才能达到我们所需要的功能。

首先让我来介绍2个变量，我们需要借助这2个变量搭建的桥梁才能使JavaScript与GLSL ES之间进行沟通。

- attribute： 用于顶点点着色器（Vertex Shader）传值时使用。
- uniform：可用于顶点着色器（Vertex Shader）与片元着色器（Fragment Shader）使用。
## 将顶点动态化
先在顶点着色器代码中，将对应的vec4的固定值变成变量
```js
var VSHADER_SOURCE =
'attribute vec4 a_Position;\n' +
'void main() {\n' +
' gl_Position = a_Position;\n' +
' gl_PointSize = 10.0;\n' +
'}\n';
```
位置参数使用了attribute变量来承载。这样WebGL对象就可以获取到对应的存储位置，就可以去动态改变GLSL变量了。

使用WebGL来获取对应参数的存储地址地址
```js
//返回对应的地址信息
var aPosition = gl.getAttribLocation(gl.program, 'a_Position');
//判断地址是否获取成功
if(aPosition < 0) {
console.log('没有获取到对应position');
}
```
然后给变量赋值
```js
gl.vertexAttrib3f(aPosition, 1.0, 1.0, 0.0);
//或者使用Float32Array来传参
var p = new Float32Array([1.0, 1.0, 1.0]);
gl.vertexAttrib3fv(aPosition, p);
```
>注意：vertexAttrib3fv这个函数是典型的GLSL语法命名规范，
vertexAttrib函数功能，
- 3：对应需要传3个参数，或者是几维向量，
- f：表示参数是float类型，
- v：表示传如的为一个vector变量。
也就是说对应设置顶点着色器的函数有一下几种功能，[参考文档](https://link.jianshu.com/?t=%2F%2Fdeveloper.mozilla.org%2Fen-US%2Fdocs%2FWeb%2FAPI%2FWebGLRenderingContext%2FvertexAttrib)：
```js
void gl.vertexAttrib1f(index, v0);
void gl.vertexAttrib2f(index, v0, v1);
void gl.vertexAttrib3f(index, v0, v1, v2);
void gl.vertexAttrib4f(index, v0, v1, v2, v3);
void gl.vertexAttrib1fv(index, value);
void gl.vertexAttrib2fv(index, value);
void gl.vertexAttrib3fv(index, value);
void gl.vertexAttrib4fv(index, value);
```
同样操作可以如下修改PointSize：
```js
//着色器中添加变量
var VSHADER_SOURCE =
'attribute vec4 a_Position;\n' +
'attribute float a_PointSize;\n' +
'void main() {\n' +
' gl_Position = a_Position;\n' +
' gl_PointSize = a_PointSize;\n' +
'}\n';
var aPointSize = gl.getAttribLocation(gl.program, 'a_PointSize');
gl.vertexAttrib1f(aPointSize, 10.0);
```
## 片元着色器编程
对片元着色器变成需要使用uniform变量来承载。
```js
var FSHADER_SOURCE =
'precision mediump float;\n'+
'uniform vec4 vColor;\n'+
'void main() {\n' +
' gl_FragColor = vColor;\n' + // Set the point color
'}\n';
```
获取片元着色器变量地址
```js
var vColor = gl.getUniformLocation(gl.program, 'vColor');
```
给变量赋值
```js
gl.uniform4f(vColor, 1.0, 0.0, 0.0, 1.0);
//或使用Float32Array来传参
var color = new Float32Array([1.0, 0.0, 0.0, 1.0]);
gl.uniform4fv(vColor,color)
```
> 注意：uniform3fv这个函数是典型的GLSL语法命名规范，
uniform3fv函数功能，
- 3：对应需要传3个参数，或者是几维向量，
- f：表示参数是float类型，
- u：表示参数是Uint32Array类型，
- i：表示参数是integer类型，
- ui：表示参数是unsigned integer类型，
- v：表示传如的为一个vector变量。

顶点着色器对应函数，[参考文档](https://link.jianshu.com/?t=%2F%2Fdeveloper.mozilla.org%2Fen-US%2Fdocs%2FWeb%2FAPI%2FWebGL2RenderingContext%2Funiform)
```js
void gl.uniform1ui(location, v0);
void gl.uniform2ui(location, v0, v1);
void gl.uniform3ui(location, v0, v1, v2);
void gl.uniform4ui(location, v0, v1, v2, v3);
void gl.uniform1fv(location, data, optional srcOffset, optional srcLength);
void gl.uniform2fv(location, data, optional srcOffset, optional srcLength);
void gl.uniform3fv(location, data, optional srcOffset, optional srcLength);
void gl.uniform4fv(location, data, optional srcOffset, optional srcLength);
void gl.uniform1iv(location, data, optional srcOffset, optional srcLength);
void gl.uniform2iv(location, data, optional srcOffset, optional srcLength);
void gl.uniform3iv(location, data, optional srcOffset, optional srcLength);
void gl.uniform4iv(location, data, optional srcOffset, optional srcLength);
void gl.uniform1uiv(location, data, optional srcOffset, optional srcLength);
void gl.uniform2uiv(location, data, optional srcOffset, optional srcLength);
void gl.uniform3uiv(location, data, optional srcOffset, optional srcLength);
void gl.uniform4uiv(location, data, optional srcOffset, optional srcLength);
```
着色器中的代码precision mediump float;表示的意思是着色器中配置的float对象会占用中等尺寸内存。
具体包含的尺寸：

- highp for vertex positions,
- mediump for texture coordinates,
- lowp for colors.
- 
如果不设置此参数会报错：

![avatar](https://upload-images.jianshu.io/upload_images/11557323-12603319d5d444e3.jpg?imageMogr2/auto-orient/strip|imageView2/2/w/572/format/webp)

我们可以绘制自定义的点了，接下来我们就可以尝试绘制大批量点来达到波浪的基础效果，但是之前的操作都是针对一个点的，如何可以同时绘制多个订点呢，如果你的回答是循环数据，BINGGO，没错这样你的确是可以达到这个目的，但是不是我们接下来要讲的，因为在3D绘制的时候是会经常出现大批量点、线、面的绘制的，所以WebGL提供了一种承载机制来达到传递多点的能力，说了这么多，也让我们来看看它到底是什么吧

## 缓存区对象
之前的方式可以通过循环来绘制多个点，一次需要绘制多个点，需要同时传递进去多个点的数据。刚好，在WebGL中提供了一种机制：缓存区对象（buffer data）,缓存区对象可以同时向着色器传递多个顶点坐标。缓存区是WebGL中的一块内存区域，我们可以向里面存放大量顶点坐标数据，可随时供着色器使用。

### 使用缓存区步骤
- 创建缓存区对象(gl.createBuffer())
- 绑定缓存区对象(gl.bindBuffer())
- 将数据写入缓存区对象(gl.bufferData())
- 将缓存区对象分配给一个attribute变量(gl.vertexAttribPointer())
- 开启attribute变量(gl.enableVertexAttribArray())

首先，我们仍然需要创建WebGL对象、片元着色器以及顶点着色器，具体创建的步骤以及原理，可参考之前的教程。具体代码实现如下：
当创建好WebGL之后，可以通过着色器中的attrbute或者uniform对象来传递需要动态修改或设置的的变量。
接下来我们需要进行缓冲区的操作：
首先，需要创建一个缓冲区来承载大量顶点的坐标
```js
//创建缓存区
var vertexBuffer = gl.createBuffer();
if(!vertexBuffer) {
log('创建缓存区失败。');
return -1;
}
//将创建的缓存区对象绑定到target表示的目标上
gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
//开辟存储空间，向绑定在target上的缓存区对象中写入数据
gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
//获取着色器中的变量值
var a_position = gl.getAttribLocation(gl.program, 'a_p');
//将缓存区对象绑定到着色器变量中
gl.vertexAttribPointer(a_position, 3, gl.FLOAT, false, 0, 0);
// 启用缓存区
gl.enableVertexAttribArray(a_position);
// 绘制缓存区中画的多个顶点
gl.drawArrays(gl.POINTS, 0 , array);
```
看完了绘制过程，让我们来拆解一下具体内容：

首先，我们要在茫茫内存中申请一个区域来放置缓存区对象的内容，但是我们无法直接放置缓存对象进入内存中，否则会无法识别对应的数据类型，从而无法达到存取自如的境界，那我们就需要将数据的类型告知内存，bingBuffer就是为解决此问题诞生的，函数会在内存中申请一部分区域，并且通过target来制定数据类型，也就是说，缓存区是需要放置在target表示的类型部分去存储。

### [gl.bindBuffer(target, buffer)](https://link.jianshu.com/?t=%2F%2Fdeveloper.mozilla.org%2Fen-US%2Fdocs%2FWeb%2FAPI%2FWebGLRenderingContext%2FbindBuffer)
**target: 指定存储缓存区的目标类型**

- gl.ARRAY_BUFFER : 指缓存区中包含了顶点的数据
- gl.ELEMENT_ARRAY_BUFFER : 指缓存区中包含了顶点数据的索引值
**buffer: 自己创建的缓存区对象**

接下来，我们需要做的是填充刚刚申请的缓存区，我们需要使用一个符合GLSL语法的数据格式，Javascript中可用Float32Array类型来创建支持GLSL的数据。使用bufferData函数将数据放入缓存区内。

### [gl.bufferData(target, size, usage)](https://link.jianshu.com/?t=https%3A%2F%2Fdeveloper.mozilla.org%2Fen-US%2Fdocs%2FWeb%2FAPI%2FWebGLRenderingContext%2FbufferData)
**target: 同上**
**size: 为多个顶点坐标的集合数组**
**usage: 表示程序将如何使用缓存区中的数据**

- gl.STATIC_DRAW : 只会向缓存区对象中写入一次数据，但需要绘制很多次
- gl.STREAM_DRAW : 只会向缓存区对象中写入一次数据，然后绘制若干次
- gl.DYNAMIC_DRAW : 会想缓存区对象中多次写入数据，并绘制很多次
  
缓存区中已经存储了多个顶点坐标，接下来我们需要将此数据运用到对应的着色器上，才能真正的绘制出来可视化图像，如何传递呢？首先我们需要在着色器中建立一个attribute类型的变量以方便我们操作，着色器中的对象，着色器中存在对象之后，我们可以使用Javascript中getAttribLocation函数获取着色器中的attribute类型变量，并且通过vertexAttribPointer将其赋值改变，从而达到改变图像呈现。

### [gl.getAttribLocation(program,name)](https://link.jianshu.com/?t=%2F%2Fdeveloper.mozilla.org%2Fen-US%2Fdocs%2FWeb%2FAPI%2FWebGLRenderingContext%2FgetAttribLocation)
**param: webgl之前创建的进程**
**name: 变量名称**

### [gl.vertexAttribPointer(name, size, type, normalized, stride, offset)](https://link.jianshu.com/?t=%2F%2Fdeveloper.mozilla.org%2Fen-US%2Fdocs%2FWeb%2FAPI%2FWebGLRenderingContext%2FvertexAttribPointer)
**name: 指定要赋值的attribute变量位置**
**size: 指定每个顶点数据的分量个数（1或4）**
**type: 指定传入的数据格式**

- gl.BYTE: 字节型, 取值范围[-128, 127]
- gl.SHORT: 短整型,取值范围[-32768, 32767]
- gl.UNSIGNED_BYTE: 无符号字节型,取值范围[0, 255]
- gl.UNSIGNED_SHORT: 无符号短整型, 取值范围[0, 65535]
- gl.FLOAT: 浮点型
- normalized: 表明是否将非浮点数的数据归入到[0, 1]或[-1, 1]区间
- stride: 指定相邻2个顶点间的字节数，默认为0
- offset: 指定缓存区对象中的偏移量，设置为0即可
```js
如为2，则
new Float32Array([
    1.0, 1.0,
    1.0,1.0
])
代表2个顶点
如为4，则
new Float32Array([
    1.0, 1.0, 1.0,1.0
])
代表1个顶点
```
现在缓存区已经存在多个顶点数据，接下来我们来启用携带缓存区数据的attribute变量，使用enableVertexAttribArray来启用对应变量。

### [gl.enableVertexAttribArray(name)](https://link.jianshu.com/?t=%2F%2Fdeveloper.mozilla.org%2Fen-US%2Fdocs%2FWeb%2FAPI%2FWebGLRenderingContext%2FenableVertexAttribArray)
**name: 待启动的变量指针，也就是名称**
**所有的缓存区操作步骤我们都已经完成，那么接下来我们可以绘制出缓存区中的多个顶点**

### [gl.drawArrays(mode, first, count)](https://link.jianshu.com/?t=%2F%2Fdeveloper.mozilla.org%2Fen-US%2Fdocs%2FWeb%2FAPI%2FWebGLRenderingContext%2FdrawArrays)
**mode: 需要绘制的图像形状**

- gl.POINTS: 绘制一个点。
- gl.LINE_STRIP: 绘制一条直线到下一个顶点。
- gl.LINE_LOOP: 绘制一条首尾相连的线。
- gl.LINES: 绘制一条线。
- gl.TRIANGLES: 绘制一个三角形。
- first: 绘制的开始点
- count: 需要绘制的图形个数

看看屏幕吧，是不是出来了好多点，接下来我们就可以来绘制对应的波浪图了。
接下来会讲解如何绘制波浪图。