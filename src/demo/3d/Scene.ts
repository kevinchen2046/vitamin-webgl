import { Attribute } from "../../core/Attribute";
import { Context } from "../../core/Context";
import { Camera } from "./Camera";
import { Material } from "./Material";
import { Mesh } from "./Mesh";

export class Scene {
    public camera: Camera;
    private meshs: Mesh[];
    constructor() {
        var canvas = document.getElementById('webgl');
        //创建渲染器
        Context.initialize(canvas as HTMLCanvasElement);
        //创建Program
        Context.createProgram();

        this.meshs = [];
        this.camera = new Camera();
    }

    public addChild(mesh: Mesh) {
        this.meshs.push(mesh);
        mesh.on("MATERIAL_CHANGE", this, this.meterialChange);
        this.meterialChange();
    }

    private meterialChange() {
        let program = Context.defaultProgram;
        program.unlink();
        this.meshs.forEach(mesh=>{
            mesh.material?.initShader();
        });
        program.link();
        this.meshs.forEach(mesh=>{
            mesh.material?.initialize();
        });
        program.use();
    }

    public updateRender(){
        this.camera.updateRender();
        for(let i=0;i<this.meshs.length;i++){
            this.meshs[i].updateMatrix(this.camera);
        }
        Context.defaultProgram.updateRender();
    }
}