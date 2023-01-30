import { Context } from "../../core/Context";
import { Material } from "./Material";
import { Matrix4 } from "./Matrix4";
import { Camera } from "./Camera";
import { Transform } from "./Transform";
import { BufferType } from "../../core/ShaderBuffer";
import { EventEmiter } from "../../utils/EventEmiter";

export class Mesh extends EventEmiter{

    private _matrix: Matrix4;
    private _transform: Transform;
    private _vertexes: Float32Array;
    private _colors: Uint8Array;
    private _normals: Float32Array;
    private _material: Material;
    constructor(material?:Material) {
        super();
        this._transform = new Transform();

        this.material=material;
    }

    public set material(v: Material) {
        if (this._material!=v) {
            this._material = v;
            this.emit("MATERIAL_CHANGE",this);
        }
    }

    public get material() { return this._material }

    public set vertexes(v: Float32Array) {
        this._vertexes = v;
        this._material.setProperty("a_position", this._vertexes);
    }

    public get vertexes() {
        return this._vertexes;
    }

    public set colors(v: Uint8Array) {
        this._colors = v;
        this._material.setProperty("a_color", this._colors);
    }

    public get colors() {
        return this._colors;
    }

    public set normals(v: Float32Array) {
        this._normals = v;
        this._material.setProperty("a_normal", this._normals);
    }

    public get normals() {
        return this._normals;
    }

    public get transform() {
        return this._transform;
    }

    public get matrix() {
        return this._matrix;
    }

    updateMatrix(camera: Camera) {
        let transform = this.transform;
        let position = transform.position;
        let rotation = transform.rotation;
        let scale = transform.scale;
        let matrix = Matrix4.identity();
        matrix = Matrix4.translate(matrix, position.x, position.y, position.z); 
        matrix = Matrix4.xRotate(matrix, rotation.x);
        matrix = Matrix4.yRotate(matrix, rotation.y);
        matrix = Matrix4.zRotate(matrix, rotation.z);
        matrix = Matrix4.scale(matrix, scale.x, scale.y, scale.z);
        this._matrix=matrix;
        
        this._material.setProperty("u_viewWorldPosition",...camera.transform.position.xyz);
        this._material.setProperty("u_world", matrix);

        var worldViewProjectionMatrix = Matrix4.multiply(camera.viewProjectionMatrix,matrix);
        this._material.setProperty("u_worldViewProjection", worldViewProjectionMatrix);
  
        var worldInverseTransposeMatrix = Matrix4.transpose(Matrix4.inverse(matrix));
        this._material.setProperty("u_worldInverseTranspose", worldInverseTransposeMatrix);
        return matrix;
    }
}