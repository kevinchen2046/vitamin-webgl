// JointModel.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE = 'attribute vec4 a_Position;\n' +
    'attribute vec4 a_Normal;\n' +
    'uniform mat4 u_MvpMatrix;\n' +
    'uniform mat4 u_NormalMatrix;\n' +
    'varying vec4 v_Color;\n' +
    'void main() {\n' +
    '  gl_Position = u_MvpMatrix * a_Position;\n' +
    // Shading calculation to make the arm look three-dimensional
    '  vec3 lightDirection = normalize(vec3(0.0, 0.5, 0.7));\n' + // Light direction
    '  vec4 color = vec4(1.0, 0.4, 0.0, 1.0);\n' +
    '  vec3 normal = normalize((u_NormalMatrix * a_Normal).xyz);\n' +
    '  float nDotL = max(dot(normal, lightDirection), 0.0);\n' +
    '  v_Color = vec4(color.rgb * nDotL + vec3(0.1), color.a);\n' +
    '}\n';
// Fragment shader program
var FSHADER_SOURCE = '#ifdef GL_ES\n' +
    'precision mediump float;\n' +
    '#endif\n' +
    'varying vec4 v_Color;\n' +
    'void main() {\n' +
    '  gl_FragColor = v_Color;\n' +
    '}\n';
var JointModel = /** @class */ (function () {
    function JointModel() {
        var _this = this;
        this.ANGLE_STEP = 3.0; // The increments of rotation angle (degrees)
        this.g_arm1Angle = -90.0; // The rotation angle of arm1 (degrees)
        this.g_joint1Angle = 0.0; // The rotation angle of joint1 (degrees)
        // Coordinate transformation matrix
        this.g_modelMatrix = new Utils.Matrix4();
        this.g_mvpMatrix = new Utils.Matrix4();
        this.g_normalMatrix = new Utils.Matrix4(); // Coordinate transformation matrix for normals
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
        var u_NormalMatrix = gl.getUniformLocation(gl.program, 'u_NormalMatrix');
        if (!u_MvpMatrix || !u_NormalMatrix) {
            console.log('Failed to get the storage location');
            return;
        }
        // Calculate the view projection matrix
        var viewProjMatrix = new Utils.Matrix4();
        viewProjMatrix.setPerspective(50.0, canvas.width / canvas.height, 1.0, 100.0);
        viewProjMatrix.lookAt(20.0, 10.0, 30.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0);
        // Register the event handler to be called when keys are pressed
        document.onkeydown = function (ev) { _this.keydown(ev, gl, n, viewProjMatrix, u_MvpMatrix, u_NormalMatrix); };
        this.draw(gl, n, viewProjMatrix, u_MvpMatrix, u_NormalMatrix); // Draw the robot arm
    }
    JointModel.prototype.keydown = function (ev, gl, n, viewProjMatrix, u_MvpMatrix, u_NormalMatrix) {
        switch (ev.keyCode) {
            case 38: // Up arrow key -> the positive rotation of joint1 around the z-axis
                if (this.g_joint1Angle < 135.0)
                    this.g_joint1Angle += ANGLE_STEP;
                break;
            case 40: // Down arrow key -> the negative rotation of joint1 around the z-axis
                if (this.g_joint1Angle > -135.0)
                    this.g_joint1Angle -= ANGLE_STEP;
                break;
            case 39: // Right arrow key -> the positive rotation of arm1 around the y-axis
                this.g_arm1Angle = (this.g_arm1Angle + ANGLE_STEP) % 360;
                break;
            case 37: // Left arrow key -> the negative rotation of arm1 around the y-axis
                this.g_arm1Angle = (this.g_arm1Angle - ANGLE_STEP) % 360;
                break;
            default: return; // Skip drawing at no effective action
        }
        // Draw the robot arm
        this.draw(gl, n, viewProjMatrix, u_MvpMatrix, u_NormalMatrix);
    };
    JointModel.prototype.initVertexBuffers = function (gl) {
        // Vertex coordinates（a cuboid 3.0 in width, 10.0 in height, and 3.0 in length with its origin at the center of its bottom)
        var vertices = new Float32Array([
            1.5, 10.0, 1.5, -1.5, 10.0, 1.5, -1.5, 0.0, 1.5, 1.5, 0.0, 1.5,
            1.5, 10.0, 1.5, 1.5, 0.0, 1.5, 1.5, 0.0, -1.5, 1.5, 10.0, -1.5,
            1.5, 10.0, 1.5, 1.5, 10.0, -1.5, -1.5, 10.0, -1.5, -1.5, 10.0, 1.5,
            -1.5, 10.0, 1.5, -1.5, 10.0, -1.5, -1.5, 0.0, -1.5, -1.5, 0.0, 1.5,
            -1.5, 0.0, -1.5, 1.5, 0.0, -1.5, 1.5, 0.0, 1.5, -1.5, 0.0, 1.5,
            1.5, 0.0, -1.5, -1.5, 0.0, -1.5, -1.5, 10.0, -1.5, 1.5, 10.0, -1.5 // v4-v7-v6-v5 back
        ]);
        // Normal
        var normals = new Float32Array([
            0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0,
            1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0,
            0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0,
            -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0,
            0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0,
            0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0 // v4-v7-v6-v5 back
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
        // Write the vertex property to buffers (coordinates and normals)
        if (!this.initArrayBuffer(gl, 'a_Position', vertices, gl.FLOAT, 3))
            return -1;
        if (!this.initArrayBuffer(gl, 'a_Normal', normals, gl.FLOAT, 3))
            return -1;
        // Unbind the buffer object
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        // Write the indices to the buffer object
        var indexBuffer = gl.createBuffer();
        if (!indexBuffer) {
            console.log('Failed to create the buffer object');
            return -1;
        }
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);
        return indices.length;
    };
    JointModel.prototype.initArrayBuffer = function (gl, attribute, data, type, num) {
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
        return true;
    };
    JointModel.prototype.draw = function (gl, n, viewProjMatrix, u_MvpMatrix, u_NormalMatrix) {
        // Clear color and depth buffer
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        // Arm1
        var arm1Length = 10.0; // Length of arm1
        g_modelMatrix.setTranslate(0.0, -12.0, 0.0);
        g_modelMatrix.rotate(this.g_arm1Angle, 0.0, 1.0, 0.0); // Rotate around the y-axis
        this.drawBox(gl, n, viewProjMatrix, u_MvpMatrix, u_NormalMatrix); // Draw
        // Arm2
        g_modelMatrix.translate(0.0, arm1Length, 0.0); // Move to joint1
        g_modelMatrix.rotate(this.g_joint1Angle, 0.0, 0.0, 1.0); // Rotate around the z-axis
        g_modelMatrix.scale(1.3, 1.0, 1.3); // Make it a little thicker
        this.drawBox(gl, n, viewProjMatrix, u_MvpMatrix, u_NormalMatrix); // Draw
    };
    // Draw the cube
    JointModel.prototype.drawBox = function (gl, n, viewProjMatrix, u_MvpMatrix, u_NormalMatrix) {
        // Calculate the model view project matrix and pass it to u_MvpMatrix
        this.g_mvpMatrix.set(viewProjMatrix);
        this.g_mvpMatrix.multiply(g_modelMatrix);
        gl.uniformMatrix4fv(u_MvpMatrix, false, this.g_mvpMatrix.elements);
        // Calculate the normal transformation matrix and pass it to u_NormalMatrix
        this.g_normalMatrix.setInverseOf(g_modelMatrix);
        this.g_normalMatrix.transpose();
        gl.uniformMatrix4fv(u_NormalMatrix, false, this.g_normalMatrix.elements);
        // Draw
        gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0);
    };
    return JointModel;
}());
//# sourceMappingURL=ch09-JointModel.js.map