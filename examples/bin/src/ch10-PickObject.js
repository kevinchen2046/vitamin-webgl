// PickObject.js (c) 2012 matsuda and kanda
// Vertex shader program
var VSHADER_SOURCE = 'attribute vec4 a_Position;\n' +
    'attribute vec4 a_Color;\n' +
    'uniform mat4 u_MvpMatrix;\n' +
    'uniform bool u_Clicked;\n' + // Mouse is pressed
    'varying vec4 v_Color;\n' +
    'void main() {\n' +
    '  gl_Position = u_MvpMatrix * a_Position;\n' +
    '  if (u_Clicked) {\n' + //  Draw in red if mouse is pressed
    '    v_Color = vec4(1.0, 0.0, 0.0, 1.0);\n' +
    '  } else {\n' +
    '    v_Color = a_Color;\n' +
    '  }\n' +
    '}\n';
// Fragment shader program
var FSHADER_SOURCE = '#ifdef GL_ES\n' +
    'precision mediump float;\n' +
    '#endif\n' +
    'varying vec4 v_Color;\n' +
    'void main() {\n' +
    '  gl_FragColor = v_Color;\n' +
    '}\n';
var ANGLE_STEP = 20.0; // Rotation angle (degrees/second)
var PickObject = /** @class */ (function () {
    function PickObject() {
        var _this = this;
        this.g_MvpMatrix = new Utils.Matrix4(); // Model view projection matrix
        this.last = Date.now(); // Last time that this function was called
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
        // Get the storage locations of uniform variables
        var u_MvpMatrix = gl.getUniformLocation(gl.program, 'u_MvpMatrix');
        var u_Clicked = gl.getUniformLocation(gl.program, 'u_Clicked');
        if (!u_MvpMatrix || !u_Clicked) {
            console.log('Failed to get the storage location of uniform variable');
            return;
        }
        // Calculate the view projection matrix
        var viewProjMatrix = new Utils.Matrix4();
        viewProjMatrix.setPerspective(30.0, canvas.width / canvas.height, 1.0, 100.0);
        viewProjMatrix.lookAt(0.0, 0.0, 7.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0);
        gl.uniform1i(u_Clicked, 0); // Pass false to u_Clicked
        var currentAngle = 0.0; // Current rotation angle
        // Register the event handler
        canvas.onmousedown = function (ev) {
            var x = ev.clientX, y = ev.clientY;
            var rect = ev.target.getBoundingClientRect();
            if (rect.left <= x && x < rect.right && rect.top <= y && y < rect.bottom) {
                // If pressed position is inside <canvas>, check if it is above object
                var x_in_canvas = x - rect.left, y_in_canvas = rect.bottom - y;
                var picked = _this.check(gl, n, x_in_canvas, y_in_canvas, currentAngle, u_Clicked, viewProjMatrix, u_MvpMatrix);
                if (picked)
                    alert('The cube was selected! ');
            }
        };
        var tick = function () {
            currentAngle = _this.animate(currentAngle);
            _this.draw(gl, n, currentAngle, viewProjMatrix, u_MvpMatrix);
            requestAnimationFrame(tick);
        };
        tick();
    }
    PickObject.prototype.initVertexBuffers = function (gl) {
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
            0.2, 0.58, 0.82, 0.2, 0.58, 0.82, 0.2, 0.58, 0.82, 0.2, 0.58, 0.82,
            0.5, 0.41, 0.69, 0.5, 0.41, 0.69, 0.5, 0.41, 0.69, 0.5, 0.41, 0.69,
            0.0, 0.32, 0.61, 0.0, 0.32, 0.61, 0.0, 0.32, 0.61, 0.0, 0.32, 0.61,
            0.78, 0.69, 0.84, 0.78, 0.69, 0.84, 0.78, 0.69, 0.84, 0.78, 0.69, 0.84,
            0.32, 0.18, 0.56, 0.32, 0.18, 0.56, 0.32, 0.18, 0.56, 0.32, 0.18, 0.56,
            0.73, 0.82, 0.93, 0.73, 0.82, 0.93, 0.73, 0.82, 0.93, 0.73, 0.82, 0.93, // v4-v7-v6-v5 back
        ]);
        // Indices of the vertices
        var indices = new Uint8Array([
            0, 1, 2, 0, 2, 3,
            4, 5, 6, 4, 6, 7,
            8, 9, 10, 8, 10, 11,
            12, 13, 14, 12, 14, 15,
            16, 17, 18, 16, 18, 19,
            20, 21, 22, 20, 22, 23 // back
        ]);
        // Write vertex information to buffer object
        if (!this.initArrayBuffer(gl, vertices, gl.FLOAT, 3, 'a_Position'))
            return -1; // Coordinate Information
        if (!this.initArrayBuffer(gl, colors, gl.FLOAT, 3, 'a_Color'))
            return -1; // Color Information
        // Create a buffer object
        var indexBuffer = gl.createBuffer();
        if (!indexBuffer) {
            return -1;
        }
        // Write the indices to the buffer object
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);
        return indices.length;
    };
    PickObject.prototype.check = function (gl, n, x, y, currentAngle, u_Clicked, viewProjMatrix, u_MvpMatrix) {
        var picked = false;
        gl.uniform1i(u_Clicked, 1); // Pass true to u_Clicked
        this.draw(gl, n, currentAngle, viewProjMatrix, u_MvpMatrix); // Draw cube with red
        // Read pixel at the clicked position
        var pixels = new Uint8Array(4); // Array for storing the pixel value
        gl.readPixels(x, y, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
        if (pixels[0] == 255) // The mouse in on cube if R(pixels[0]) is 255
            picked = true;
        gl.uniform1i(u_Clicked, 0); // Pass false to u_Clicked(rewrite the cube)
        this.draw(gl, n, currentAngle, viewProjMatrix, u_MvpMatrix); // Draw the cube
        return picked;
    };
    PickObject.prototype.draw = function (gl, n, currentAngle, viewProjMatrix, u_MvpMatrix) {
        // Caliculate The model view projection matrix and pass it to u_MvpMatrix
        this.g_MvpMatrix.set(viewProjMatrix);
        this.g_MvpMatrix.rotate(currentAngle, 1.0, 0.0, 0.0); // Rotate appropriately
        this.g_MvpMatrix.rotate(currentAngle, 0.0, 1.0, 0.0);
        this.g_MvpMatrix.rotate(currentAngle, 0.0, 0.0, 1.0);
        gl.uniformMatrix4fv(u_MvpMatrix, false, this.g_MvpMatrix.elements);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT); // Clear buffers
        gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0); // Draw
    };
    PickObject.prototype.animate = function (angle) {
        var now = Date.now(); // Calculate the elapsed time
        var elapsed = now - this.last;
        this.last = now;
        // Update the current rotation angle (adjusted by the elapsed time)
        var newAngle = angle + (ANGLE_STEP * elapsed) / 1000.0;
        return newAngle % 360;
    };
    PickObject.prototype.initArrayBuffer = function (gl, data, type, num, attribute) {
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
        // Enable the assignment to a_attribute variable
        gl.enableVertexAttribArray(a_attribute);
        return true;
    };
    return PickObject;
}());
//# sourceMappingURL=ch10-PickObject.js.map