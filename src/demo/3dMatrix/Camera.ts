import { Attribute } from "../../core/Attribute";
import { Context } from "../../core/Context";
import { MathUtil } from "../../utils/MathUtil";
import { Matrix4 } from "./Matrix4";
import { Transform } from "./Transform";

export class Camera {
    private _matrix: Matrix4;
    public transform:Transform;

    public fieldOfView:number;
    public aspect:number;
    public near:number;
    public far:number; 
    constructor() {
        this.fieldOfView=MathUtil.degToRad(60);
        this.aspect = Context.clientWidth / Context.clientHeight;
        this.near=1;
        this.far=2000;
        this.transform=new Transform();
    }

    updateMatrix(){
        let transform=this.transform;
        let position=transform.positon;
        let rotation=transform.rotation;
        let scale=transform.scale;
        var matrix = new Matrix4(16).identity();
        matrix = matrix.translate(matrix, position.x, position.y, position.z);
        matrix = matrix.xRotate(matrix, rotation.x);
        matrix = matrix.yRotate(matrix, rotation.y);
        matrix = matrix.zRotate(matrix, rotation.z);
        matrix = matrix.scale(matrix,  scale.x, scale.y, scale.z);
        this._matrix=matrix;
    }

    public get matrix() {
        return this._matrix;
    }

    /**打开背面剔除 */
    enableCullFace(){
        Context.gl.enable(Context.gl.CULL_FACE);
    }

    /**打开深度缓冲 */
    enableDepthBuffer(){
        Context.gl.enable(Context.gl.DEPTH_TEST);
    }


    updateRender() {
        this.updateMatrix();
    }
}