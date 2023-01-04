// ColoredCube_singleColor.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE = 'attribute vec4 a_Position;\n' +
    'attribute vec4 a_Color;\n' +
    'uniform mat4 u_MvpMatrix;\n' +
    'varying vec4 v_Color;\n' +
    'void main() {\n' +
    '  gl_Position = u_MvpMatrix * a_Position;\n' +
    '  v_Color = a_Color;\n' +
    '}\n';
// Fragment shader program
var FSHADER_SOURCE = '#ifdef GL_ES\n' +
    'precision mediump float;\n' +
    '#endif\n' +
    'varying vec4 v_Color;\n' +
    'void main() {\n' +
    '  gl_FragColor = v_Color;\n' +
    '}\n';
var ColoredCube_singleColor = /** @class */ (function () {
    function ColoredCube_singleColor() {
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
        // Set the vertex information
        var n = this.initVertexBuffers(gl);
        if (n < 0) {
            console.log('Failed to set the vertex information');
            return;
        }
        // Set the clear color and enable the depth test
        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.enable(gl.DEPTH_TEST);
        // Get the storage location of u_MvpMatrix
        var u_MvpMatrix = gl.getUniformLocation(gl.program, 'u_MvpMatrix');
        if (!u_MvpMatrix) {
            console.log('Failed to get the storage location of u_MvpMatrix');
            return;
        }
        // Set the eye point and the viewing volume
        var mvpMatrix = new Utils.Matrix4();
        mvpMatrix.setPerspective(30, 1, 1, 100);
        mvpMatrix.lookAt(3, 3, 7, 0, 0, 0, 0, 1, 0);
        // Pass the model view projection matrix to u_MvpMatrix
        gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements);
        // Clear color and depth buffer
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        // Draw the cube
        gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0);
    }
    ColoredCube_singleColor.prototype.initVertexBuffers = function (gl) {
        // Create a cube
        //    v6----- v5
        //   /|      /|
        //  v1------v0|
        //  | |     | |
        //  | |v7---|-|v4
        //  |/      |/
        //  v2------v3
        var vertices = new Float32Array([
            1.0, 1.0, 1.0, -1.0, 1.0, 1.0, -1.0, -1.0, 1.0, 1.0, -1.0, 1.0,
            1.0, 1.0, 1.0, 1.0, -1.0, 1.0, 1.0, -1.0, -1.0, 1.0, 1.0, -1.0,
            1.0, 1.0, 1.0, 1.0, 1.0, -1.0, -1.0, 1.0, -1.0, -1.0, 1.0, 1.0,
            -1.0, 1.0, 1.0, -1.0, 1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, 1.0,
            -1.0, -1.0, -1.0, 1.0, -1.0, -1.0, 1.0, -1.0, 1.0, -1.0, -1.0, 1.0,
            1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, 1.0, -1.0, 1.0, 1.0, -1.0 // v4-v7-v6-v5 back
        ]);
        var colors = new Float32Array([
            1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0,
            1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0,
            1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0,
            1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0,
            1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0,
            1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0 // v4-v7-v6-v5 back(white)
        ]);
        var indices = new Uint8Array([
            0, 1, 2, 0, 2, 3,
            4, 5, 6, 4, 6, 7,
            8, 9, 10, 8, 10, 11,
            12, 13, 14, 12, 14, 15,
            16, 17, 18, 16, 18, 19,
            20, 21, 22, 20, 22, 23 // back
        ]);
        // Create a buffer object
        var indexBuffer = gl.createBuffer();
        if (!indexBuffer)
            return -1;
        // Write the vertex coordinates and color to the buffer object
        if (!this.initArrayBuffer(gl, vertices, 3, gl.FLOAT, 'a_Position'))
            return -1;
        if (!this.initArrayBuffer(gl, colors, 3, gl.FLOAT, 'a_Color'))
            return -1;
        // Write the indices to the buffer object
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);
        return indices.length;
    };
    ColoredCube_singleColor.prototype.initArrayBuffer = function (gl, data, num, type, attribute) {
        // Create a buffer object
        var buffer = gl.createBuffer();
        if (!buffer) {
            console.log('Failed to create the buffer object');
            return false;
        }
        // Write date into the buffer object
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
        // Assign the buffer object to the attribute variable
        var a_attribute = gl.getAttribLocation(gl.program, attribute);
        if (a_attribute < 0) {
            console.log('Failed to get the storage location of ' + attribute);
            return false;
        }
        gl.vertexAttribPointer(a_attribute, num, type, false, 0, 0);
        // Enable the assignment of the buffer object to the attribute variable
        gl.enableVertexAttribArray(a_attribute);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        return true;
    };
    return ColoredCube_singleColor;
}());
//# sourceMappingURL=ch07-ColoredCube_singleColor.js.map