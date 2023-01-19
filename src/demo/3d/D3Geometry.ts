import { D3Face, Vector3 } from "./D3Face";

export class D3Geometry {
    public faces: D3Face[];
    public uvs: number[];
    public vertexes: number[];
    public colors: number[];
    constructor(faces:D3Face[]) {
        this.faces=faces;
        let vectors:Vector3[]=[]
        for (let i = 0; i < faces.length; i++) {
            vectors = vectors.concat(faces[i].vectors);
        }
        this.vertexes = []
        this.uvs = []
        this.colors = []
        for (let i = 0; i < vectors.length; i++) {
            let p: Vector3 = vectors[i];
            this.vertexes.push(...p.xyz);
            this.uvs.push(...p.uv);
            this.colors.push(p.color.r, p.color.g, p.color.b);
        }
    }
}

export class CubeGeometry extends D3Geometry {
    public size: number;
    /**
     * 立方体
     * @param size 立方体大小
     * @param uvs 归一化后的六面纹理坐标
     */
    constructor(size: number = 20, uvs: { x: number, y: number, w: number, h: number }[]) {
        super([
            //forward
            new D3Face(
                new Vector3(-1, 1, 1, uvs[0].x, uvs[0].y),
                new Vector3(-1, -1, 1, uvs[0].x, uvs[0].y + uvs[0].h),
                new Vector3(1, -1, 1, uvs[0].x + uvs[0].w, uvs[0].y + uvs[0].h),
                new Vector3(1, 1, 1, uvs[0].x + uvs[0].w, uvs[0].y),
                { r: 255, g: 0, b: 0 }, size, true),
            //behind
            new D3Face(
                new Vector3(-1, 1, -1, uvs[1].x, uvs[1].y),
                new Vector3(-1, -1, -1, uvs[1].x, uvs[1].y + uvs[1].h),
                new Vector3(1, -1, -1, uvs[1].x + uvs[1].w, uvs[1].y + uvs[1].h),
                new Vector3(1, 1, -1, uvs[1].x + uvs[1].w, uvs[1].y),
                { r: 0, g: 255, b: 0 }, size),
            //left
            new D3Face(
                new Vector3(-1, -1, 1, uvs[2].x, uvs[2].y),
                new Vector3(-1, -1, -1, uvs[2].x, uvs[2].y + uvs[2].h),
                new Vector3(-1, 1, -1, uvs[2].x + uvs[2].w, uvs[2].y + uvs[2].h),
                new Vector3(-1, 1, 1, uvs[2].x + uvs[2].w, uvs[2].y),
                { r: 0, g: 0, b: 255 }, size),
            //right
            new D3Face(
                new Vector3(1, -1, 1, uvs[3].x, uvs[3].y),
                new Vector3(1, -1, -1, uvs[3].x, uvs[3].y + uvs[3].h),
                new Vector3(1, 1, -1, uvs[3].x + uvs[3].w, uvs[3].y + uvs[3].h),
                new Vector3(1, 1, 1, uvs[3].x + uvs[3].w, uvs[3].y),
                { r: 128, g: 128, b: 0 }, size, true),
            //up
            new D3Face(
                new Vector3(-1, -1, 1, uvs[4].x, uvs[4].y),
                new Vector3(-1, -1, -1, uvs[4].x, uvs[4].y + uvs[4].h),
                new Vector3(1, -1, -1, uvs[4].x + uvs[4].w, uvs[4].y + uvs[4].h),
                new Vector3(1, -1, 1, uvs[4].x + uvs[4].w, uvs[4].y),
                { r: 0, g: 128, b: 128 }, size, true),
            //bottom
            new D3Face(
                new Vector3(-1, 1, 1, uvs[5].x, uvs[5].y),
                new Vector3(-1, 1, -1, uvs[5].x, uvs[5].y + uvs[5].h),
                new Vector3(1, 1, -1, uvs[5].x + uvs[5].w, uvs[5].y + uvs[5].h),
                new Vector3(1, 1, 1, uvs[5].x + uvs[5].w, uvs[5].y),
                { r: 128, g: 0, b: 128 }, size)]);
        this.size = size;
    }
}