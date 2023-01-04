import { Geometry } from "./Geometry";

var VSHADER_SOURCE =
/*glsl*/`
#ifdef GL_ES
    precision mediump float;
#endif
attribute vec4 a_Position;
attribute vec4 a_Color;

varying vec2 v_TexCoord;
varying vec4 v_Color;
uniform float u_time;
void main() {
    float x=a_Position.x;
    float y=a_Position.y;
    float time=u_time/30.0;
    float x1=x-0.5;
    float y1=0.5-y;
    float dis=sin(0.5-x1)+cos(y1);
    x+=sin(dis+time)/5.0;
    y+=cos(dis+time)/5.0;
    gl_Position=vec4(x,y,0.0,1.0);
    v_Color=a_Color;
    v_TexCoord = vec2(a_Position.x-0.5,0.5-a_Position.y);
}`;
// Fragment shader program
var FSHADER_SOURCE =
/*glsl*/`
#ifdef GL_ES
    precision mediump float;
#endif
uniform sampler2D u_Sampler;
varying vec2 v_TexCoord;
varying vec4 v_Color;

void main() {
    //gl_FragColor = v_Color;
    gl_FragColor = texture2D(u_Sampler, v_TexCoord);
 }`


export class HelloTriangle {

    constructor() {
        this.initialize();
    }
    async initialize() {
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

        var u_time_local = gl.getUniformLocation(gl.program, 'u_time');


        // Write the positions of vertices to a vertex shader
        let geometry = new Geometry(8, 8);
        geometry.update();
        // let vertices = new Float32Array(this.getCutRect(
        //     {
        //         a: { x: -0.5, y: 0.5, color: 0xFF0000, offset: { x: 0, y: 0 } },
        //         b: { x: -0.5, y: -0.5, color: 0x00FF00, offset: { x: 0, y: 0 } },
        //         c: { x: 0.5, y: -0.5, color: 0xFFFF00, offset: { x: 0, y: 0 } },
        //         d: { x: 0.5, y: 0.5, color: 0x0000FF, offset: { x: 0, y: 0 } }
        //     }, 1
        // ));

        let vertices = geometry.buffer;

        let BuffLength = 5;

        var count = vertices.length / BuffLength; // The number of vertices
        // Create a buffer object
        var vertexBuffer = gl.createBuffer();
        if (!vertexBuffer) {
            console.log('Failed to create the buffer object');
            return;
        }
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
        // Write date into the buffer object
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.DYNAMIC_DRAW);

        var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
        if (a_Position < 0) {
            console.log('Failed to get the storage location of a_Position');
            return;
        }
        var a_Color = gl.getAttribLocation(gl.program, 'a_Color');
        if (a_Color < 0) {
            console.log('Failed to get the storage location of a_Color');
            return;
        }

        // Get the storage location of a_TexCoord
        // var a_TexCoord = gl.getAttribLocation(gl.program, 'a_TexCoord');
        // if (a_TexCoord < 0) {
        //     console.log('Failed to get the storage location of a_TexCoord');
        //     return -1;
        // }

        if (count < 0) {
            console.log('Failed to set the positions of the vertices');
            return;
        }

        var texture = gl.createTexture();   // Create a texture object
        if (!texture) {
            console.log('Failed to create the texture object');
            return false;
        }

        // Get the storage location of u_Sampler
        var u_Sampler = gl.getUniformLocation(gl.program, 'u_Sampler');
        if (!u_Sampler) {
            console.log('Failed to get the storage location of u_Sampler');
            return false;
        }
        var image = await this.loadImage('../resources/yellowflower.jpg');

        // Enable texture unit0
        gl.activeTexture(gl.TEXTURE0);
        // Bind the texture object to the target
        gl.bindTexture(gl.TEXTURE_2D, texture);

        // Set the texture parameters
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        // Set the texture image
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

        // Set the texture unit 0 to the sampler
        gl.uniform1i(u_Sampler, 0);


        let time = 0;
        // let points = geometry.map.list.map(p => p.clone());

        // let verorg=vertices.slice(0)

        // console.table(geometry.pointToString());
        function renderhandler() {

            time++;
            // let st = time / 10;
            // let rate = (1 - Math.sin(st)) / 2;

            geometry.update();
            // Bind the buffer object to target

            // Specify the color for clearing <canvas>
            gl.clearColor(0, 0, 0, 1);
            // Clear <canvas>
            gl.clear(gl.COLOR_BUFFER_BIT);

            //数组中每个元素的字节大小。
            const FSIZE = vertices.BYTES_PER_ELEMENT;

            gl.uniform1f(u_time_local, time);
            // Assign the buffer object to a_Position variable
            gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, FSIZE * BuffLength, 0);
            // Enable the assignment to a_Position variable
            gl.enableVertexAttribArray(a_Position);

            // Assign the buffer object to a_Position variable
            gl.vertexAttribPointer(a_Color, 3, gl.FLOAT, false, FSIZE * BuffLength, FSIZE * 2);
            // Enable the assignment to a_Position variable
            gl.enableVertexAttribArray(a_Color);

            // Assign the buffer object to a_TexCoord variable
            //gl.vertexAttribPointer(a_TexCoord, 2, gl.FLOAT, false, FSIZE * BuffLength, 0);
            //gl.enableVertexAttribArray(a_TexCoord);  // Enable the assignment of the buffer object

            //gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); // Flip the image's y axis


            // Draw the rectangle
            gl.drawArrays(gl.TRIANGLES, 0, count);
        }

        function __loop() {
            renderhandler();
            window.requestAnimationFrame(__loop);
        }
        __loop();
    }

    loadImage(url) {
        return new Promise<HTMLImageElement>(reslove => {
            var image = new Image();  // Create the image object
            if (!image) {
                console.log('Failed to create the image object');
                reslove(null);
                return false;
            }
            // Register the event handler to be called on loading an image
            image.onload = () => {
                reslove(image);
            };
            // Tell the browser to load an image
            image.src = url;
        })
    }
}
