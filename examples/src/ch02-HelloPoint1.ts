// HelloPoint1.js (c) 2012 matsuda
// Vertex shader program 
//顶点着色器
var VSHADER_SOURCE =
    'void main() {\n' +
    '  gl_Position = vec4(0.0, 0.0, 0.0, 1.0);\n' + // 设置点的顶点坐标
    '  gl_PointSize = 60.0;\n' +                    // 设置点大小
    '}\n';

// Fragment shader program
//片段着色器
var FSHADER_SOURCE =
    'void main() {\n' +
    '  gl_FragColor = vec4(1.0, 1.0, 0.0, 1.0);\n' + // 设置点颜色
    '}\n';

class HelloPoint1 {
    constructor() {
        // 获取画布<canvas>元素
        var canvas = document.getElementById('webgl') as HTMLCanvasElement;

        // 获取WebGL的渲染上下文
        var gl:CHWebGLRenderingContext = cuonUtils.getWebGLContext(canvas) as CHWebGLRenderingContext;
        if (!gl) {
            console.log('Failed to get the rendering context for WebGL');
            return;
        }

        // 初始化着色器
        if (!cuonUtils.initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
            console.log('Failed to intialize shaders.');
            return;
        }

        // 指定清空 <canvas> 的颜色
        gl.clearColor(0.0, 0.0, 0.0, 1.0);

        // 清空 <canvas>
        gl.clear(gl.COLOR_BUFFER_BIT);

        // 绘制点
        gl.drawArrays(gl.POINTS, 0, 1);
    }
}