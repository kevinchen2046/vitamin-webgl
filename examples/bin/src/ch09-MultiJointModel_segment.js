// MultiJointModel_segment.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE = 'attribute vec4 a_Position;\n' +
    'attribute vec4 a_Normal;\n' +
    'uniform mat4 u_MvpMatrix;\n' +
    'uniform mat4 u_NormalMatrix;\n' +
    'varying vec4 v_Color;\n' +
    'void main() {\n' +
    '  gl_Position = u_MvpMatrix * a_Position;\n' +
    // The followings are some shading calculation to make the arm look three-dimensional
    '  vec3 lightDirection = normalize(vec3(0.0, 0.5, 0.7));\n' + // Light direction
    '  vec4 color = vec4(1.0, 0.4, 0.0, 1.0);\n' + // Robot color
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
var MultiJointModel_segment = /** @class */ (function () {
    function MultiJointModel_segment() {
        var _this = this;
        this.ANGLE_STEP = 3.0; // The increments of rotation angle (degrees)
        this.g_arm1Angle = 90.0; // The rotation angle of arm1 (degrees)
        this.g_joint1Angle = 45.0; // The rotation angle of joint1 (degrees)
        this.g_joint2Angle = 0.0; // The rotation angle of joint2 (degrees)
        this.g_joint3Angle = 0.0; // The rotation angle of joint3 (degrees)
        this.g_baseBuffer = null; // Buffer object for a base
        this.g_arm1Buffer = null; // Buffer object for arm1
        this.g_arm2Buffer = null; // Buffer object for arm2
        this.g_palmBuffer = null; // Buffer object for a palm
        this.g_fingerBuffer = null; // Buffer object for fingers
        // Coordinate transformation matrix
        this.g_modelMatrix = new Utils.Matrix4();
        this.g_mvpMatrix = new Utils.Matrix4();
        this.g_matrixStack = []; // Array for storing a matrix
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
        // Get the storage locations of attribute and uniform variables
        var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
        var u_MvpMatrix = gl.getUniformLocation(gl.program, 'u_MvpMatrix');
        var u_NormalMatrix = gl.getUniformLocation(gl.program, 'u_NormalMatrix');
        if (a_Position < 0 || !u_MvpMatrix || !u_NormalMatrix) {
            console.log('Failed to get the storage location of attribute or uniform variable');
            return;
        }
        // Calculate the view projection matrix
        var viewProjMatrix = new Utils.Matrix4();
        viewProjMatrix.setPerspective(50.0, canvas.width / canvas.height, 1.0, 100.0);
        viewProjMatrix.lookAt(20.0, 10.0, 30.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0);
        // Register the event handler to be called on key press
        document.onkeydown = function (ev) { _this.keydown(ev, gl, n, viewProjMatrix, a_Position, u_MvpMatrix, u_NormalMatrix); };
        this.draw(gl, n, viewProjMatrix, a_Position, u_MvpMatrix, u_NormalMatrix);
    }
    MultiJointModel_segment.prototype.keydown = function (ev, gl, o, viewProjMatrix, a_Position, u_MvpMatrix, u_NormalMatrix) {
        switch (ev.keyCode) {
            case 40: // Up arrow key -> the positive rotation of joint1 around the z-axis
                if (this.g_joint1Angle < 135.0)
                    this.g_joint1Angle += ANGLE_STEP;
                break;
            case 38: // Down arrow key -> the negative rotation of joint1 around the z-axis
                if (this.g_joint1Angle > -135.0)
                    this.g_joint1Angle -= ANGLE_STEP;
                break;
            case 39: // Right arrow key -> the positive rotation of arm1 around the y-axis
                this.g_arm1Angle = (this.g_arm1Angle + ANGLE_STEP) % 360;
                break;
            case 37: // Left arrow key -> the negative rotation of arm1 around the y-axis
                this.g_arm1Angle = (this.g_arm1Angle - ANGLE_STEP) % 360;
                break;
            case 90: // 'ｚ'key -> the positive rotation of joint2
                this.g_joint2Angle = (this.g_joint2Angle + ANGLE_STEP) % 360;
                break;
            case 88: // 'x'key -> the negative rotation of joint2
                this.g_joint2Angle = (this.g_joint2Angle - ANGLE_STEP) % 360;
                break;
            case 86: // 'v'key -> the positive rotation of joint3
                if (this.g_joint3Angle < 60.0)
                    this.g_joint3Angle = (this.g_joint3Angle + ANGLE_STEP) % 360;
                break;
            case 67: // 'c'key -> the nagative rotation of joint3
                if (this.g_joint3Angle > -60.0)
                    this.g_joint3Angle = (this.g_joint3Angle - ANGLE_STEP) % 360;
                break;
            default: return; // Skip drawing at no effective action
        }
        // Draw
        this.draw(gl, o, viewProjMatrix, a_Position, u_MvpMatrix, u_NormalMatrix);
    };
    MultiJointModel_segment.prototype.initVertexBuffers = function (gl) {
        // Vertex coordinate (prepare coordinates of cuboids for all segments)
        var vertices_base = new Float32Array([
            5.0, 2.0, 5.0, -5.0, 2.0, 5.0, -5.0, 0.0, 5.0, 5.0, 0.0, 5.0,
            5.0, 2.0, 5.0, 5.0, 0.0, 5.0, 5.0, 0.0, -5.0, 5.0, 2.0, -5.0,
            5.0, 2.0, 5.0, 5.0, 2.0, -5.0, -5.0, 2.0, -5.0, -5.0, 2.0, 5.0,
            -5.0, 2.0, 5.0, -5.0, 2.0, -5.0, -5.0, 0.0, -5.0, -5.0, 0.0, 5.0,
            -5.0, 0.0, -5.0, 5.0, 0.0, -5.0, 5.0, 0.0, 5.0, -5.0, 0.0, 5.0,
            5.0, 0.0, -5.0, -5.0, 0.0, -5.0, -5.0, 2.0, -5.0, 5.0, 2.0, -5.0 // v4-v7-v6-v5 back
        ]);
        var vertices_arm1 = new Float32Array([
            1.5, 10.0, 1.5, -1.5, 10.0, 1.5, -1.5, 0.0, 1.5, 1.5, 0.0, 1.5,
            1.5, 10.0, 1.5, 1.5, 0.0, 1.5, 1.5, 0.0, -1.5, 1.5, 10.0, -1.5,
            1.5, 10.0, 1.5, 1.5, 10.0, -1.5, -1.5, 10.0, -1.5, -1.5, 10.0, 1.5,
            -1.5, 10.0, 1.5, -1.5, 10.0, -1.5, -1.5, 0.0, -1.5, -1.5, 0.0, 1.5,
            -1.5, 0.0, -1.5, 1.5, 0.0, -1.5, 1.5, 0.0, 1.5, -1.5, 0.0, 1.5,
            1.5, 0.0, -1.5, -1.5, 0.0, -1.5, -1.5, 10.0, -1.5, 1.5, 10.0, -1.5 // v4-v7-v6-v5 back
        ]);
        var vertices_arm2 = new Float32Array([
            2.0, 10.0, 2.0, -2.0, 10.0, 2.0, -2.0, 0.0, 2.0, 2.0, 0.0, 2.0,
            2.0, 10.0, 2.0, 2.0, 0.0, 2.0, 2.0, 0.0, -2.0, 2.0, 10.0, -2.0,
            2.0, 10.0, 2.0, 2.0, 10.0, -2.0, -2.0, 10.0, -2.0, -2.0, 10.0, 2.0,
            -2.0, 10.0, 2.0, -2.0, 10.0, -2.0, -2.0, 0.0, -2.0, -2.0, 0.0, 2.0,
            -2.0, 0.0, -2.0, 2.0, 0.0, -2.0, 2.0, 0.0, 2.0, -2.0, 0.0, 2.0,
            2.0, 0.0, -2.0, -2.0, 0.0, -2.0, -2.0, 10.0, -2.0, 2.0, 10.0, -2.0 // v4-v7-v6-v5 back
        ]);
        var vertices_palm = new Float32Array([
            1.0, 2.0, 3.0, -1.0, 2.0, 3.0, -1.0, 0.0, 3.0, 1.0, 0.0, 3.0,
            1.0, 2.0, 3.0, 1.0, 0.0, 3.0, 1.0, 0.0, -3.0, 1.0, 2.0, -3.0,
            1.0, 2.0, 3.0, 1.0, 2.0, -3.0, -1.0, 2.0, -3.0, -1.0, 2.0, 3.0,
            -1.0, 2.0, 3.0, -1.0, 2.0, -3.0, -1.0, 0.0, -3.0, -1.0, 0.0, 3.0,
            -1.0, 0.0, -3.0, 1.0, 0.0, -3.0, 1.0, 0.0, 3.0, -1.0, 0.0, 3.0,
            1.0, 0.0, -3.0, -1.0, 0.0, -3.0, -1.0, 2.0, -3.0, 1.0, 2.0, -3.0 // v4-v7-v6-v5 back
        ]);
        var vertices_finger = new Float32Array([
            0.5, 2.0, 0.5, -0.5, 2.0, 0.5, -0.5, 0.0, 0.5, 0.5, 0.0, 0.5,
            0.5, 2.0, 0.5, 0.5, 0.0, 0.5, 0.5, 0.0, -0.5, 0.5, 2.0, -0.5,
            0.5, 2.0, 0.5, 0.5, 2.0, -0.5, -0.5, 2.0, -0.5, -0.5, 2.0, 0.5,
            -0.5, 2.0, 0.5, -0.5, 2.0, -0.5, -0.5, 0.0, -0.5, -0.5, 0.0, 0.5,
            -0.5, 0.0, -0.5, 0.5, 0.0, -0.5, 0.5, 0.0, 0.5, -0.5, 0.0, 0.5,
            0.5, 0.0, -0.5, -0.5, 0.0, -0.5, -0.5, 2.0, -0.5, 0.5, 2.0, -0.5 // v4-v7-v6-v5 back
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
        // Write coords to buffers, but don't assign to attribute variables
        this.g_baseBuffer = this.initArrayBufferForLaterUse(gl, vertices_base, 3, gl.FLOAT);
        this.g_arm1Buffer = this.initArrayBufferForLaterUse(gl, vertices_arm1, 3, gl.FLOAT);
        this.g_arm2Buffer = this.initArrayBufferForLaterUse(gl, vertices_arm2, 3, gl.FLOAT);
        this.g_palmBuffer = this.initArrayBufferForLaterUse(gl, vertices_palm, 3, gl.FLOAT);
        this.g_fingerBuffer = this.initArrayBufferForLaterUse(gl, vertices_finger, 3, gl.FLOAT);
        if (!this.g_baseBuffer || !this.g_arm1Buffer || !this.g_arm2Buffer || !this.g_palmBuffer || !this.g_fingerBuffer)
            return -1;
        // Write normals to a buffer, assign it to a_Normal and enable it
        if (!this.initArrayBuffer(gl, 'a_Normal', normals, 3, gl.FLOAT))
            return -1;
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
    MultiJointModel_segment.prototype.initArrayBufferForLaterUse = function (gl, data, num, type) {
        var buffer = gl.createBuffer(); // Create a buffer object
        if (!buffer) {
            console.log('Failed to create the buffer object');
            return null;
        }
        // Write date into the buffer object
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
        // Store the necessary information to assign the object to the attribute variable later
        buffer.num = num;
        buffer.type = type;
        return buffer;
    };
    MultiJointModel_segment.prototype.initArrayBuffer = function (gl, attribute, data, num, type) {
        var buffer = gl.createBuffer(); // Create a buffer object
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
    MultiJointModel_segment.prototype.draw = function (gl, n, viewProjMatrix, a_Position, u_MvpMatrix, u_NormalMatrix) {
        // Clear color and depth buffer
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        // Draw a base
        var baseHeight = 2.0;
        g_modelMatrix.setTranslate(0.0, -12.0, 0.0);
        this.drawSegment(gl, n, this.g_baseBuffer, viewProjMatrix, a_Position, u_MvpMatrix, u_NormalMatrix);
        // Arm1
        var arm1Length = 10.0;
        g_modelMatrix.translate(0.0, baseHeight, 0.0); // Move onto the base
        g_modelMatrix.rotate(this.g_arm1Angle, 0.0, 1.0, 0.0); // Rotate around the y-axis
        this.drawSegment(gl, n, this.g_arm1Buffer, viewProjMatrix, a_Position, u_MvpMatrix, u_NormalMatrix); // Draw
        // Arm2
        var arm2Length = 10.0;
        g_modelMatrix.translate(0.0, arm1Length, 0.0); // Move to joint1
        g_modelMatrix.rotate(this.g_joint1Angle, 0.0, 0.0, 1.0); // Rotate around the z-axis
        this.drawSegment(gl, n, this.g_arm2Buffer, viewProjMatrix, a_Position, u_MvpMatrix, u_NormalMatrix); // Draw
        // A palm
        var palmLength = 2.0;
        g_modelMatrix.translate(0.0, arm2Length, 0.0); // Move to palm
        g_modelMatrix.rotate(this.g_joint2Angle, 0.0, 1.0, 0.0); // Rotate around the y-axis
        this.drawSegment(gl, n, this.g_palmBuffer, viewProjMatrix, a_Position, u_MvpMatrix, u_NormalMatrix); // Draw
        // Move to the center of the tip of the palm
        g_modelMatrix.translate(0.0, palmLength, 0.0);
        // Draw finger1
        this.pushMatrix(g_modelMatrix);
        g_modelMatrix.translate(0.0, 0.0, 2.0);
        g_modelMatrix.rotate(this.g_joint3Angle, 1.0, 0.0, 0.0); // Rotate around the x-axis
        this.drawSegment(gl, n, this.g_fingerBuffer, viewProjMatrix, a_Position, u_MvpMatrix, u_NormalMatrix);
        g_modelMatrix = this.popMatrix();
        // Finger2
        g_modelMatrix.translate(0.0, 0.0, -2.0);
        g_modelMatrix.rotate(-this.g_joint3Angle, 1.0, 0.0, 0.0); // Rotate around the x-axis
        this.drawSegment(gl, n, this.g_fingerBuffer, viewProjMatrix, a_Position, u_MvpMatrix, u_NormalMatrix);
    };
    MultiJointModel_segment.prototype.pushMatrix = function (m) {
        var m2 = new Utils.Matrix4(m);
        this.g_matrixStack.push(m2);
    };
    MultiJointModel_segment.prototype.popMatrix = function () {
        return this.g_matrixStack.pop();
    };
    // Draw segments
    MultiJointModel_segment.prototype.drawSegment = function (gl, n, buffer, viewProjMatrix, a_Position, u_MvpMatrix, u_NormalMatrix) {
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        // Assign the buffer object to the attribute variable
        gl.vertexAttribPointer(a_Position, buffer.num, buffer.type, false, 0, 0);
        // Enable the assignment of the buffer object to the attribute variable
        gl.enableVertexAttribArray(a_Position);
        // Calculate the model view project matrix and pass it to u_MvpMatrix
        this.g_mvpMatrix.set(viewProjMatrix);
        this.g_mvpMatrix.multiply(g_modelMatrix);
        gl.uniformMatrix4fv(u_MvpMatrix, false, this.g_mvpMatrix.elements);
        // Calculate matrix for normal and pass it to u_NormalMatrix
        this.g_normalMatrix.setInverseOf(g_modelMatrix);
        this.g_normalMatrix.transpose();
        gl.uniformMatrix4fv(u_NormalMatrix, false, this.g_normalMatrix.elements);
        // Draw
        gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0);
    };
    return MultiJointModel_segment;
}());
//# sourceMappingURL=ch09-MultiJointModel_segment.js.map