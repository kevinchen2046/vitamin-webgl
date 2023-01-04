// RotatingTriangle_contextLost.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE = 'attribute vec4 a_Position;\n' +
    'uniform mat4 u_ModelMatrix;\n' +
    'void main() {\n' +
    '  gl_Position = u_ModelMatrix * a_Position;\n' +
    '}\n';
// Fragment shader program
var FSHADER_SOURCE = 'void main() {\n' +
    '  gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);\n' +
    '}\n';
var RotatingTriangle_contextLost = /** @class */ (function () {
    function RotatingTriangle_contextLost() {
        var _this = this;
        // Current rotation angle
        this.ANGLE_STEP = 45.0;
        // Current rotation angle
        this.g_currentAngle = 0.0; // Changed from local variable to global variable
        // Last time that this function was called
        this.g_last = Date.now();
        // Retrieve <canvas> element
        var canvas = document.getElementById('webgl');
        // Register event handler for context lost and context restored events
        canvas.addEventListener('webglcontextlost', this.contextLost, false);
        canvas.addEventListener('webglcontextrestored', function (ev) { _this.start(canvas); }, false);
        this.start(canvas); // Perform WebGL related processes
    }
    RotatingTriangle_contextLost.prototype.start = function (canvas) {
        var _this = this;
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
        var n = this.initVertexBuffers(gl); // Write the positions of vertices to a vertex shader
        if (n < 0) {
            console.log('Failed to set the positions of the vertices');
            return;
        }
        gl.clearColor(0.0, 0.0, 0.0, 1.0); // Specify the color for clearing <canvas>
        // Get storage location of u_ModelMatrix
        var u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
        if (!u_ModelMatrix) {
            console.log('Failed to get the storage location of u_ModelMatrix');
            return;
        }
        var modelMatrix = new Utils.Matrix4(); // Create a model matrix
        var tick = function () {
            _this.g_currentAngle = _this.animate(_this.g_currentAngle); // Update current rotation angle
            _this.draw(gl, n, _this.g_currentAngle, modelMatrix, u_ModelMatrix); // Draw the triangle
            _this.g_requestID = requestAnimationFrame(tick); // Reregister this Function again
        };
        tick();
    };
    RotatingTriangle_contextLost.prototype.contextLost = function (ev) {
        cancelAnimationFrame(this.g_requestID); //  Stop animation
        ev.preventDefault(); // Prevent the default behavior
    };
    RotatingTriangle_contextLost.prototype.initVertexBuffers = function (gl) {
        var vertices = new Float32Array([
            0.0, 0.5, -0.5, -0.5, 0.5, -0.5
        ]);
        var n = 3; // The number of vertices
        // Create a buffer object
        var vertexBuffer = gl.createBuffer();
        if (!vertexBuffer) {
            console.log('Failed to create the buffer object');
            return -1;
        }
        // Bind the buffer object to target
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
        // Write date into the buffer object
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
        // Assign the buffer object to a_Position variable
        var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
        if (a_Position < 0) {
            console.log('Failed to get the storage location of a_Position');
            return -1;
        }
        gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);
        // Enable the assignment to a_Position variable
        gl.enableVertexAttribArray(a_Position);
        // Unbind the buffer object
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        return n;
    };
    RotatingTriangle_contextLost.prototype.draw = function (gl, n, currentAngle, modelMatrix, u_ModelMatrix) {
        // Set the rotation matrix
        modelMatrix.setRotate(currentAngle, 0, 0, 1);
        // Pass the rotation matrix to the vertex shader
        gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
        // Clear <canvas>
        gl.clear(gl.COLOR_BUFFER_BIT);
        // Draw the rectangle
        gl.drawArrays(gl.TRIANGLES, 0, n);
    };
    RotatingTriangle_contextLost.prototype.animate = function (angle) {
        // Calculate the elapsed time
        var now = Date.now();
        var elapsed = now - this.g_last;
        this.g_last = now;
        // Update the current rotation angle (adjusted by the elapsed time)
        var newAngle = angle + (this.ANGLE_STEP * elapsed) / 1000.0;
        return newAngle %= 360;
    };
    return RotatingTriangle_contextLost;
}());
//# sourceMappingURL=ch10-RotatingTriangle_contextLost.js.map