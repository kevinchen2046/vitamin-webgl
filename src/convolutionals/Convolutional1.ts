import { ConvoUtil } from "./ConvoUtil";
import { kernels } from "./kernels";

let vertext = `
attribute vec2 a_position;
attribute vec2 a_texCoord;

uniform vec2 u_resolution;
uniform float u_flipY;

varying vec2 v_texCoord;

void main() {
   // convert the rectangle from pixels to 0.0 to 1.0
   vec2 zeroToOne = a_position / u_resolution;

   // convert from 0->1 to 0->2
   vec2 zeroToTwo = zeroToOne * 2.0;

   // convert from 0->2 to -1->+1 (clipspace)
   vec2 clipSpace = zeroToTwo - 1.0;

   gl_Position = vec4(clipSpace * vec2(1, u_flipY), 0, 1);

   // pass the texCoord to the fragment shader
   // The GPU will interpolate this value between points.
   v_texCoord = a_texCoord;
}
`;
let fragment = `

precision mediump float;

// our texture
uniform sampler2D u_image;
uniform vec2 u_textureSize;
uniform float u_kernel[9];
uniform float u_kernelWeight;

// the texCoords passed in from the vertex shader.
varying vec2 v_texCoord;

void main() {
   vec2 onePixel = vec2(1.0, 1.0) / u_textureSize;
   vec4 colorSum =
       texture2D(u_image, v_texCoord + onePixel * vec2(-1, -1)) * u_kernel[0] +
       texture2D(u_image, v_texCoord + onePixel * vec2( 0, -1)) * u_kernel[1] +
       texture2D(u_image, v_texCoord + onePixel * vec2( 1, -1)) * u_kernel[2] +
       texture2D(u_image, v_texCoord + onePixel * vec2(-1,  0)) * u_kernel[3] +
       texture2D(u_image, v_texCoord + onePixel * vec2( 0,  0)) * u_kernel[4] +
       texture2D(u_image, v_texCoord + onePixel * vec2( 1,  0)) * u_kernel[5] +
       texture2D(u_image, v_texCoord + onePixel * vec2(-1,  1)) * u_kernel[6] +
       texture2D(u_image, v_texCoord + onePixel * vec2( 0,  1)) * u_kernel[7] +
       texture2D(u_image, v_texCoord + onePixel * vec2( 1,  1)) * u_kernel[8] ;
   gl_FragColor = vec4((colorSum / u_kernelWeight).rgb, 1);
}
`;


export function Convolutional1() {
    var image = new Image();
    image.src = './res/yellowflower.jpg';  // MUST BE SAME DOMAIN!!!
    image.onload = function () {
        render(image);
    };
}

function render(image) {
    // Get A WebGL context
    /** @type {HTMLCanvasElement} */
    var canvas: HTMLCanvasElement = document.getElementById('webgl') as HTMLCanvasElement;
    var gl = canvas.getContext("webgl");
    if (!gl) {
        return;
    }

    // setup GLSL program
    Utils.initShaders(gl, vertext, fragment);

    // look up where the vertex data needs to go.
    var positionLocation = gl.getAttribLocation(gl.program, "a_position");
    var texcoordLocation = gl.getAttribLocation(gl.program, "a_texCoord");

    // Create a buffer to put three 2d clip space points in
    var positionBuffer = gl.createBuffer();
    // Bind it to ARRAY_BUFFER (think of it as ARRAY_BUFFER = positionBuffer)
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    // Set a rectangle the same size as the image.

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(ConvoUtil.createRectangleData(0, 0, image.width, image.height)), gl.STATIC_DRAW);
    // provide texture coordinates for the rectangle.
    var texcoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
        0.0, 0.0,
        1.0, 0.0,
        0.0, 1.0,
        0.0, 1.0,
        1.0, 0.0,
        1.0, 1.0,
    ]), gl.STATIC_DRAW);

    function createAndSetupTexture(gl) {
        var texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);

        // Set up texture so we can render any size image and so we are
        // working with pixels.
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        return texture;
    }

    // Create a texture and put the image in it.
    var originalImageTexture = createAndSetupTexture(gl);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

    // create 2 textures and attach them to framebuffers.
    var textures = [];
    var framebuffers = [];
    for (var ii = 0; ii < 2; ++ii) {
        var texture = createAndSetupTexture(gl);
        textures.push(texture);

        // make the texture the same size as the image
        gl.texImage2D(
            gl.TEXTURE_2D, 0, gl.RGBA, image.width, image.height, 0,
            gl.RGBA, gl.UNSIGNED_BYTE, null);

        // Create a framebuffer
        var fbo = gl.createFramebuffer();
        framebuffers.push(fbo);
        gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);

        // Attach a texture to it.
        gl.framebufferTexture2D(
            gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
    }

    // lookup uniforms
    var resolutionLocation = gl.getUniformLocation(gl.program, "u_resolution");
    var textureSizeLocation = gl.getUniformLocation(gl.program, "u_textureSize");
    var kernelLocation = gl.getUniformLocation(gl.program, "u_kernel[0]");
    var kernelWeightLocation = gl.getUniformLocation(gl.program, "u_kernelWeight");
    var flipYLocation = gl.getUniformLocation(gl.program, "u_flipY");


    var effects = [
        { name: "gaussianBlur3", on: true },
        { name: "gaussianBlur3", on: true },
        { name: "gaussianBlur3", on: true },
        { name: "sharpness", },
        { name: "sharpness", },
        { name: "sharpness", },
        { name: "sharpen", },
        { name: "sharpen", },
        { name: "sharpen", },
        { name: "unsharpen", },
        { name: "unsharpen", },
        { name: "unsharpen", },
        { name: "emboss", on: true },
        { name: "edgeDetect", },
        { name: "edgeDetect", },
        { name: "edgeDetect3", },
        { name: "edgeDetect3", },
    ];

    drawEffects();

    function computeKernelWeight(kernel) {
        var weight = kernel.reduce(function (prev, curr) {
            return prev + curr;
        });
        return weight <= 0 ? 1 : weight;
    }

    function drawEffects(name?) {
        // webglUtils.resizeCanvasToDisplaySize(gl.canvas);

        // Clear the canvas
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);

        // Tell it to use our program (pair of shaders)
        gl.useProgram(gl.program);

        // Turn on the position attribute
        gl.enableVertexAttribArray(positionLocation);

        // Bind the position buffer.
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

        // Tell the position attribute how to get data out of positionBuffer (ARRAY_BUFFER)
        var size = 2;          // 2 components per iteration
        var type = gl.FLOAT;   // the data is 32bit floats
        var normalize = false; // don't normalize the data
        var stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
        var offset = 0;        // start at the beginning of the buffer
        gl.vertexAttribPointer(
            positionLocation, size, type, normalize, stride, offset);

        // Turn on the texcoord attribute
        gl.enableVertexAttribArray(texcoordLocation);

        // bind the texcoord buffer.
        gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer);

        // Tell the texcoord attribute how to get data out of texcoordBuffer (ARRAY_BUFFER)
        var size = 2;          // 2 components per iteration
        var type = gl.FLOAT;   // the data is 32bit floats
        var normalize = false; // don't normalize the data
        var stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
        var offset = 0;        // start at the beginning of the buffer
        gl.vertexAttribPointer(
            texcoordLocation, size, type, normalize, stride, offset);

        // set the size of the image
        gl.uniform2f(textureSizeLocation, image.width, image.height);

        // start with the original image
        gl.bindTexture(gl.TEXTURE_2D, originalImageTexture);

        // don't y flip images while drawing to the textures
        gl.uniform1f(flipYLocation, 1);

        // loop through each effect we want to apply.
        var count = 0;
        for (var key in effects) {
            let data = effects[key];

            if (data.on) {
                // Setup to draw into one of the framebuffers.
                setFramebuffer(framebuffers[count % 2], image.width, image.height);

                drawWithKernel(data.name);

                // for the next draw, use the texture we just rendered to.
                gl.bindTexture(gl.TEXTURE_2D, textures[count % 2]);

                // increment count so we use the other texture next time.
                ++count;
            }
        }

        // finally draw the result to the canvas.
        gl.uniform1f(flipYLocation, -1);  // need to y flip for canvas
        setFramebuffer(null, gl.canvas.width, gl.canvas.height);
        drawWithKernel("normal");
    }

    function setFramebuffer(fbo, width, height) {
        // make this the framebuffer we are rendering to.
        gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);

        // Tell the shader the resolution of the framebuffer.
        gl.uniform2f(resolutionLocation, width, height);

        // Tell webgl the viewport setting needed for framebuffer.
        gl.viewport(0, 0, width, height);
    }


    function drawWithKernel(name) {
        // set the kernel and it's weight
        gl.uniform1fv(kernelLocation, kernels[name]);
        gl.uniform1f(kernelWeightLocation, computeKernelWeight(kernels[name]));

        // Draw the rectangle.
        var primitiveType = gl.TRIANGLES;
        var offset = 0;
        var count = 6;
        gl.drawArrays(primitiveType, offset, count);
    }
}
