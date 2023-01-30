import { Attribute } from "../../core/Attribute";
import { Context } from "../../core/Context";
import { MathUtil } from "../../utils/MathUtil";
import { Matrix4 } from "./Matrix4";
import { Mesh } from "./Mesh";
import { Transform } from "./Transform";

export class Camera {
    public transform: Transform;
    public fieldOfView: number;
    public aspect: number;
    public near: number;
    public far: number;
    /**相机矩阵 */
    private _matrix: Matrix4;
    /**投影矩阵 */
    public projectionMatrix: Matrix4;
    /**视口投影矩阵*/
    public viewProjectionMatrix: Matrix4;
    private target: Mesh;
    constructor() {
        this.fieldOfView = MathUtil.degToRad(60);
        this.aspect = Context.clientWidth / Context.clientHeight;
        this.near = 1;
        this.far = 2000;
        this.transform = new Transform();
        this.projectionMatrix = Matrix4.perspective(this.fieldOfView, this.aspect, this.near, this.far);
    }

    updateMatrix() {
        let transform = this.transform;
        let position = transform.position;
        let rotation = transform.rotation;
        let scale = transform.scale;
        var matrix;
        if (this.target) {
            matrix = Matrix4.lookAt(position.xyz, this.target.transform.position.xyz, [0, 1, 0]);
        } else {
            matrix = Matrix4.identity();
            matrix = Matrix4.translate(matrix, position.x, position.y, position.z);
            matrix = Matrix4.xRotate(matrix, rotation.x);
            matrix = Matrix4.yRotate(matrix, rotation.y);
            matrix = Matrix4.zRotate(matrix, rotation.z);
            matrix = Matrix4.scale(matrix, scale.x, scale.y, scale.z);
        }
        this._matrix = matrix;
    }

    public get matrix() {
        return this._matrix;
    }

    /**打开背面剔除 */
    enableCullFace() {
        Context.gl.enable(Context.gl.CULL_FACE);
    }

    /**打开深度缓冲 */
    enableDepthBuffer() {
        Context.gl.enable(Context.gl.DEPTH_TEST);
    }

    lookAt(mesh: Mesh) {
        this.target = mesh;
    }

    updateRender() {
        this.updateMatrix();
        // 通过相机矩阵计算视图矩阵 取逆
        var viewMatrix = Matrix4.inverse(this._matrix);
        // 计算组合矩阵
        this.viewProjectionMatrix = Matrix4.multiply(this.projectionMatrix, viewMatrix);
    }
}