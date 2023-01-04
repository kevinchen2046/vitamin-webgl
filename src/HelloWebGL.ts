import { Geometry } from "./Geometry";
import { attribute, cos, DefinedType, float, GLSL_Fragment, GLSL_Vertex, method, precision, PrecisionType, sampler2D, sin, smoothstep, texture2D, uniform, varying, vec2, _vec2, _vec4 } from "./core/GLSL";
import { RenderContext } from "./core/RenderContext";

@precision(PrecisionType.mediump)
class MyVS extends GLSL_Vertex {
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

export class HelloWebGL {

    constructor() {
        this.initialize();
    }
    async initialize() {
        var canvas = document.getElementById('webgl');
        //创建渲染器
        let context = new RenderContext(canvas as HTMLCanvasElement);
        //创建Shader
        let shader = context.createProgram().createShader(MyVS, MyFS);
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
        var image = await this.loadImage('../resources/yellowflower.jpg');
        //创建纹理
        shader.createTexture("u_Sampler", image, 0);
        //循环渲染
        context.tick(frame => {
            //更新u_time值
            shader.set("u_time", frame);
            context.updateRender();
        })
    }

    loadImage(url) {
        return new Promise<HTMLImageElement>(reslove => {
            var image = new Image();
            if (!image) {
                console.log('Failed to create the image object');
                reslove(null);
                return;
            }
            image.onload = () => reslove(image);
            image.src = url;
        })
    }
}