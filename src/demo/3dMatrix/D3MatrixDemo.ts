import { Context } from "../../core/Context";
import { Texture, TextureMap, TextureWrap } from "../../core/Texture";
import { MathUtil } from "../../utils/MathUtil";
import { Loader } from "../../utils/Util";
import { Cube, D3Geometry } from "./D3Geometry";
import { F } from "./F";
import { Material } from "./Material";
import { Matrix4 } from "./Matrix4";
import { Mesh } from "./Mesh";
import { Scene } from "./Scene";
import { mat4, vec2, vec4 } from "../../core/GLSL";
import { attribute, DefinedType, GLSL_Fragment, GLSL_Vertex, precision, PrecisionType, sampler2D, uniform, varying, _vec2, _vec4 } from "../../core/GLSL";

@precision(PrecisionType.mediump)
class TextureVS extends GLSL_Vertex {
    @attribute(DefinedType.vec4)
    public a_position: vec4;
    @attribute(DefinedType.vec4)
    public a_color: vec4;
    @attribute(DefinedType.vec2)
    public a_texcoord: vec2;

    @uniform(DefinedType.mat4)
    public u_matrix: mat4;

    @varying(DefinedType.vec4)
    public v_color: vec4;

    @varying(DefinedType.vec4)
    public v_position: vec4;

    @varying(DefinedType.vec2)
    public v_texcoord: vec2;

    protected main() {
        // Multiply the position by the matrix.
        this.gl_Position._ = this.u_matrix._ * this.a_position._;

        // Pass the color to the fragment shader.
        this.v_color = this.a_color;
        this.v_position = this.a_position;
        this.v_texcoord = this.a_texcoord;
    }
}

@precision(PrecisionType.mediump)
class TextureFS extends GLSL_Fragment {
    @uniform(DefinedType.sampler2D)
    public u_sampler: sampler2D;

    @varying(DefinedType.vec4)
    public v_color: vec4;

    @varying(DefinedType.vec4)
    public v_position: vec4;

    @varying(DefinedType.vec2)
    public v_texcoord: vec2;

    protected main() {
        this.gl_FragColor._ = this.texture2D(this.u_sampler, this.v_texcoord) + (this.v_color._ * 0.8 + (this.v_position._ * 0.03) * 0.2)*0.4;
    }
}
class CubeMaterial extends Material {
    private _texture: Texture;
    public initShader(): boolean {
        return super.initShader(TextureVS, TextureFS);
    }

    public initialize(): void {
        super.initialize();
        let shader = this._shader;
        shader.getAttribute("a_texcoord").linkBuffer(
            shader.createBuffer(
                null,
                2,
                Context.gl.STATIC_DRAW));
    }

    public set texture(v: Texture) {
        this._texture = v;
        this._texture.linkProgram(Context.defaultProgram);
    }
    public get texture() { return this._texture }

    public set uvs(v: Float32Array) {
        this.setProperty("a_texcoord", v);
    }
}
export class D3MatrixDemo {

    constructor() {
        this.initialize();
    }
    async initialize() {

        let scene: Scene = new Scene();

        let meshF = new Mesh();
        meshF.material = new Material();
        scene.addChild(meshF);
        meshF.vertexes = new Float32Array(F.getGeometry().map(v => v - 35));
        meshF.colors = new Uint8Array(F.getColors());
        meshF.transform.z = -360;
        meshF.transform.setRotation(MathUtil.degToRad(190), MathUtil.degToRad(40), MathUtil.degToRad(320))

        // let meshCube = new Mesh();
        // meshCube.material = new Material();
        // scene.addChild(meshCube);
        // let cube = new Cube(60);
        // meshCube.vertexes = new Float32Array(cube.vertexes);
        // meshCube.colors = new Uint8Array(cube.colors);
        // meshCube.transform.z = -360;
        // meshCube.transform.setRotation(MathUtil.degToRad(190), MathUtil.degToRad(40), MathUtil.degToRad(320))

        // let cubeMaterial = (meshCube.material as CubeMaterial);
        // //加载图片
        // var image = await Loader.loadImage('./res/noodles.jpg');
        // cubeMaterial.texture = new Texture(image, {
        //     uniformName: "u_sampler",
        //     samplePosition: 0,
        //     wrap: { s: TextureWrap.CLAMP_TO_EDGE, t: TextureWrap.CLAMP_TO_EDGE },
        //     map: { min: TextureMap.LINEAR }
        // });
        // cubeMaterial.uvs = new Float32Array(cube.uvs);
        // console.log(cubeUvs,cube.uvs);

        scene.camera.enableCullFace();
        scene.camera.enableDepthBuffer();
        // scene.camera.lookAt(meshF);
        Context.defaultProgram.use();
        Context.addTick(this, (frame: number) => {
            Context.defaultProgram.clear(0x554433);
            scene.camera.transform.x = Math.sin(frame / 20) * 100;
            // scene.camera.transform.y=Math.cos(frame/50)*50;

            // meshCube.transform.rotationX += 0.01;
            // meshCube.transform.rotationY += 0.01;
            
            meshF.transform.rotationX += 0.05;
            meshF.transform.rotationY += 0.05;
            // meshF.updateRender(scene.camera);

            scene.updateRender();
        });
    }
}

let cubeUvs=[
    // select the top left image
    0, 0,
    0, 0.5,
    0.25, 0,
    0, 0.5,
    0.25, 0.5,
    0.25, 0,
    // select the top middle image
    0.25, 0,
    0.5, 0,
    0.25, 0.5,
    0.25, 0.5,
    0.5, 0,
    0.5, 0.5,
    // select to top right image
    0.5, 0,
    0.5, 0.5,
    0.75, 0,
    0.5, 0.5,
    0.75, 0.5,
    0.75, 0,
    // select the bottom left image
    0, 0.5,
    0.25, 0.5,
    0, 1,
    0, 1,
    0.25, 0.5,
    0.25, 1,
    // select the bottom middle image
    0.25, 0.5,
    0.25, 1,
    0.5, 0.5,
    0.25, 1,
    0.5, 1,
    0.5, 0.5,
    // select the bottom right image
    0.5, 0.5,
    0.75, 0.5,
    0.5, 1,
    0.5, 1,
    0.75, 0.5,
    0.75, 1,
]
