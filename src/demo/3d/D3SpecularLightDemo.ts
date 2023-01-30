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
import { dot, float, glsl, mat3, mat4, normalize, vec2, vec3, vec4, _mat3 } from "../../core/GLSL";
import { attribute, DefinedType, GLSL_Fragment, GLSL_Vertex, precision, PrecisionType, sampler2D, uniform, varying, _vec2, _vec4 } from "../../core/GLSL";
import { ColorUtil } from "../../utils/ColorUtil";


@precision(PrecisionType.mediump)
class MyVS extends GLSL_Vertex {
    @attribute(DefinedType.vec4)
    public a_position: vec4;
    @attribute(DefinedType.vec4)
    public a_color: vec4;
    @attribute(DefinedType.vec3)
    public a_normal: vec3;

    @uniform(DefinedType.vec3)
    public u_lightWorldPosition: vec3;
    @uniform(DefinedType.mat4)
    public u_world: mat4;
    //相机位置
    @uniform(DefinedType.vec3)
    public u_viewWorldPosition: vec3;


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
    @varying(DefinedType.vec3)
    public v_surfaceToLight: vec3;

    @varying(DefinedType.vec3)
    public v_surfaceToView: vec3;

    protected main() {
        glsl`
        gl_Position = u_worldViewProjection * a_position;
        v_color = a_color;
        v_position = a_position;
        v_normal = mat3(u_worldInverseTranspose) * a_normal;
        // 计算表面的世界坐标
        vec3 surfaceWorldPosition = (u_world * a_position).xyz;
        // 计算表面到光源的方向
        // 传递给片段着色器
        v_surfaceToLight = u_lightWorldPosition - surfaceWorldPosition;
        // 计算表面到相机的方向
        // 然后传递到片段着色器
        v_surfaceToView = u_viewWorldPosition - surfaceWorldPosition;
        `
    }
}

@precision(PrecisionType.mediump)
class MyFS extends GLSL_Fragment {

    @uniform(DefinedType.vec3)
    public u_reverseLightDirection: vec3;

    //镜面高光亮度
    @uniform(DefinedType.float)
    public u_shininess: float;
    //光源颜色
    @uniform(DefinedType.vec3)
    public u_lightColor: vec3;
    //光源高光颜色
    @uniform(DefinedType.vec3)
    public u_specularColor: vec3;

    @varying(DefinedType.vec4)
    public v_color: vec4;
    @varying(DefinedType.vec4)
    public v_position: vec4;
    @varying(DefinedType.vec3)
    public v_normal: vec3;
    @varying(DefinedType.vec3)
    public v_surfaceToLight: vec3;
    @varying(DefinedType.vec3)
    public v_surfaceToView: vec3;
    protected main() {
        glsl`
        gl_FragColor = v_color * 0.8 + (v_position * 0.03) * 0.2;
        //单位化
        vec3 normal = normalize(v_normal);
        vec3 surfaceToLightDirection = normalize(v_surfaceToLight);
        //点乘
        //float light = dot(normal, u_reverseLightDirection);//计算平行光
        float light = dot(normal, surfaceToLightDirection);//计算点光源

        //计算镜面高光
        vec3 surfaceToViewDirection = normalize(v_surfaceToView);
        vec3 halfVector = normalize(surfaceToLightDirection + surfaceToViewDirection);
        float specular = dot(normal, halfVector);

        // gl_FragColor = u_lightColor;
        
        //定义亮度
        //float u_shininess=12.0;
        //光源颜色
        //vec3 u_lightColor=vec3(1.0, 0.6, 0.6);
        //光源高光颜色
        //vec3 u_specularColor=vec3(1.0, 0.6, 0.6);

        //控制镜面高光
        //if (light > 0.0) {
            specular = pow(specular, u_shininess);
        //}
        // 应用光照
        gl_FragColor.rgb *= light*normalize(u_lightColor);
        // 直接加上高光
        gl_FragColor.rgb += specular*normalize(u_specularColor);
        `
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

/**
 * 带有镜面高光的点光源
 */
export class D3SpecularLightDemo {
    constructor() {
        this.initialize();
    }
    async initialize() {

        let scene: Scene = new Scene();

        let meshF = new Mesh();
        meshF.material = new LightMaterial(MyVS, MyFS);
        scene.addChild(meshF);

        let vertexes = F.getGeometry();
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
        scene.camera.transform.pos(0, 0, 400);
        // scene.camera.lookAt(meshF);

        let lightColor:number=0xFFcc66;

        Context.defaultShader.get("u_reverseLightDirection").set(...Matrix4.normalize([0.5, 0.7, 1]));
        Context.defaultShader.get("u_lightWorldPosition").set(20, 30, 60);
        Context.defaultShader.get("u_shininess").set(10);
        let color=ColorUtil.extractToArray(lightColor).map(v=>v/255);
        Context.defaultShader.get("u_lightColor").set(...color);
        Context.defaultShader.get("u_specularColor").set(...color);

        Context.addTick(this, (frame: number) => {
            Context.defaultProgram.clear(0x554433);
            // scene.camera.transform.x = Math.sin(frame / 20) * 100;
            // scene.camera.transform.z = 400 + Math.sin(frame / 40) * 100;
            // scene.camera.transform.y=Math.cos(frame/50)*50;

            // meshF.transform.rotationX += 0.05;
            meshF.transform.rotationY += 0.01;

            scene.updateRender();
        });
    }
}
