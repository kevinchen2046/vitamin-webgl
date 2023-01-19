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
        var matrix = camera.viewProjectionMatrix;
        matrix = matrix.translate(matrix, position.x, position.y, position.z);
        matrix = matrix.xRotate(matrix, rotation.x);
        matrix = matrix.yRotate(matrix, rotation.y);
        matrix = matrix.zRotate(matrix, rotation.z);
        matrix = matrix.scale(matrix, scale.x, scale.y, scale.z);
        this._matrix=matrix;
        this._material.setProperty("u_matrix", this._matrix);
        return matrix;
    }
}