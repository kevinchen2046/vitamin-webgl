// cuon-utils.js (c) 2012 kanda and matsuda
var Utils;
(function (Utils) {
    /**
     * 创建program对象并使其成为当前对象
     * @param gl GL 渲染上下文
     * @param vshader 顶点着色器程序 (string)
     * @param fshader 片段着色器程序 (string)
     * @return 如果program对象已创建并成功成为当前对象，则为true
     */
    function initShaders(gl, vshader, fshader) {
        var program = createProgram(gl, vshader, fshader);
        if (!program) {
            console.log('Failed to create program');
            return false;
        }
        gl.useProgram(program);
        gl.program = program;
        return true;
    }
    Utils.initShaders = initShaders;
    /**
     * 创建链接的program对象
     * @param gl GL 渲染上下文
     * @param vshader 顶点着色器程序 (string)
     * @param fshader 片段着色器程序 (string)
     * @return 已创建program对象，如果创建失败，则为空
     */
    function createProgram(gl, vshader, fshader) {
        // Create shader object
        var vertexShader = loadShader(gl, gl.VERTEX_SHADER, vshader);
        var fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fshader);
        if (!vertexShader || !fragmentShader) {
            return null;
        }
        // Create a program object
        var program = gl.createProgram();
        if (!program) {
            return null;
        }
        // Attach the shader objects
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        // Link the program object
        gl.linkProgram(program);
        // Check the result of linking
        var linked = gl.getProgramParameter(program, gl.LINK_STATUS);
        if (!linked) {
            var error = gl.getProgramInfoLog(program);
            console.log('Failed to link program: ' + error);
            gl.deleteProgram(program);
            gl.deleteShader(fragmentShader);
            gl.deleteShader(vertexShader);
            return null;
        }
        return program;
    }
    Utils.createProgram = createProgram;
    /**
     * Create a shader object
     * @param gl GL context
     * @param type the type of the shader object to be created
     * @param source shader program (string)
     * @return created shader object, or null if the creation has failed.
     */
    function loadShader(gl, type, source) {
        // Create shader object
        var shader = gl.createShader(type);
        if (shader == null) {
            console.log('unable to create shader');
            return null;
        }
        // Set the shader program
        gl.shaderSource(shader, source);
        // Compile the shader
        gl.compileShader(shader);
        // Check the result of compilation
        var compiled = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
        if (!compiled) {
            var error = gl.getShaderInfoLog(shader);
            console.log('Failed to compile shader: ' + error);
            gl.deleteShader(shader);
            return null;
        }
        return shader;
    }
    /**
     * 初始化并获取WebGL的渲染上下文
     * @param canvas <cavnas> 元素
     * @param opt_debug 用于初始化调试上下文的标志,如果opt_debug显式为false，则创建用于调试的上下文
     * @return WebGL的渲染上下文
     */
    function getWebGLContext(canvas, opt_debug) {
        // 获取WebGL的渲染上下文
        var gl = Utils.setupWebGL(canvas);
        if (!gl)
            return null;
        // 如果opt_debug显式为false，则创建用于调试的上下文
        if (arguments.length < 2 || opt_debug) {
            gl = Utils.makeDebugContext(gl);
        }
        return gl;
    }
    Utils.getWebGLContext = getWebGLContext;
})(Utils || (Utils = {}));
//# sourceMappingURL=cuon-utils.js.map