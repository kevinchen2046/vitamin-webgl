import { D3Face, Vector3 } from "./D3Face";

export class D3Geometry {
    public uvs: number[];
    public vertexes: number[];
    public colors: number[];
    constructor(...args) {
        this.vertexes = []
        this.colors = []
        for (let i = 0; i < args.length; i++) {
            let p: Vector3 = args[i];
            this.vertexes.push(...p.vec3);
            this.colors.push(p.color.r, p.color.g, p.color.b);
        }
    }

}

export class Cube extends D3Geometry {
    public faces: D3Face[];
    constructor(size: number = 20) {
        let faces = [
            //forward
            new D3Face(
                -1, 1, 1,
                -1, -1, 1,
                1, -1, 1,
                1, 1, 1,
                { r: 255, g: 0, b: 0 }, size, true),
            //behind
            new D3Face(
                -1, 1, -1,
                -1, -1, -1,
                1, -1, -1,
                1, 1, -1,
                { r: 0, g: 255, b: 0 }, size),
            //left
            new D3Face(
                -1, -1, 1,
                -1, -1, -1,
                -1, 1, -1,
                -1, 1, 1,
                { r: 0, g: 0, b: 255 }, size),
            //right
            new D3Face(
                1, -1, 1,
                1, -1, -1,
                1, 1, -1,
                1, 1, 1,
                { r: 128, g: 128, b: 0 }, size, true),
            //up
            new D3Face(
                -1, -1, 1,
                -1, -1, -1,
                1, -1, -1,
                1, -1, 1,
                { r: 0, g: 128, b: 128 }, size, true),
            //bottom
            new D3Face(
                -1, 1, 1,
                -1, 1, -1,
                1, 1, -1,
                1, 1, 1,
                { r: 128, g: 0, b: 128 }, size)];
        let vectors=[];
          
        for(let i=0;i<faces.length;i++){
            vectors=vectors.concat(faces[i].vectors);
        }
        let uvs=[
            ...faces[0].vectors.map(v=>[v.x,v.y]),
            ...faces[1].vectors.map(v=>[v.x,v.y]),
            ...faces[2].vectors.map(v=>[v.y,v.z]),
            ...faces[3].vectors.map(v=>[v.y,v.z]),
            ...faces[4].vectors.map(v=>[v.x,v.z]),
            ...faces[5].vectors.map(v=>[v.x,v.z])
        ];  
        super(...vectors);
        this.faces = faces;
        this.uvs=uvs.reduce((p,c)=>p.concat(c)).map(v=>(v/size+1)/4);
        // return new D3Geometry(
        //     ...D3Face.create(
        //         -1, 1, 1,
        //         -1, -1, 1,
        //         1, -1, 1,
        //         1, 1, 1,
        //         { r: 255, g: 0, b: 0 }, size, true),
        //     ...D3Face.create(
        //         -1, 1, -1,
        //         -1, -1, -1,
        //         1, -1, -1,
        //         1, 1, -1,
        //         { r: 0, g: 255, b: 0 }, size),
        //     ...D3Face.create(
        //         -1, -1, 1,
        //         -1, -1, -1,
        //         -1, 1, -1,
        //         -1, 1, 1,
        //         { r: 0, g: 0, b: 255 }, size),
        //     ...D3Face.create(
        //         1, -1, 1,
        //         1, -1, -1,
        //         1, 1, -1,
        //         1, 1, 1,
        //         { r: 128, g: 128, b: 0 }, size, true),
        //     ...D3Face.create(
        //         -1, -1, 1,
        //         -1, -1, -1,
        //         1, -1, -1,
        //         1, -1, 1,
        //         { r: 0, g: 128, b: 128 }, size, true),
        //     ...D3Face.create(
        //         -1, 1, 1,
        //         -1, 1, -1,
        //         1, 1, -1,
        //         1, 1, 1,
        //         { r: 128, g: 0, b: 128 }, size)
        // );
    }
}