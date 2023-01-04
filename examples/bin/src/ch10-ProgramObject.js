// ProgramObject.js (c) 2012 matsuda and kanda
// Vertex shader for single color drawing
var SOLID_VSHADER_SOURCE = 'attribute vec4 a_Position;\n' +
    'attribute vec4 a_Normal;\n' +
    'uniform mat4 u_MvpMatrix;\n' +
    'uniform mat4 u_NormalMatrix;\n' +
    'varying vec4 v_Color;\n' +
    'void main() {\n' +
    '  vec3 lightDirection = vec3(0.0, 0.0, 1.0);\n' + // Light direction(World coordinate)
    '  vec4 color = vec4(0.0, 1.0, 1.0, 1.0);\n' + // Face color
    '  gl_Position = u_MvpMatrix * a_Position;\n' +
    '  vec3 normal = normalize(vec3(u_NormalMatrix * a_Normal));\n' +
    '  float nDotL = max(dot(normal, lightDirection), 0.0);\n' +
    '  v_Color = vec4(color.rgb * nDotL, color.a);\n' +
    '}\n';
// Fragment shader for single color drawing
var SOLID_FSHADER_SOURCE = '#ifdef GL_ES\n' +
    'precision mediump float;\n' +
    '#endif\n' +
    'varying vec4 v_Color;\n' +
    'void main() {\n' +
    '  gl_FragColor = v_Color;\n' +
    '}\n';
// Vertex shader for texture drawing
var TEXTURE_VSHADER_SOURCE = 'attribute vec4 a_Position;\n' +
    'attribute vec4 a_Normal;\n' +
    'attribute vec2 a_TexCoord;\n' +
    'uniform mat4 u_MvpMatrix;\n' +
    'uniform mat4 u_NormalMatrix;\n' +
    'varying float v_NdotL;\n' +
    'varying vec2 v_TexCoord;\n' +
    'void main() {\n' +
    '  vec3 lightDirection = vec3(0.0, 0.0, 1.0);\n' + // Light direction(World coordinate)
    '  gl_Position = u_MvpMatrix * a_Position;\n' +
    '  vec3 normal = normalize(vec3(u_NormalMatrix * a_Normal));\n' +
    '  v_NdotL = max(dot(normal, lightDirection), 0.0);\n' +
    '  v_TexCoord = a_TexCoord;\n' +
    '}\n';
// Fragment shader for texture drawing
var TEXTURE_FSHADER_SOURCE = '#ifdef GL_ES\n' +
    'precision mediump float;\n' +
    '#endif\n' +
    'uniform sampler2D u_Sampler;\n' +
    'varying vec2 v_TexCoord;\n' +
    'varying float v_NdotL;\n' +
    'void main() {\n' +
    '  vec4 color = texture2D(u_Sampler, v_TexCoord);\n' +
    '  gl_FragColor = vec4(color.rgb * v_NdotL, color.a);\n' +
    '}\n';
var ProgramObject = /** @class */ (function () {
    function ProgramObject() {
        var _this = this;
        // Coordinate transformation matrix
        this.g_modelMatrix = new Utils.Matrix4();
        this.g_mvpMatrix = new Utils.Matrix4();
        this.g_normalMatrix = new Utils.Matrix4();
        this.ANGLE_STEP = 30; // The increments of rotation angle (degrees)
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
        var solidProgram = Utils.createProgram(gl, SOLID_VSHADER_SOURCE, SOLID_FSHADER_SOURCE);
        var texProgram = Utils.createProgram(gl, TEXTURE_VSHADER_SOURCE, TEXTURE_FSHADER_SOURCE);
        if (!solidProgram || !texProgram) {
            console.log('Failed to intialize shaders.');
            return;
        }
        // Get storage locations of attribute and uniform variables in program object for single color drawing
        solidProgram.a_Position = gl.getAttribLocation(solidProgram, 'a_Position');
        solidProgram.a_Normal = gl.getAttribLocation(solidProgram, 'a_Normal');
        solidProgram.u_MvpMatrix = gl.getUniformLocation(solidProgram, 'u_MvpMatrix');
        solidProgram.u_NormalMatrix = gl.getUniformLocation(solidProgram, 'u_NormalMatrix');
        // Get storage locations of attribute and uniform variables in program object for texture drawing
        texProgram.a_Position = gl.getAttribLocation(texProgram, 'a_Position');
        texProgram.a_Normal = gl.getAttribLocation(texProgram, 'a_Normal');
        texProgram.a_TexCoord = gl.getAttribLocation(texProgram, 'a_TexCoord');
        texProgram.u_MvpMatrix = gl.getUniformLocation(texProgram, 'u_MvpMatrix');
        texProgram.u_NormalMatrix = gl.getUniformLocation(texProgram, 'u_NormalMatrix');
        texProgram.u_Sampler = gl.getUniformLocation(texProgram, 'u_Sampler');
        if (solidProgram.a_Position < 0 || solidProgram.a_Normal < 0 ||
            !solidProgram.u_MvpMatrix || !solidProgram.u_NormalMatrix ||
            texProgram.a_Position < 0 || texProgram.a_Normal < 0 || texProgram.a_TexCoord < 0 ||
            !texProgram.u_MvpMatrix || !texProgram.u_NormalMatrix || !texProgram.u_Sampler) {
            console.log('Failed to get the storage location of attribute or uniform variable');
            return;
        }
        // Set the vertex information
        var cube = this.initVertexBuffers(gl);
        if (!cube) {
            console.log('Failed to set the vertex information');
            return;
        }
        // Set texture
        var texture = this.initTextures(gl, texProgram);
        if (!texture) {
            console.log('Failed to intialize the texture.');
            return;
        }
        // Set the clear color and enable the depth test
        gl.enable(gl.DEPTH_TEST);
        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        // Calculate the view projection matrix
        var viewProjMatrix = new Utils.Matrix4();
        viewProjMatrix.setPerspective(30.0, canvas.width / canvas.height, 1.0, 100.0);
        viewProjMatrix.lookAt(0.0, 0.0, 15.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0);
        // Start drawing
        var currentAngle = 0.0; // Current rotation angle (degrees)
        var tick = function () {
            currentAngle = _this.animate(currentAngle); // Update current rotation angle
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT); // Clear color and depth buffers
            // Draw a cube in single color
            _this.drawSolidCube(gl, solidProgram, cube, -2.0, currentAngle, viewProjMatrix);
            // Draw a cube with texture
            _this.drawTexCube(gl, texProgram, cube, texture, 2.0, currentAngle, viewProjMatrix);
            window.requestAnimationFrame(tick);
        };
        tick();
    }
    ProgramObject.prototype.initVertexBuffers = function (gl) {
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
        var normals = new Float32Array([
            0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0,
            1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0,
            0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0,
            -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0,
            0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0,
            0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0 // v4-v7-v6-v5 back
        ]);
        var texCoords = new Float32Array([
            1.0, 1.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0,
            0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 1.0, 1.0,
            1.0, 0.0, 1.0, 1.0, 0.0, 1.0, 0.0, 0.0,
            1.0, 1.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0,
            0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
            0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0 // v4-v7-v6-v5 back
        ]);
        var indices = new Uint8Array([
            0, 1, 2, 0, 2, 3,
            4, 5, 6, 4, 6, 7,
            8, 9, 10, 8, 10, 11,
            12, 13, 14, 12, 14, 15,
            16, 17, 18, 16, 18, 19,
            20, 21, 22, 20, 22, 23 // back
        ]);
        var o = new Object(); // Utilize Object to to return multiple buffer objects together
        // Write vertex information to buffer object
        o.vertexBuffer = this.initArrayBufferForLaterUse(gl, vertices, 3, gl.FLOAT);
        o.normalBuffer = this.initArrayBufferForLaterUse(gl, normals, 3, gl.FLOAT);
        o.texCoordBuffer = this.initArrayBufferForLaterUse(gl, texCoords, 2, gl.FLOAT);
        o.indexBuffer = this.initElementArrayBufferForLaterUse(gl, indices, gl.UNSIGNED_BYTE);
        if (!o.vertexBuffer || !o.normalBuffer || !o.texCoordBuffer || !o.indexBuffer)
            return null;
        o.numIndices = indices.length;
        // Unbind the buffer object
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
        return o;
    };
    ProgramObject.prototype.initTextures = function (gl, program) {
        var texture = gl.createTexture(); // Create a texture object
        if (!texture) {
            console.log('Failed to create the texture object');
            return null;
        }
        var image = new Image(); // Create a image object
        if (!image) {
            console.log('Failed to create the image object');
            return null;
        }
        // Register the event handler to be called when image loading is completed
        image.onload = function () {
            // Write the image data to texture object
            gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); // Flip the image Y coordinate
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, texture);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
            // Pass the texure unit 0 to u_Sampler
            gl.useProgram(program);
            gl.uniform1i(program.u_Sampler, 0);
            gl.bindTexture(gl.TEXTURE_2D, null); // Unbind texture
        };
        // Tell the browser to load an Image
        image.src = '../resources/orange.jpg';
        return texture;
    };
    ProgramObject.prototype.drawSolidCube = function (gl, program, o, x, angle, viewProjMatrix) {
        gl.useProgram(program); // Tell that this program object is used
        // Assign the buffer objects and enable the assignment
        this.initAttributeVariable(gl, program.a_Position, o.vertexBuffer); // Vertex coordinates
        this.initAttributeVariable(gl, program.a_Normal, o.normalBuffer); // Normal
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, o.indexBuffer); // Bind indices
        this.drawCube(gl, program, o, x, angle, viewProjMatrix); // Draw
    };
    ProgramObject.prototype.drawTexCube = function (gl, program, o, texture, x, angle, viewProjMatrix) {
        gl.useProgram(program); // Tell that this program object is used
        // Assign the buffer objects and enable the assignment
        this.initAttributeVariable(gl, program.a_Position, o.vertexBuffer); // Vertex coordinates
        this.initAttributeVariable(gl, program.a_Normal, o.normalBuffer); // Normal
        this.initAttributeVariable(gl, program.a_TexCoord, o.texCoordBuffer); // Texture coordinates
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, o.indexBuffer); // Bind indices
        // Bind texture object to texture unit 0
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        this.drawCube(gl, program, o, x, angle, viewProjMatrix); // Draw
    };
    // Assign the buffer objects and enable the assignment
    ProgramObject.prototype.initAttributeVariable = function (gl, a_attribute, buffer) {
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.vertexAttribPointer(a_attribute, buffer.num, buffer.type, false, 0, 0);
        gl.enableVertexAttribArray(a_attribute);
    };
    ProgramObject.prototype.drawCube = function (gl, program, o, x, angle, viewProjMatrix) {
        // Calculate a model matrix
        this.g_modelMatrix.setTranslate(x, 0.0, 0.0);
        this.g_modelMatrix.rotate(20.0, 1.0, 0.0, 0.0);
        this.g_modelMatrix.rotate(angle, 0.0, 1.0, 0.0);
        // Calculate transformation matrix for normals and pass it to u_NormalMatrix
        this.g_normalMatrix.setInverseOf(this.g_modelMatrix);
        this.g_normalMatrix.transpose();
        gl.uniformMatrix4fv(program.u_NormalMatrix, false, this.g_normalMatrix.elements);
        // Calculate model view projection matrix and pass it to u_MvpMatrix
        this.g_mvpMatrix.set(viewProjMatrix);
        this.g_mvpMatrix.multiply(this.g_modelMatrix);
        gl.uniformMatrix4fv(program.u_MvpMatrix, false, this.g_mvpMatrix.elements);
        gl.drawElements(gl.TRIANGLES, o.numIndices, o.indexBuffer.type, 0); // Draw
    };
    ProgramObject.prototype.initArrayBufferForLaterUse = function (gl, data, num, type) {
        var buffer = gl.createBuffer(); // Create a buffer object
        if (!buffer) {
            console.log('Failed to create the buffer object');
            return null;
        }
        // Write date into the buffer object
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
        // Keep the information necessary to assign to the attribute variable later
        buffer.num = num;
        buffer.type = type;
        return buffer;
    };
    ProgramObject.prototype.initElementArrayBufferForLaterUse = function (gl, data, type) {
        var buffer = gl.createBuffer(); // Create a buffer object
        if (!buffer) {
            console.log('Failed to create the buffer object');
            return null;
        }
        // Write date into the buffer object
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, data, gl.STATIC_DRAW);
        buffer.type = type;
        return buffer;
    };
    ProgramObject.prototype.animate = function (angle) {
        var now = Date.now(); // Calculate the elapsed time
        var elapsed = now - this.last;
        this.last = now;
        // Update the current rotation angle (adjusted by the elapsed time)
        var newAngle = angle + (this.ANGLE_STEP * elapsed) / 1000.0;
        return newAngle % 360;
    };
    return ProgramObject;
}());
//# sourceMappingURL=ch10-ProgramObject.js.map