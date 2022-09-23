class HelloCanvas {
  constructor() {
      // Retrieve <canvas> element
      var canvas = document.getElementById('webgl') as HTMLCanvasElement;

      // Get the rendering context for WebGL
      var gl = Utils.getWebGLContext(canvas);
      if (!gl) {
          console.log('Failed to get the rendering context for WebGL');
          return;
      }

      // Set clear color
      gl.clearColor(0.0, 0.0, 0.0, 1.0);

      // Clear <canvas>
      gl.clear(gl.COLOR_BUFFER_BIT);
  }
}
