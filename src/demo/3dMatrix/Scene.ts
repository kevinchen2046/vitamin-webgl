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
        //创建Shader
        Context.createProgram();

        this.meshs = [];
        this.camera=new Camera();
    }

    public compile(material: Material) {
        material.createShader()
    }

    public addChild(mesh: Mesh) {
        this.meshs.push(mesh);
 
    }
}