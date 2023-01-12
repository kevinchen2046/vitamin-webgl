
import { glsl, mat3, vec3, vec4, __vec3 } from "../../core/GLSL";
import { attribute, cos, DefinedType, float, GLSL_Fragment, GLSL_Vertex, method, precision, PrecisionType, sampler2D, sin, smoothstep, texture2D, uniform, varying, vec2, __vec2, __vec4 } from "../../core/GLSL";
import { Context } from "../../core/Context";
import { ConvoUtil } from "../convolutionals/ConvoUtil";
import { Loader } from "../Util";
import { Matrix } from "./Matrix";
import { Sprite } from "./Sprite";

@precision(PrecisionType.mediump)
class MyVS extends GLSL_Vertex {
  @attribute(DefinedType.vec2)
  public a_position: vec2;
  @attribute(DefinedType.vec2)
  public a_texCoord: vec2;

  @uniform(DefinedType.vec4)
  public u_color: vec4;

  @uniform(DefinedType.float)
  public u_time: float;

  @uniform(DefinedType.mat3)
  public u_matrix: mat3;

  //-----------
  @varying(DefinedType.vec4)
  public v_color: vec4;
  @varying(DefinedType.vec2)
  public v_texCoord: vec2;

  protected main() {
    let position: any = (this.u_matrix.__ * __vec3(this.a_position.x, this.a_position.y, 1.0).__);//@vec3
    this.gl_Position = __vec4(position.x, position.y, 0.0, 1.0);
    this.v_color = this.u_color;
    this.v_texCoord = this.a_texCoord;
  }
}

@precision(PrecisionType.mediump)
class MyFS extends GLSL_Fragment {
  @uniform(DefinedType.sampler2D)
  public u_sampler: sampler2D;

  @uniform(DefinedType.float)
  public u_time: float;

  @varying(DefinedType.vec4)
  public v_color: vec4;

  @varying(DefinedType.vec2)
  public v_texCoord: vec2;

  protected main() {
    glsl`
      gl_FragColor = texture2D(u_sampler, v_texCoord)*v_color;
    `;
  }
}

export class MatrixDemo {

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

    let sprite = new Sprite();
    await sprite.load('./res/yellowflower.jpg');

    //创建顶点数据并且关联到attribute属性
    shader.getAttribute("a_position").linkBuffer(
      shader.createBuffer(
        ConvoUtil.createRectangleData(0, 0, sprite.texture.width, sprite.texture.height),
        2,
        Context.gl.STATIC_DRAW));

    //创建纹理坐标uv数据并且关联到attribute属性
    shader.getAttribute("a_texCoord").linkBuffer(
      shader.createBuffer(
        [
          0.0, 0.0,
          1.0, 0.0,
          0.0, 1.0,
          0.0, 1.0,
          1.0, 0.0,
          1.0, 1.0,
        ],
        2,
        Context.gl.STATIC_DRAW));


    Context.defaultProgram.use();

    setInterval(() => {
      sprite.tintTo((Math.random() * 0xFFFFFF), 1000)
    }, 1000);

    Context.addTick(this, frame => {
      Context.defaultProgram.clear(0x554433);

      sprite.x = (Context.clientWidth - sprite.texture.width) / 2 + Math.sin(frame / 20) * 100;
      sprite.y = (Context.clientWidth - sprite.texture.height) / 2 + Math.cos(frame / 20) * 100;
      // sprite.angle+=1;
      let scale=(1 - Math.sin(frame / 50)) / 2 + 0.5;
      sprite.scale(scale,scale);

      shader.get("u_color").set(...sprite.transform.tint);
      shader.get("u_matrix").set(sprite.matrix.data);
      shader.draw();
    });
  }
}
