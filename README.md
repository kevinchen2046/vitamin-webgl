## Webgl的Easy化

### GLSL的模板化
通过`Typescript的装饰器`和`代码分析器`将JS的类文件转译成`glsl`文件
- 你可以减少拼写错误,并最大程度的减少类型错误
- 你可以查看内置函数的注释内容
- 自动取出属性地址,你可以直接使用`shader.set`设置属性值
```ts
//顶点着色器
//定义精度
@precision(PrecisionType.mediump)
class MyVS extends GLSL_Vertex {
    //属性装饰并传入类型
    @attribute(DefinedType.vec2)
    public a_Position: vec2;
    @attribute(DefinedType.float)
    public a_Color: float;
    @uniform(DefinedType.float)
    public u_time: float;
    @varying(DefinedType.float)
    public v_Color: float;
    @varying(DefinedType.vec2)
    public v_TexCoord: vec2;
    //方法装饰，并传入类型
    @method([DefinedType.float], DefinedType.float)
    public st(a: float, b: float, s: float) {
        return (a - s + a + s + b);
    }
    protected main() {
        let x = this.a_Position.x;
        let y = this.a_Position.y;
        let time = this.u_time / 30.0;
        let x1 = x - 0.5;
        let y1 = 0.5 - y;
        let dis = sin(0.5 - x1) + cos(y1);
        x += sin(dis + time) / 5.0;
        y += cos(dis + time) / 5.0;
        this.gl_Position = _vec4(x, y, 0.0, 1.0);
        this.v_Color = this.a_Color;
        this.v_TexCoord = _vec2(this.a_Position.x - 0.5, 0.5 - this.a_Position.y);
    }
}
//片段着色器
@precision(PrecisionType.mediump)
class MyFS extends GLSL_Fragment {
    @uniform(DefinedType.sampler2D)
    public u_Sampler: sampler2D;

    @uniform(DefinedType.float)
    public u_time: float;

    @varying(DefinedType.float)
    public v_Color: float;

    @varying(DefinedType.vec2)
    public v_TexCoord: vec2;

    protected main() {
        this.gl_FragColor = texture2D(this.u_Sampler, this.v_TexCoord);
    }
}
```
当着色器编码完成就可以传入Shader生成器中,随后你可以调用`shader.printf`来查看转译后的`glsl`内容
### 创建渲染
- 渲染流程的封装 
  - 原则尽量保持最大的灵活性,减少冗余代码
```ts
var canvas = document.getElementById('webgl');
//创建渲染器
let context = new RenderContext(canvas as HTMLCanvasElement);
//创建Shader
let shader = context.createProgram().createShader(MyVS, MyFS);
//打印shader内容
shader.printf();
//创建几何面
let geometry = new Geometry(8, 8);
geometry.update();
//创建Buffer
let buffer = shader.createBuffer(geometry.buffer, 5, context.gl.DYNAMIC_DRAW);
//将存储属性a_Position链接到Buffer数据
shader.getAttribute("a_Position").linkBuffer(buffer, 2, 0);
//将存储属性a_Color链接到Buffer数据
shader.getAttribute("a_Color").linkBuffer(buffer, 3, 2);
//加载图片
var image = await this.loadImage('./res/yellowflower.jpg');
//创建纹理
shader.createTexture("u_Sampler", image, 0);
//循环渲染
context.tick(frame => {
    //更新u_time值
    shader.set("u_time", frame);
    context.updateRender();
});
```
