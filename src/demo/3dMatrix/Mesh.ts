import { Context } from "../../core/Context";
import { Material } from "./Material";
import { Matrix4 } from "./Matrix4";
import { Camera } from "./Camera";
import { Transform } from "./Transform";
import { BufferType } from "../../core/ShaderBuffer";

export class Mesh {

    private _matrix: Matrix4;
    private _transform: Transform;
    private _vertexes: Float32Array;
    private _colors: Uint8Array;
    private _material: Material;
    constructor() {
        this._transform = new Transform();
    }

    public set material(v: Material) {
        this._material = v;
        if (this._material) {
            this._material.createShader();
            let shader = this._material.shader;
            //创建顶点数据并且关联到attribute属性
            shader.getAttribute("a_position").linkBuffer(
                shader.createBuffer(
                    null,
                    3,
                    Context.gl.STATIC_DRAW));

            //创建纹理坐标uv数据并且关联到attribute属性
            shader.getAttribute("a_color").linkBuffer(
                shader.createBuffer(
                    null,
                    3,
                    Context.gl.STATIC_DRAW), 3, BufferType.UNSIGNED_BYTE, true);
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
        this._matrix = matrix;
        return matrix;
    }

    updateRender(camera: Camera) {
        let material = this._material;
        this.updateMatrix(camera);
        // material.setProperty("u_matrix", Matrix4.multiply(this.matrix, Matrix4.inverse(camera.matrix)));
        material.setProperty("u_matrix", this.matrix);
        material.draw();
    }
}