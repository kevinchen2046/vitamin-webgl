import { Context } from "../../core/Context";
import { Texture, TextureMap, TextureWrap } from "../../core/Texture";
import { MathUtil } from "../../utils/MathUtil";
import { Loader } from "../../utils/Util";
import { CubeGeometry, D3Geometry } from "./D3Geometry";
import { F } from "./F";
import { Material } from "./Material";
import { Matrix4 } from "./Matrix4";
import { Mesh } from "./Mesh";
import { Scene } from "./Scene";
import { dot, mat3, mat4, normalize, vec2, vec3, vec4, _mat3 } from "../../core/GLSL";
import { attribute, DefinedType, GLSL_Fragment, GLSL_Vertex, precision, PrecisionType, sampler2D, uniform, varying, _vec2, _vec4 } from "../../core/GLSL";


@precision(PrecisionType.mediump)
class MyVS extends GLSL_Vertex {
    @attribute(DefinedType.vec4)
    public a_position: vec4;
    @attribute(DefinedType.vec4)
    public a_color: vec4;
    @attribute(DefinedType.vec3)
    public a_normal: vec3;
    @uniform(DefinedType.mat4)
    public u_worldViewProjection: mat4;
    @uniform(DefinedType.mat4)
    public u_worldInverseTranspose: mat4;
    @varying(DefinedType.vec4)
    public v_color: vec4;
    @varying(DefinedType.vec4)
    public v_position: vec4;
    @varying(DefinedType.vec3)
    public v_normal: vec3;

    protected main() {
        // Multiply the position by the matrix.
        this.gl_Position._ = this.u_worldViewProjection._ * this.a_position._;
        // Pass the color to the fragment shader.
        this.v_color = this.a_color;
        this.v_position = this.a_position;
        this.v_normal._ = _mat3(this.u_worldInverseTranspose)._ * this.a_normal._;
    }
}

@precision(PrecisionType.mediump)
class MyFS extends GLSL_Fragment {

    @uniform(DefinedType.vec3)
    public u_reverseLightDirection: vec3;
    @uniform(DefinedType.vec4)

    public u_lightColor: vec4;
    @varying(DefinedType.vec4)
    public v_color: vec4;
    @varying(DefinedType.vec4)
    public v_position: vec4;
    @varying(DefinedType.vec3)
    public v_normal: vec3;

    protected main() {
        this.gl_FragColor._ = this.v_color._ * 0.8 + (this.v_position._ * 0.03) * 0.2;
        //单位化
        let normal = normalize(this.v_normal);//@vec3
        //点乘
        let light = dot(normal, this.u_reverseLightDirection);//@float
        // this.gl_FragColor = this.u_lightColor;
        // 应用亮度
        this.gl_FragColor.rgb._ *= light._;
    }
}

class LightMaterial extends Material {

    public initialize(): void {
        super.initialize();
        let shader = this._shader;
        shader.getAttribute("a_normal").linkBuffer(
            shader.createBuffer(
                null,
                3,
                Context.gl.STATIC_DRAW));
    }
}


export class D3DirectLightDemo {
    constructor() {
        this.initialize();
    }
    async initialize() {

        let scene: Scene = new Scene();

        let meshF = new Mesh();
        meshF.material = new LightMaterial(MyVS, MyFS);
        scene.addChild(meshF);

        let vertexes=F.getGeometry();
        //翻转
        var matrix = Matrix4.xRotation(Math.PI);
        //位移
        matrix = Matrix4.translate(matrix, -50, -75, -15);
        //将矩阵应用到每一个顶点
        for (var i = 0; i < vertexes.length; i += 3) {
            var vector = Matrix4.transformPoint(matrix, [vertexes[i + 0], vertexes[i + 1], vertexes[i + 2], 1]);
            vertexes[i + 0] = vector[0];
            vertexes[i + 1] = vector[1];
            vertexes[i + 2] = vector[2];
        }
        meshF.vertexes = new Float32Array(vertexes);
        meshF.colors = new Uint8Array(F.getColors());
        //法向量 是和翻转后的顶点匹配的数据
        meshF.normals = new Float32Array(F.getNormals());
        // meshF.transform.pos(-50, -75, -15);

        // meshF.transform.z = -360;
        // meshF.transform.y = 35;
        // meshF.transform.setRotation(MathUtil.degToRad(190), MathUtil.degToRad(40), MathUtil.degToRad(320))

        scene.camera.enableCullFace();
        scene.camera.enableDepthBuffer();
        // scene.camera.transform.pos(100, 0, 400);
        // scene.camera.lookAt(meshF);

        Context.defaultShader.get("u_lightColor").set(0.2, 1, 0.2, 1);
        Context.defaultShader.get("u_reverseLightDirection").set(...Matrix4.normalize([0.5, 0.7, 1]));
        Context.addTick(this, (frame: number) => {
            Context.defaultProgram.clear(0x554433);
            scene.camera.transform.x = Math.sin(frame / 20) * 100;
            scene.camera.transform.z =400+ Math.sin(frame / 40) * 100;
            // scene.camera.transform.y=Math.cos(frame/50)*50;

            meshF.transform.rotationX += 0.05;
            meshF.transform.rotationY += 0.01;

            scene.updateRender();
        });
    }
}
