// HelloPint2.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE = 'attribute vec4 a_Position;\n' + // attribute variable
    'void main() {\n' +
    '  gl_Position = a_Position;\n' +
    '  gl_PointSize = 10.0;\n' +
    '}\n';
// Fragment shader program
var FSHADER_SOURCE = 'void main() {\n' +
    '  gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);\n' +
    '}\n';
var HelloPoint2 = /** @class */ (function () {
    function HelloPoint2() {
        // Retrieve <canvas> element
        var canvas = document.getElementById('webgl');
        // Get the rendering context for WebGL
        var gl = Utils.getWebGLContext(canvas);
        if (!gl) {
            console.log('Failed to get the rendering context for WebGL');
            return;
        }
        // Initialize shaders
        if (!Utils.initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
            console.log('Failed to intialize shaders.');
            return;
        }
        // 获取a_Position的存储位置
        var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
        if (a_Position < 0) {
            console.log('Failed to get the storage location of a_Position');
            return;
        }
        // 将顶点位置传递给属性变量
        gl.vertexAttrib3f(a_Position, 0.0, 0.0, 0.0);
        // Specify the color for clearing <canvas>
        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        // Clear <canvas>
        gl.clear(gl.COLOR_BUFFER_BIT);
        // 绘制
        gl.drawArrays(gl.POINTS, 0, 1);
    }
    return HelloPoint2;
}());
//# sourceMappingURL=HelloPoint2.js.map