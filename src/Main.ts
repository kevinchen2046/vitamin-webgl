namespace vitamin {

    let __canvas__: HTMLCanvasElement;
    let __gl__: WebGLRenderingContext

    export function initialize(className: string) {
        var clazz = eval(className);
        if (clazz) {
            __canvas__ = document.getElementById("glcanvas") as HTMLCanvasElement;
            __gl__ = __canvas__.getContext("webgl") || __canvas__.getContext("experimental-webgl") as WebGLRenderingContext;
            new clazz(__gl__);
        }
    }

    export class Example01 {
        constructor(gl: WebGLRenderingContext) {
            var VSHADER_SOURCE =
                'void main() {\n' +
                ' gl_Position = vec4(0.0, 0.0, 0.0, 1.0);\n' +
                ' gl_PointSize = 10.0;\n' +
                '}\n';

            var FSHADER_SOURCE =
                'void main() {\n' +
                ' gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);\n' +
                '}\n';

            var program = gl.createProgram();
            // 创建顶点着色器
            var vShader = gl.createShader(gl.VERTEX_SHADER);
            //创建片元着色器
            var fShader = gl.createShader(gl.FRAGMENT_SHADER);
            //shader容器与着色器绑定
            gl.shaderSource(vShader, VSHADER_SOURCE);
            gl.shaderSource(fShader, FSHADER_SOURCE);
            //将GLSE语言编译成浏览器可用代码
            gl.compileShader(vShader);
            gl.compileShader(fShader);
            //将着色器添加到程序上
            gl.attachShader(program, vShader);
            gl.attachShader(program, fShader);
            //链接程序，在链接操作执行以后，可以任意修改shader的源代码，
            //对shader重新编译不会影响整个程序，除非重新链接程序
            gl.linkProgram(program);
            //加载并使用链接好的程序
            gl.useProgram(program);

            gl.clearColor(0.0, 0.0, 0.0, 1.0);
            gl.clear(gl.COLOR_BUFFER_BIT);
            gl.drawArrays(gl.POINTS, 0, 1);
        }
    }
    export class Example02 {
        constructor(gl: WebGLRenderingContext) {
            //顶点着色器
            var VSHADER_SOURCE = `attribute vec2 a_position;
            void main() {
              gl_Position = vec4(a_position, 0, 1);
            }`;
            //片元着色器
            var FSHADER_SOURCE = `pvoid main() {
                gl_FragColor = vec4(0, 1, 0, 1);  // green
            }`;

            // setup a GLSL program
            var program = gl.createProgram();
            // 创建顶点着色器
            var vShader = gl.createShader(gl.VERTEX_SHADER);
            //创建片元着色器
            var fShader = gl.createShader(gl.FRAGMENT_SHADER);
            //shader容器与着色器绑定
            gl.shaderSource(vShader, VSHADER_SOURCE);
            gl.shaderSource(fShader, FSHADER_SOURCE);
            //将GLSE语言编译成浏览器可用代码
            gl.compileShader(vShader);
            gl.compileShader(fShader);
            //将着色器添加到程序上
            gl.attachShader(program, vShader);
            gl.attachShader(program, fShader);
            //链接程序，在链接操作执行以后，可以任意修改shader的源代码，
            //对shader重新编译不会影响整个程序，除非重新链接程序
            gl.linkProgram(program);
            gl.useProgram(program);

            // look up where the vertex data needs to go.
            var positionLocation = gl.getAttribLocation(program, "a_position");

            // Create a buffer and put a single clipspace rectangle in
            // it (2 triangles)
            var buffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
            gl.bufferData(
                gl.ARRAY_BUFFER,
                new Float32Array([
                    -1.0, -1.0,
                    1.0, -1.0,
                    -1.0, 1.0,
                    -1.0, 1.0,
                    1.0, -1.0,
                    1.0, 1.0]),
                gl.STATIC_DRAW);
            gl.enableVertexAttribArray(positionLocation);
            gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

            // draw
            gl.drawArrays(gl.TRIANGLES, 0, 6);
        }
    }
}