import { Context } from "../../core/Context";
import { Texture, TextureMap, TextureWrap } from "../../core/Texture";
import { Loader } from "../../utils/Util";
import { CubeGeometry, D3Geometry } from "./D3Geometry";
import { Material } from "./Material";
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
    public u_worldViewProjection: mat4;
    @varying(DefinedType.vec4)
    public v_color: vec4;
    @varying(DefinedType.vec4)
    public v_position: vec4;
    @varying(DefinedType.vec2)
    public v_texcoord: vec2;
    protected main() {
        // Multiply the position by the matrix.
        this.gl_Position._ = this.u_worldViewProjection._ * this.a_position._;
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
        this.gl_FragColor._ = this.texture2D(this.u_sampler, this.v_texcoord) + (this.v_color._ * 0.8 + (this.v_position._ * 0.03) * 0.2) * 0.4;
    }
}

class CubeMaterial extends Material {
    private _texture: Texture;

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
        this._texture.linkProgram(this._shader.program);
    }

    public get texture() { return this._texture }

    public set uvs(v: Float32Array) {
        this.setProperty("a_texcoord", v);
    }
}

export class D3CubeTexDemo {
    constructor() {
        this.initialize();
    }
    async initialize() {
        let scene: Scene = new Scene();
        //加载图片
        var image = await Loader.loadImage('./res/noodles.jpg');
        var config: any = await Loader.loadJson('./res/noodles.json');
        let cube = new Mesh();
        cube.material = new CubeMaterial(TextureVS, TextureFS);
        scene.addChild(cube);
        //单位化 纹理信息
        let uvconfigs = config.frames.map(v => {
            return {
                x: v.x / config.size.w,
                y: v.y / config.size.h,
                w: v.w / config.size.w,
                h: v.h / config.size.h
            }
        });
        let geometry = new CubeGeometry(60, uvconfigs);
        cube.vertexes = new Float32Array(geometry.vertexes);
        cube.colors = new Uint8Array(geometry.colors);
        cube.transform.z = -360;
        // meshCube.transform.setRotation(MathUtil.degToRad(190), MathUtil.degToRad(40), MathUtil.degToRad(320))
        let materail = (cube.material as CubeMaterial);
        materail.texture = new Texture(image, {
            uniformName: "u_sampler",
            samplePosition: 0,
            wrap: { s: TextureWrap.CLAMP_TO_EDGE, t: TextureWrap.CLAMP_TO_EDGE },
            map: { min: TextureMap.LINEAR }
        });
        materail.uvs = new Float32Array(geometry.uvs);
        scene.camera.enableCullFace();
        scene.camera.enableDepthBuffer();
        // scene.camera.lookAt(meshCube);
        Context.addTick(this, (frame: number) => {
            Context.defaultProgram.clear(0x554433);
            scene.camera.transform.x = Math.sin(frame / 50) * 100;
            // scene.camera.transform.y=Math.cos(frame/50)*50;
            cube.transform.rotationX += 0.03;
            cube.transform.rotationY += 0.02;
            scene.updateRender();
        });
    }
}
