import { Geometry } from "./geometry/Geometry";
import { attribute, cos, DefinedType, float, GLSL_Fragment, GLSL_Vertex, method, precision, PrecisionType, sampler2D, sin, smoothstep, texture2D, uniform, varying, vec2, __vec2, __vec4 } from "../core/GLSL";
import { Context } from "../core/Context";
import { Loader } from "../utils/Util";
import { TypeTextureDraw } from "../core/Texture";
import { BufferType } from "../core/ShaderBuffer";

@precision(PrecisionType.mediump)
class MyVS extends GLSL_Vertex {
    @attribute(DefinedType.vec2)
    public a_position: vec2;

    @attribute(DefinedType.float)
    public a_color: float;

    @uniform(DefinedType.float)
    public u_time: float;

    @varying(DefinedType.float)
    public v_color: float;

    @varying(DefinedType.vec2)
    public v_texcoord: vec2;

    @method([DefinedType.float], DefinedType.float)
    public st(a: float, b: float, s: float) {
        return (a - s + a + s + b);
    }
    protected main() {
        let x = this.a_position.x;
        let y = this.a_position.y;
        let time = this.u_time / 30.0;
        let x1 = x - 0.5;
        let y1 = 0.5 - y;
        let dis = sin(0.5 - x1) + cos(y1);
        x += sin(dis + time) / 5.0;
        y += cos(dis + time) / 5.0;
        this.gl_Position = __vec4(x, y, 0.0, 1.0);
        this.v_color = this.a_color;
        this.v_texcoord = __vec2(this.a_position.x - 0.5, 0.5 - this.a_position.y);
    }
}

@precision(PrecisionType.mediump)
class MyFS extends GLSL_Fragment {
    @uniform(DefinedType.sampler2D)
    public u_sampler: sampler2D;

    @uniform(DefinedType.float)
    public u_time: float;

    @varying(DefinedType.float)
    public v_color: float;

    @varying(DefinedType.vec2)
    public v_texcoord: vec2;

    protected main() {
        this.gl_FragColor = texture2D(this.u_sampler, this.v_texcoord);
    }
}

export class CustomWebGL {

    constructor() {
        this.initialize();
    }
    async initialize() {
        var canvas = document.getElementById('webgl');
        //创建渲染器
        Context.initialize(canvas as HTMLCanvasElement);
        //创建Shader
        let shader = Context.createProgram().createShader(MyVS, MyFS);
        shader.printf();
        //创建几何面 
        //几何面的顶点数据包含坐标和颜色,所以单个顶点应该长度5
        let geometry = new Geometry(4, 4, 0.5, 0.5);
        //创建Buffer
        let buffer = shader.createBuffer(geometry.buffer, 5, Context.gl.DYNAMIC_DRAW);
        //将存储属性a_Position链接到Buffer数据
        shader.getAttribute("a_position").linkBuffer(buffer, 2);
        //将存储属性a_Color链接到Buffer数据
        shader.getAttribute("a_color").linkBuffer(buffer, 3, BufferType.FLOAT, false, buffer.elementCount, 2);
        //加载图片
        var image = await Loader.loadImage('./res/flower.jpg');
        //创建纹理
        shader.createTexture("u_sampler", image, 0, TypeTextureDraw.LINEAR);
        // texture.active();
        //循环渲染
        Context.addTick(this, frame => {
            //更新u_time值
            shader.set("u_time", frame);
            Context.updateRender();
        });
    }
}