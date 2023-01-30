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
import { mat4, vec2, vec4 } from "../../core/GLSL";
import { attribute, DefinedType, GLSL_Fragment, GLSL_Vertex, precision, PrecisionType, sampler2D, uniform, varying, _vec2, _vec4 } from "../../core/GLSL";


@precision(PrecisionType.mediump)
class MyVS extends GLSL_Vertex {
    @attribute(DefinedType.vec4)
    public a_position: vec4;
    @attribute(DefinedType.vec4)
    public a_color: vec4;
    @uniform(DefinedType.mat4)
    public u_worldViewProjection: mat4;
    @varying(DefinedType.vec4)
    public v_color: vec4;
    @varying(DefinedType.vec4)
    public v_position: vec4;
    protected main() {
        // Multiply the position by the matrix.
        this.gl_Position._ = this.u_worldViewProjection._ * this.a_position._;
        // Pass the color to the fragment shader.
        this.v_color = this.a_color;
        this.v_position = this.a_position;
    }
}

@precision(PrecisionType.mediump)
class MyFS extends GLSL_Fragment {
    @uniform(DefinedType.sampler2D)
    public u_sampler: sampler2D;
    @varying(DefinedType.vec4)
    public v_color: vec4;
    @varying(DefinedType.vec4)
    public v_position: vec4;
    protected main() {
        this.gl_FragColor._ = this.v_color._ * 0.8 + (this.v_position._ * 0.03) * 0.2;
    }
}

export class D3MatrixDemo {

    constructor() {
        this.initialize();
    }
    async initialize() {

        let scene: Scene = new Scene();

        let meshF = new Mesh();
        meshF.material = new Material(MyVS,MyFS);
        scene.addChild(meshF);
        meshF.vertexes = new Float32Array(F.getGeometry().map(v => v - 35));
        meshF.colors = new Uint8Array(F.getColors());
        meshF.transform.z = -360;
        meshF.transform.setRotation(MathUtil.degToRad(190), MathUtil.degToRad(40), MathUtil.degToRad(320))

        scene.camera.enableCullFace();
        scene.camera.enableDepthBuffer();
        // scene.camera.lookAt(meshCube);

        Context.addTick(this, (frame: number) => {
            Context.defaultProgram.clear(0x554433);
            scene.camera.transform.x = Math.sin(frame / 20) * 100;
            // scene.camera.transform.y=Math.cos(frame/50)*50;

            meshF.transform.rotationX += 0.05;
            meshF.transform.rotationY += 0.05;

            scene.updateRender();
        });
    }
}
