// FramebufferObject.js (c) matsuda and kanda
// Vertex shader program
var VSHADER_SOURCE = 'attribute vec4 a_Position;\n' +
    'attribute vec2 a_TexCoord;\n' +
    'uniform mat4 u_MvpMatrix;\n' +
    'varying vec2 v_TexCoord;\n' +
    'void main() {\n' +
    '  gl_Position = u_MvpMatrix * a_Position;\n' +
    '  v_TexCoord = a_TexCoord;\n' +
    '}\n';
// Fragment shader program
var FSHADER_SOURCE = '#ifdef GL_ES\n' +
    'precision mediump float;\n' +
    '#endif\n' +
    'uniform sampler2D u_Sampler;\n' +
    'varying vec2 v_TexCoord;\n' +
    'void main() {\n' +
    '  gl_FragColor = texture2D(u_Sampler, v_TexCoord);\n' +
    '}\n';
// Size of off screen
var OFFSCREEN_WIDTH = 256;
var OFFSCREEN_HEIGHT = 256;
var FramebufferObject = /** @class */ (function () {
    function FramebufferObject() {
        var _this = this;
        // Coordinate transformation matrix
        this.g_modelMatrix = new Utils.Matrix4();
        this.g_mvpMatrix = new Utils.Matrix4();
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
        if (!Utils.initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
            console.log('Failed to intialize shaders.');
            return;
        }
        // Get the storage location of attribute variables and uniform variables
        var program = gl.program; // Get program object
        program.a_Position = gl.getAttribLocation(program, 'a_Position');
        program.a_TexCoord = gl.getAttribLocation(program, 'a_TexCoord');
        program.u_MvpMatrix = gl.getUniformLocation(program, 'u_MvpMatrix');
        if (program.a_Position < 0 || program.a_TexCoord < 0 || !program.u_MvpMatrix) {
            console.log('Failed to get the storage location of a_Position, a_TexCoord, u_MvpMatrix');
            return;
        }
        // Set the vertex information
        var cube = this.initVertexBuffersForCube(gl);
        var plane = this.initVertexBuffersForPlane(gl);
        if (!cube || !plane) {
            console.log('Failed to set the vertex information');
            return;
        }
        // Set texture
        var texture = this.initTextures(gl);
        if (!texture) {
            console.log('Failed to intialize the texture.');
            return;
        }
        // Initialize framebuffer object (FBO)
        var fbo = this.initFramebufferObject(gl);
        if (!fbo) {
            console.log('Failed to intialize the framebuffer object (FBO)');
            return;
        }
        // Enable depth test
        gl.enable(gl.DEPTH_TEST); //  gl.enable(gl.CULL_FACE);
        var viewProjMatrix = new Utils.Matrix4(); // Prepare view projection matrix for color buffer
        viewProjMatrix.setPerspective(30, canvas.width / canvas.height, 1.0, 100.0);
        viewProjMatrix.lookAt(0.0, 0.0, 7.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0);
        var viewProjMatrixFBO = new Utils.Matrix4(); // Prepare view projection matrix for FBO
        viewProjMatrixFBO.setPerspective(30.0, OFFSCREEN_WIDTH / OFFSCREEN_HEIGHT, 1.0, 100.0);
        viewProjMatrixFBO.lookAt(0.0, 2.0, 7.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0);
        // Start drawing
        var currentAngle = 0.0; // Current rotation angle (degrees)
        var tick = function () {
            currentAngle = _this.animate(currentAngle); // Update current rotation angle
            _this.draw(gl, canvas, fbo, plane, cube, currentAngle, texture, viewProjMatrix, viewProjMatrixFBO);
            window.requestAnimationFrame(tick);
        };
        tick();
    }
    FramebufferObject.prototype.initVertexBuffersForCube = function (gl) {
        // Create a cube
        //    v6----- v5
        //   /|      /|
        //  v1------v0|
        //  | |     | |
        //  | |v7---|-|v4
        //  |/      |/
        //  v2------v3
        // Vertex coordinates
        var vertices = new Float32Array([
            1.0, 1.0, 1.0, -1.0, 1.0, 1.0, -1.0, -1.0, 1.0, 1.0, -1.0, 1.0,
            1.0, 1.0, 1.0, 1.0, -1.0, 1.0, 1.0, -1.0, -1.0, 1.0, 1.0, -1.0,
            1.0, 1.0, 1.0, 1.0, 1.0, -1.0, -1.0, 1.0, -1.0, -1.0, 1.0, 1.0,
            -1.0, 1.0, 1.0, -1.0, 1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, 1.0,
            -1.0, -1.0, -1.0, 1.0, -1.0, -1.0, 1.0, -1.0, 1.0, -1.0, -1.0, 1.0,
            1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, 1.0, -1.0, 1.0, 1.0, -1.0 // v4-v7-v6-v5 back
        ]);
        // Texture coordinates
        var texCoords = new Float32Array([
            1.0, 1.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0,
            0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 1.0, 1.0,
            1.0, 0.0, 1.0, 1.0, 0.0, 1.0, 0.0, 0.0,
            1.0, 1.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0,
            0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
            0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0 // v4-v7-v6-v5 back
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
        var o = new Object(); // Create the "Object" object to return multiple objects.
        // Write vertex information to buffer object
        o.vertexBuffer = this.initArrayBufferForLaterUse(gl, vertices, 3, gl.FLOAT);
        o.texCoordBuffer = this.initArrayBufferForLaterUse(gl, texCoords, 2, gl.FLOAT);
        o.indexBuffer = this.initElementArrayBufferForLaterUse(gl, indices, gl.UNSIGNED_BYTE);
        if (!o.vertexBuffer || !o.texCoordBuffer || !o.indexBuffer)
            return null;
        o.numIndices = indices.length;
        // Unbind the buffer object
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
        return o;
    };
    FramebufferObject.prototype.initVertexBuffersForPlane = function (gl) {
        // Create face
        //  v1------v0
        //  |        | 
        //  |        |
        //  |        |
        //  v2------v3
        // Vertex coordinates
        var vertices = new Float32Array([
            1.0, 1.0, 0.0, -1.0, 1.0, 0.0, -1.0, -1.0, 0.0, 1.0, -1.0, 0.0 // v0-v1-v2-v3
        ]);
        // Texture coordinates
        var texCoords = new Float32Array([1.0, 1.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0]);
        // Indices of the vertices
        var indices = new Uint8Array([0, 1, 2, 0, 2, 3]);
        var o = new Object(); // Create the "Object" object to return multiple objects.
        // Write vertex information to buffer object
        o.vertexBuffer = this.initArrayBufferForLaterUse(gl, vertices, 3, gl.FLOAT);
        o.texCoordBuffer = this.initArrayBufferForLaterUse(gl, texCoords, 2, gl.FLOAT);
        o.indexBuffer = this.initElementArrayBufferForLaterUse(gl, indices, gl.UNSIGNED_BYTE);
        if (!o.vertexBuffer || !o.texCoordBuffer || !o.indexBuffer)
            return null;
        o.numIndices = indices.length;
        // Unbind the buffer object
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
        return o;
    };
    FramebufferObject.prototype.initArrayBufferForLaterUse = function (gl, data, num, type) {
        // Create a buffer object
        var buffer = gl.createBuffer();
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
    FramebufferObject.prototype.initElementArrayBufferForLaterUse = function (gl, data, type) {
        // Create a buffer object
        var buffer = gl.createBuffer();
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
    FramebufferObject.prototype.initTextures = function (gl) {
        var texture = gl.createTexture(); // Create a texture object
        if (!texture) {
            console.log('Failed to create the Texture object');
            return null;
        }
        // Get storage location of u_Sampler
        var u_Sampler = gl.getUniformLocation(gl.program, 'u_Sampler');
        if (!u_Sampler) {
            console.log('Failed to get the storage location of u_Sampler');
            return null;
        }
        var image = new Image(); // Create image object
        if (!image) {
            console.log('Failed to create the Image object');
            return null;
        }
        // Register the event handler to be called when image loading is completed
        image.onload = function () {
            // Write image data to texture object
            gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); // Flip the image Y coordinate
            gl.bindTexture(gl.TEXTURE_2D, texture);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
            // Pass the texure unit 0 to u_Sampler
            gl.uniform1i(u_Sampler, 0);
            gl.bindTexture(gl.TEXTURE_2D, null); // Unbind the texture object
        };
        // Tell the browser to load an Image  
        image.src = '../resources/sky_cloud.jpg';
        return texture;
    };
    FramebufferObject.prototype.initFramebufferObject = function (gl) {
        var framebuffer, texture, depthBuffer;
        // Define the error handling function
        var error = function () {
            if (framebuffer)
                gl.deleteFramebuffer(framebuffer);
            if (texture)
                gl.deleteTexture(texture);
            if (depthBuffer)
                gl.deleteRenderbuffer(depthBuffer);
            return null;
        };
        // Create a frame buffer object (FBO)
        framebuffer = gl.createFramebuffer();
        if (!framebuffer) {
            console.log('Failed to create frame buffer object');
            return error();
        }
        // Create a texture object and set its size and parameters
        texture = gl.createTexture(); // Create a texture object
        if (!texture) {
            console.log('Failed to create texture object');
            return error();
        }
        gl.bindTexture(gl.TEXTURE_2D, texture); // Bind the object to target
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, OFFSCREEN_WIDTH, OFFSCREEN_HEIGHT, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        framebuffer.texture = texture; // Store the texture object
        // Create a renderbuffer object and Set its size and parameters
        depthBuffer = gl.createRenderbuffer(); // Create a renderbuffer object
        if (!depthBuffer) {
            console.log('Failed to create renderbuffer object');
            return error();
        }
        gl.bindRenderbuffer(gl.RENDERBUFFER, depthBuffer); // Bind the object to target
        gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, OFFSCREEN_WIDTH, OFFSCREEN_HEIGHT);
        // Attach the texture and the renderbuffer object to the FBO
        gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
        gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, depthBuffer);
        // Check if FBO is configured correctly
        var e = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
        if (gl.FRAMEBUFFER_COMPLETE !== e) {
            console.log('Frame buffer object is incomplete: ' + e.toString());
            return error();
        }
        // Unbind the buffer object
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.bindTexture(gl.TEXTURE_2D, null);
        gl.bindRenderbuffer(gl.RENDERBUFFER, null);
        return framebuffer;
    };
    FramebufferObject.prototype.draw = function (gl, canvas, fbo, plane, cube, angle, texture, viewProjMatrix, viewProjMatrixFBO) {
        gl.bindFramebuffer(gl.FRAMEBUFFER, fbo); // Change the drawing destination to FBO
        gl.viewport(0, 0, OFFSCREEN_WIDTH, OFFSCREEN_HEIGHT); // Set a viewport for FBO
        gl.clearColor(0.2, 0.2, 0.4, 1.0); // Set clear color (the color is slightly changed)
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT); // Clear FBO
        this.drawTexturedCube(gl, gl.program, cube, angle, texture, viewProjMatrixFBO); // Draw the cube
        gl.bindFramebuffer(gl.FRAMEBUFFER, null); // Change the drawing destination to color buffer
        gl.viewport(0, 0, canvas.width, canvas.height); // Set the size of viewport back to that of <canvas>
        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT); // Clear the color buffer
        this.drawTexturedPlane(gl, gl.program, plane, angle, fbo.texture, viewProjMatrix); // Draw the plane
    };
    FramebufferObject.prototype.drawTexturedCube = function (gl, program, o, angle, texture, viewProjMatrix) {
        // Calculate a model matrix
        g_modelMatrix.setRotate(20.0, 1.0, 0.0, 0.0);
        g_modelMatrix.rotate(angle, 0.0, 1.0, 0.0);
        // Calculate the model view project matrix and pass it to u_MvpMatrix
        this.g_mvpMatrix.set(viewProjMatrix);
        this.g_mvpMatrix.multiply(g_modelMatrix);
        gl.uniformMatrix4fv(program.u_MvpMatrix, false, this.g_mvpMatrix.elements);
        this.drawTexturedObject(gl, program, o, texture);
    };
    FramebufferObject.prototype.drawTexturedPlane = function (gl, program, o, angle, texture, viewProjMatrix) {
        // Calculate a model matrix
        g_modelMatrix.setTranslate(0, 0, 1);
        g_modelMatrix.rotate(20.0, 1.0, 0.0, 0.0);
        g_modelMatrix.rotate(angle, 0.0, 1.0, 0.0);
        // Calculate the model view project matrix and pass it to u_MvpMatrix
        this.g_mvpMatrix.set(viewProjMatrix);
        this.g_mvpMatrix.multiply(g_modelMatrix);
        gl.uniformMatrix4fv(program.u_MvpMatrix, false, this.g_mvpMatrix.elements);
        this.drawTexturedObject(gl, program, o, texture);
    };
    FramebufferObject.prototype.drawTexturedObject = function (gl, program, o, texture) {
        // Assign the buffer objects and enable the assignment
        this.initAttributeVariable(gl, program.a_Position, o.vertexBuffer); // Vertex coordinates
        this.initAttributeVariable(gl, program.a_TexCoord, o.texCoordBuffer); // Texture coordinates
        // Bind the texture object to the target
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        // Draw
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, o.indexBuffer);
        gl.drawElements(gl.TRIANGLES, o.numIndices, o.indexBuffer.type, 0);
    };
    // Assign the buffer objects and enable the assignment
    FramebufferObject.prototype.initAttributeVariable = function (gl, a_attribute, buffer) {
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.vertexAttribPointer(a_attribute, buffer.num, buffer.type, false, 0, 0);
        gl.enableVertexAttribArray(a_attribute);
    };
    FramebufferObject.prototype.drawTexturedCube2 = function (gl, o, angle, texture, viewpProjMatrix, u_MvpMatrix) {
        // Calculate a model matrix
        g_modelMatrix.rotate(20.0, 1.0, 0.0, 0.0);
        g_modelMatrix.rotate(angle, 0.0, 1.0, 0.0);
        g_modelMatrix.scale(1, 1, 1);
        // Calculate the model view project matrix and pass it to u_MvpMatrix
        this.g_mvpMatrix.set(viewpProjMatrix);
        this.g_mvpMatrix.multiply(g_modelMatrix);
        gl.uniformMatrix4fv(u_MvpMatrix, false, this.g_mvpMatrix.elements);
        this.drawTexturedObject(gl, o, texture);
    };
    FramebufferObject.prototype.animate = function (angle) {
        var now = Date.now(); // Calculate the elapsed time
        var elapsed = now - this.last;
        this.last = now;
        // Update the current rotation angle (adjusted by the elapsed time)
        var newAngle = angle + (ANGLE_STEP * elapsed) / 1000.0;
        return newAngle % 360;
    };
    return FramebufferObject;
}());
//# sourceMappingURL=ch10-FramebufferObject.js.map