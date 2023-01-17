import { EnumUtil } from "../utils/EnumUtil";


function getClazzName(clazz) {
    if (clazz.prototype) {
        return clazz.prototype.constructor.name
    }
    return clazz.constructor.name;
}
function createGlslObject() {
    return {
        attributes: [],
        uniforms: [],
        varyings: [],
        methods: [],
        precision: ""
    } as GLSLInfo;
}
type GLSLInfo = {
    attributes: { name: string, type: DefinedType }[],
    uniforms: { name: string, type: DefinedType, length?: number }[],
    varyings: { name: string, type: DefinedType }[],
    methods: { content: string, types: { params: DefinedType | DefinedType[], type: DefinedType } }[],
    precision: string
}
let glslMap: { [clzname: string]: GLSLInfo } = {};
export function precision(type: PrecisionType) {
    return function (clazz) {
        let clzname = getClazzName(clazz);
        if (!glslMap[clzname]) glslMap[clzname] = createGlslObject();
        glslMap[clzname].precision = `#ifdef GL_ES\n  precision ${EnumUtil.getKey(PrecisionType, type)} float;\n#endif`
    }
}

export enum PrecisionType {
    /**精确度低 */
    lowp,
    /**精确度中 */
    mediump,
    /**精确度高 */
    highp
}
export enum Define {
    /**存储值 */
    attribute,
    /**固定值 */
    uniform,
    /**传递值 */
    varying
}

export enum DefinedType {
    sampler2D, float, float_array, vec2, vec3, vec4, mat2, mat3, mat4, int
}

let DefinedTypeData = {};

function Property(type: string) {
    return function (clazz: any, ...args) {
        let clzname = getClazzName(clazz);
        DefinedTypeData[EnumUtil.getValue(DefinedType, clzname)] = EnumUtil.getValue(DefinedType, type);
    }
}

export type float = number;

class data_struct {
    set __(v:any){}
    get __() { return null as any }
}

export class vec2 extends data_struct {

    @Property("float")
    x: float;
    @Property("float")
    y: float;

    constructor(x?: float, y?: float) {
        super();
        this.x = x;
        this.y = y;
    }
    get xy() {
        return new vec2(this.x, this.y);
    }
}

export class vec3 extends data_struct {

    @Property("float")
    x: float;
    @Property("float")
    y: float;
    @Property("float")
    z: float;

    constructor(x?: float, y?: float, z?: float) {
        super();
        this.x = x ?? 0;
        this.y = y ?? 0;
        this.z = z ?? 0;
    }

    get r() { return this.x }
    get g() { return this.y }
    get b() { return this.z }

    get xy() { return new vec3(this.x, this.y); }
    get xyz() { return new vec3(this.x, this.y, this.z); }
    get yx() { return new vec3(this.x, this.y); }
    get yxz() { return new vec3(this.x, this.y, this.z); }

    get xz() { return new vec3(this.x, 0, this.z); }
    get xzy() { return new vec3(this.x, this.y, this.z); }
    get zx() { return new vec3(this.x, 0, this.z); }
    get zxy() { return new vec3(this.x, this.y, this.z); }

    get yz() { return new vec3(0, this.y, this.z); }
    get yzx() { return new vec3(this.x, this.y, this.z); }
    get zy() { return new vec3(0, this.y, this.z); }
    get zyx() { return new vec3(this.x, this.y, this.z); }

    ////
    get rg() { return new vec3(this.x, this.y); }
    get rgb() { return new vec3(this.x, this.y, this.z); }
    get gr() { return new vec3(this.x, this.y); }
    get grb() { return new vec3(this.x, this.y, this.z); }

    get rb() { return new vec3(this.x, 0, this.z); }
    get rbg() { return new vec3(this.x, this.y, this.z); }
    get br() { return new vec3(this.x, 0, this.z); }
    get brg() { return new vec3(this.x, this.y, this.z); }

    get gb() { return new vec3(0, this.y, this.z); }
    get gbr() { return new vec3(this.x, this.y, this.z); }
    get bg() { return new vec3(0, this.y, this.z); }
    get bgr() { return new vec3(this.x, this.y, this.z); }
}

export class vec4 extends data_struct {

    @Property("float")
    x: float;
    @Property("float")
    y: float;
    @Property("float")
    z: float;
    @Property("float")
    w: float;

    constructor(x?: float, y?: float, z?: float, w?: float) {
        super();
        this.x = x ?? 0;
        this.y = y ?? 0;
        this.z = z ?? 0;
        this.w = w ?? 0;
    }

    get r() { return this.x }
    get g() { return this.y }
    get b() { return this.z }
    get a() { return this.w }

    get xy() { return new vec4(this.x, this.y); }
    get xyz() { return new vec4(this.x, this.y, this.z); }
    get xyzw() { return new vec4(this.x, this.y, this.z, this.w); }
    get xywz() { return new vec4(this.x, this.y, this.z, this.w); }
    get yx() { return new vec4(this.x, this.y); }
    get yxz() { return new vec4(this.x, this.y, this.z); }
    get yxzw() { return new vec4(this.x, this.y, this.z, this.w); }
    get yxwz() { return new vec4(this.x, this.y, this.z, this.w); }

    get xz() { return new vec4(this.x, 0, this.z); }
    get xzy() { return new vec4(this.x, this.y, this.z); }
    get xzyw() { return new vec4(this.x, this.y, this.z, this.w); }
    get zx() { return new vec4(this.x, 0, this.z); }
    get zxy() { return new vec4(this.x, this.y, this.z); }
    get zxyw() { return new vec4(this.x, this.y, this.z, this.w); }

    get yz() { return new vec4(0, this.y, this.z); }
    get yzx() { return new vec4(this.x, this.y, this.z); }
    get yzxw() { return new vec4(this.x, this.y, this.z, this.w); }
    get zy() { return new vec4(0, this.y, this.z); }
    get zyx() { return new vec4(this.x, this.y, this.z); }
    get zyxw() { return new vec4(this.x, this.y, this.z, this.w); }

    get xw() { return new vec4(0, 0, this.z, this.w); }
    get xwy() { return new vec4(this.x, 0, this.z, this.w); }
    get xwyz() { return new vec4(this.x, this.y, this.z, this.w); }
    get wx() { return new vec4(this.x, 0, 0, this.w); }
    get wxy() { return new vec4(this.x, this.y, 0, this.w); }
    get wxyz() { return new vec4(this.x, this.y, this.z, this.w); }

    get yw() { return new vec4(0, this.y, 0, this.w); }
    get ywx() { return new vec4(this.x, this.y, 0, this.w); }
    get ywxz() { return new vec4(this.x, this.y, this.z, this.w); }
    get wy() { return new vec4(0, this.y, 0, this.w); }
    get wyx() { return new vec4(this.x, this.y, 0, this.w); }
    get wyxz() { return new vec4(this.x, this.y, this.z, this.w); }

    ////
    get rg() { return new vec4(this.x, this.y); }
    get rgb() { return new vec4(this.x, this.y, this.z); }
    get gr() { return new vec4(this.x, this.y); }
    get grb() { return new vec4(this.x, this.y, this.z); }

    get rb() { return new vec4(this.x, 0, this.z); }
    get rbg() { return new vec4(this.x, this.y, this.z); }
    get br() { return new vec4(this.x, 0, this.z); }
    get brg() { return new vec4(this.x, this.y, this.z); }

    get gb() { return new vec4(0, this.y, this.z); }
    get gbr() { return new vec4(this.x, this.y, this.z); }
    get bg() { return new vec4(0, this.y, this.z); }
    get bgr() { return new vec4(this.x, this.y, this.z); }
}

export class mat2 extends data_struct { }
export class mat3 extends data_struct { }
export class mat4 extends data_struct { }

export class sampler2D { }
export class samplerCube { }

export function __vec2(x: float, y: float) {
    return new vec2();
}
export function __vec3(x: float, y: float, z: float) {
    return new vec3();
}
export function __vec4(x: float, y?: float, z?: float, w?: float) {
    return new vec4();
}

/////////////////////////内置函数/////////////////////////////////

///////////////////角度函数和三角函数
/**角度值转弧度值 */
export function radians<T = float | vec2 | vec3 | vec4>(v: T): T { return null; }
/**弧度值转角度值 */
export function degrees<T = float | vec2 | vec3 | vec4>(v: T): T { return null; }
/**正弦值 */
export function sin<T = float | vec2 | vec3 | vec4>(v: T): T { return null; }
/**余弦值 */
export function cos<T = float | vec2 | vec3 | vec4>(v: T): T { return null; }
/**正切值 */
export function tan<T = float | vec2 | vec3 | vec4>(v: T): T { return null; }
/**反正弦值(弧度) */
export function asin<T = float | vec2 | vec3 | vec4>(v: T): T { return null; }
/**反余弦值(弧度) */
export function acos<T = float | vec2 | vec3 | vec4>(v: T): T { return null; }
/**反正切值(弧度) */
export function atan<T = float | vec2 | vec3 | vec4>(v: T): T { return null; }
///////////////////几何函数
/**向量a长度 */
export function length<T = vec2 | vec3>(a: T): float { return null; }
/**a、b两点之间距离 */
export function distance<T = vec2 | vec3>(a: T, b: T): T { return null; }
/**两向量点积*/
export function dot<T = vec2 | vec3>(a: T, b: T): T { return null; }
/**两向量叉乘*/
export function cross<T = vec2 | vec3>(a: T, b: T): T { return null; }
/**向量a归一化,长度变为1，方向不变，即返回值单位向量*/
export function normalize<T = vec2 | vec3>(a: T): T { return null; }
/**向量朝前：如果c、b两向量点乘小于0(dot(c,b) < 0)，则返回a，否则返回-a*/
export function faceforward<T = vec2 | vec3>(a: T, b: T, c: T): T { return null; }
/**向量反射：比如通过入射光计算反射光方向向量,Fa表示反射平面的法线方向(单位向量)，Ru表示入射光线的方向(单位向量)，Zh表示折射率*/
export function reflect<T = vec2 | vec3>(Ru: T, Fa: T, Zh?: T): T { return null; }
///////////////////指数函数
/**x的n次幂函数*/
export function pow<T = float | vec2 | vec3 | vec4>(x: T, n: float): T { return null; }
/**x的自然指数e*/
export function exp<T = float | vec2 | vec3 | vec4>(x): T { return null; }
/**x自然对数*/
export function log<T = float | vec2 | vec3 | vec4>(x): T { return null; }
/**2的指数x*/
export function exp2<T = float | vec2 | vec3 | vec4>(x): T { return null; }
/**对数函数，底数为2*/
export function log2<T = float | vec2 | vec3 | vec4>(): T { return null; }
/**平方根*/
export function sqrt<T = float | vec2 | vec3 | vec4>(): T { return null; }
/**平方根倒数*/
export function inversesqrt<T = float | vec2 | vec3 | vec4>(): T { return null; }
///////////////////通用函数
/**绝对值*/
export function abs<T = float | vec2 | vec3 | vec4>(x): T { return null; }
/**判断参数符号，x是正数返回1.0；x是0.0返回0.0，x是负数返回 - 1.0*/
export function sign<T = float | vec2 | vec3 | vec4>(x): T { return null; }
/**取整，向下取整*/
export function floor<T = float | vec2 | vec3 | vec4>(x): T { return null; }
/**取整，向上取整*/
export function ceil<T = float | vec2 | vec3 | vec4>(x): T { return null; }
/**返回x小数部分*/
export function fract<T = float | vec2 | vec3 | vec4>(x): T { return null; }
/**比较大小，返回较小的值*/
export function min<T = float | vec2 | vec3 | vec4>(a, b): T { return null; }
/**比较大小，返回较大的值*/
export function max<T = float | vec2 | vec3 | vec4>(a, b): T { return null; }
/**表示x–y * floor(x / y)*/
export function mod<T = float | vec2 | vec3 | vec4>(x, y): T { return null; }
/**规整输入值, x与min和max比较大小返回中间大小的值，运算规则：min(max(x, min), max)*/
export function clamp<T = float | vec2 | vec3 | vec4>(x, min, max): T { return null; }
/**线性插值计算, 插值区间[m, n], 插值系数k，插值计算公式：m(1 - k) + nk*/
export function mix<T = float | vec2 | vec3 | vec4>(m, n, k): T { return null; }
///////////////////矩阵函数
/**同行同列的元素相乘 */
export function matrixCompMult<T = mat2 | mat3 | mat4>(x: T, y: T): T { return null; }
///////////////////向量关系函数
/**x是否小于y, 参数是vec或ivec*/
export function lessThan<T = float | vec2 | vec3 | vec4>(x, y): T { return null; }
/**x是否小于或等于y, 参数是vec或ivec*/
export function lessThanEqual<T = float | vec2 | vec3 | vec4>(x, y): T { return null; }
/**x是否大于y, 参数是vec或ivec*/
export function greaterThan<T = float | vec2 | vec3 | vec4>(x, y): T { return null; }
/**x是否大于或等于y, 参数是vec或ivec*/
export function greaterThanEqual<T = float | vec2 | vec3 | vec4>(x, y): T { return null; }
/**x是否等于y，向量每个分量是否都相等, 参数是vec或ivec*/
export function equal<T = float | vec2 | vec3 | vec4>(x, y): T { return null; }
/**x向量是否存在一个分量是true，参数是bvec*/
export function any<T = float | vec2 | vec3 | vec4>(x): T { return null; }
/**x向量所有分量是否全部为true ，参数是bvec*/
export function all<T = float | vec2 | vec3 | vec4>(x): T { return null; }
/**x所有分量执行逻辑非运算 ，参数是bvec*/
export function not<T = float | vec2 | vec3 | vec4>(x): T { return null; }
///////////////////纹理采样函数
/**
 * 2d纹理采样函数
 * @param sampler 
 * @param uv 
 * @param k 在为具有mipmap的纹理计算适当的细节级别之后，在执行实际纹理查找操作之前添加偏差
 * @returns 
 */
export function texture2D(sampler: sampler2D, uv: vec2, k?: float) {
    return new vec4();
}
/**
 * 立方体纹理采样函数
 * @param sampler 
 * @param uv 
 * @param k 在为具有mipmap的纹理计算适当的细节级别之后，在执行实际纹理查找操作之前添加偏差
 * @returns 
 */
export function textureCube(sampler: samplerCube, uv: vec2, k?: float) {
    return new vec4();
}
///////////////////其他函数
/**根据两个数值生成阶梯函数
 * - 如果`x<edge`则返回`0.0`
 * - 否则返回`1.0`
 */
export function step<T = float | vec2 | vec3 | vec4>(edge: T, x: T): T { return null; }
/**
 * 经过Hermite插值的阶梯函数。
 * - 如果`x<=edge0`则返回`0.0`，
 * - 如果`x>=edge1`则返回`1.0`，
 * - 否则按照如下方法返回插值
 * ----
 * ```c#
 * 
 * (float|vec2|vec3|vec4) t;
 * t=clamp((x-edge0)/(edge1-edge0),0,1);
 * return t*t*(3-2*t);
 * 
 * ```
 */
export function smoothstep<T = float | vec2 | vec3 | vec4>(edge0: T, edge1: T, x: T): T { return null; }

//////////////////////////////////////////////////

/**存储值 */
export function attribute(type: DefinedType) {
    return function (clazz, name: string) {
        let clzname = getClazzName(clazz);
        if (!glslMap[clzname]) glslMap[clzname] = createGlslObject();
        if (!glslMap[clzname].attributes) glslMap[clzname].attributes = [];
        let attributes = glslMap[clzname].attributes;
        attributes.push({ name: name, type: type });
    }
}

/**固定值 */
export function uniform(type: DefinedType, length?: number) {
    return function (clazz, name: string) {
        let clzname = getClazzName(clazz);
        if (!glslMap[clzname]) glslMap[clzname] = createGlslObject();
        if (!glslMap[clzname].uniforms) glslMap[clzname].uniforms = [];
        let uniforms = glslMap[clzname].uniforms;
        uniforms.push({ name: name, type: type, length: length });
    }
}

/**传递值 */
export function varying(type: DefinedType) {
    return function (clazz, name: string) {
        let clzname = getClazzName(clazz);
        if (!glslMap[clzname]) glslMap[clzname] = createGlslObject();
        if (!glslMap[clzname].varyings) glslMap[clzname].varyings = [];
        let varyings = glslMap[clzname].varyings;
        varyings.push({ name: name, type: type });
    }
}

/**
 * 定义函数
 * @param params 参数类型 - 类型相同时只需传入首个类型
 * @param type 函数类型 - 返回类型
 * @returns 
 */
export function method(params: DefinedType | DefinedType[], type: DefinedType) {
    return function (clazz, name: string) {
        let clzname = getClazzName(clazz);
        if (!glslMap[clzname]) glslMap[clzname] = createGlslObject();
        if (!glslMap[clzname].methods) glslMap[clzname].methods = [];
        let methods = glslMap[clzname].methods;
        methods.push({ content: clazz[name].toString(), types: { params: params, type: type } });
    }
}

function isWhitespace(character) {
    switch (character) {
        case " ":
        case "\t":
        case "\r":
        case "\n":
        case "\f":
        case "  ":
            return true;
        default:
            return false;
    }
}
function trimLeft(v: string) {
    let i = 0;
    while (i < v.length) {
        if (isWhitespace(v.charAt(i))) { i++; continue; }
        break;
    }
    return v.substring(i);
}
function trimRight(v: string) {
    let i = v.length - 1;
    while (i >= 0) {
        if (isWhitespace(v.charAt(i))) { i--; continue; }
        break;
    }
    return v.substring(0, i);
}
function trim(v: string) {
    v = trimLeft(v);
    v = trimRight(v);
    return v;
}
/**字符串必须为指定源内字符组成 */
function iscompose(str: string, source: string) {
    let i = 0;
    while (i < str.length) {
        if (source.search(str.charAt(i++)) == -1) return false;
    }
    return true;
}
function getReturnType(expression: string) {
    if (/vec2\(|vec3\(|vec4\(/.test(expression)) {
        let index = expression.lastIndexOf(").");
        if (iscompose(expression.substring(index + 2), "xyzwrgba")) {
            switch (expression.length - index - 2) {
                case 1: return "float";
                case 2: return "vec2";
                case 3: return "vec3";
                case 4: return "vec4";
            }
        }
        if (/vec2\(/.test(expression)) return "vec2";
        if (/vec3\(/.test(expression)) return "vec3";
        if (/vec4\(/.test(expression)) return "vec4";
    }
    return "float";
}

export function getGlslInfo(clazz) {
    let clzname = getClazzName(clazz);
    return glslMap[clzname];
}
export function getGlsl(clazz) {
    let clzname = getClazzName(clazz);
    let info = glslMap[clzname];
    return [
        info.precision,
        ...info.attributes.map(v => {
            let type = EnumUtil.getKey(DefinedType, v.type);
            return `attribute ${type} ${v.name};`
        }),
        ...info.uniforms.map(v => {
            let type = EnumUtil.getKey(DefinedType, v.type);
            let length = ``;
            if (v.type == DefinedType.float_array) {
                type = "float";
                length = `[${v.length}]`;
            }

            return `uniform ${type} ${v.name}${length};`
        }),
        ...info.varyings.map(v => {
            let type = EnumUtil.getKey(DefinedType, v.type);
            return `varying ${type} ${v.name};`
        }),
        ...info.methods.map(v => {
            let results = v.content.match(/(\()(.*)(\))/);

            let params = results[2].split(",").map((v1, i) => {
                let type = Array.isArray(v.types.params) ? (i >= v.types.params.length ? v.types.params[v.types.params.length - 1] : v.types.params[i]) : v.types.params;
                return `${EnumUtil.getKey(DefinedType, type)} ${v1.trim()}`;
            });
            let content = `${EnumUtil.getKey(DefinedType, v.types.type)} ${v.content.replace(results[2], params.join(","))}`;
            return content;
        }),
        `void ${((content: string) => {
            let glslIndex = content.search(/(glsl`)|(glsl `)/g);
            if (glslIndex >= 0) {
                return `main() {\n${content.split("`")[1].split("\n").map(v => {
                    v = trimLeft(v);
                    if (v.search("//") == 0) return '';
                    return `    ${v}`;
                }).filter(v => !!v).join("\n")}\n}`;
            }
            let lines = content.split("\n");
            lines = lines.map(v => {
                v = trimLeft(v);
                if (v.search("//") == 0) return '';
                v = v.replace(/this./g, "");
                v = v.replace(/__vec2/g, "vec2");
                v = v.replace(/__vec3/g, "vec3");
                v = v.replace(/__vec4/g, "vec4");
                v = v.replace(/GLSL_[0-9]./g, "");
                v = v.replace(/.__/g, "");
                if (/let |var /g.test(v)) {
                    //todo...类型推断
                    if (v.search("//@") > 0) {
                        let _vectype = v.substring(v.search("//@"))
                        v = v.replace(/let |var /g, `${_vectype.substring(3)} `).replace(_vectype, "");
                    }
                    let expression = v.split("=")[1];
                    expression = trim(expression);
                    let type = getReturnType(expression);
                    v = v.replace(/let |var /g, `${type} `);
                }
                return v;
            }).filter(v => !!v);
            return [lines.slice(0, lines.length - 1).join("\n  "), lines[lines.length - 1]].join("\n")
            //return lines.join("\n   ");
        })(clazz.prototype.main.toString())}`
    ].join("\n");
}
export function glsl(...args) {

}
/**顶点着色器模板 */
export class GLSL_Vertex {
    protected gl_Position: vec4;
    protected main() {
    }
}

/**片段着色器模板 */
export class GLSL_Fragment {
    protected gl_FragColor: vec4;
    // protected u_image: sampler2D;
    protected main() {
    }
}