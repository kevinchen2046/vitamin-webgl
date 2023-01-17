import { Context } from "../../core/Context";
import { MathUtil } from "../../utils/MathUtil";
import { D3Geometry } from "./D3Geometry";
import { F } from "./F";
import { Material } from "./Material";
import { Matrix4 } from "./Matrix4";
import { Mesh } from "./Mesh";
import { Scene } from "./Scene";

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
        // let cube = D3Geometry.createCube(80);
        // meshCube.vertexes = new Float32Array(cube.vertexes);
        // meshCube.colors = new Uint8Array(cube.colors);
        // meshCube.transform.z = -360;
        // meshCube.transform.setRotation(MathUtil.degToRad(190), MathUtil.degToRad(40), MathUtil.degToRad(320))
        
        scene.camera.enableCullFace();
        scene.camera.enableDepthBuffer();
        Context.defaultProgram.use();
        Context.addTick(this, (frame: number) => {
            Context.defaultProgram.clear(0x554433);
            // scene.camera.transform.y+=1;
            scene.camera.updateMatrix();

            // meshCube.updateRender(scene.camera)
            meshF.transform.rotationX += 0.02;
            meshF.transform.rotationY += 0.02;
            meshF.updateRender(scene.camera);
        });
    }
}
