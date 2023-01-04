// OBJViewer.js (c) 2012 matsuda and itami
// Vertex shader program
var VSHADER_SOURCE =
  'attribute vec4 a_Position;\n' +
  'attribute vec4 a_Color;\n' +
  'attribute vec4 a_Normal;\n' +
  'uniform mat4 u_MvpMatrix;\n' +
  'uniform mat4 u_NormalMatrix;\n' +
  'varying vec4 v_Color;\n' +
  'void main() {\n' +
  '  vec3 lightDirection = vec3(-0.35, 0.35, 0.87);\n' +
  '  gl_Position = u_MvpMatrix * a_Position;\n' +
  '  vec3 normal = normalize(vec3(u_NormalMatrix * a_Normal));\n' +
  '  float nDotL = max(dot(normal, lightDirection), 0.0);\n' +
  '  v_Color = vec4(a_Color.rgb * nDotL, a_Color.a);\n' +
  '}\n';

// Fragment shader program
var FSHADER_SOURCE =
  '#ifdef GL_ES\n' +
  'precision mediump float;\n' +
  '#endif\n' +
  'varying vec4 v_Color;\n' +
  'void main() {\n' +
  '  gl_FragColor = v_Color;\n' +
  '}\n';
namespace Utils {

  // Analyze the material file
  export function onReadMTLFile(fileString, mtl) {
    var lines = fileString.split('\n');  // Break up into lines and store them as array
    lines.push(null);           // Append null
    var index = 0;              // Initialize index of line

    // Parse line by line
    var line;      // A string in the line to be parsed
    var name = ""; // Material name
    var sp = new Utils.StringParser();  // Create StringParser
    while ((line = lines[index++]) != null) {
      sp.init(line);                  // init StringParser
      var command = sp.getWord();     // Get command
      if (command == null) continue;  // check null command

      switch (command) {
        case '#':
          continue;    // Skip comments
        case 'newmtl': // Read Material chunk
          name = mtl.parseNewmtl(sp);    // Get name
          continue; // Go to the next line
        case 'Kd':   // Read normal
          if (name == "") continue; // Go to the next line because of Error
          var material = mtl.parseRGB(sp, name);
          mtl.materials.push(material);
          name = "";
          continue; // Go to the next line
      }
    }
    mtl.complete = true;
  }


  // Get the length of word
  export function getWordLength(str, start) {
    var n = 0;
    for (var i = start, len = str.length; i < len; i++) {
      var c = str.charAt(i);
      if (c == '\t' || c == ' ' || c == '(' || c == ')' || c == '"')
        break;
    }
    return i - start;
  }

  //------------------------------------------------------------------------------
  // Common function
  //------------------------------------------------------------------------------
  export function calcNormal(p0, p1, p2) {
    // v0: a vector from p1 to p0, v1; a vector from p1 to p2
    var v0 = new Float32Array(3);
    var v1 = new Float32Array(3);
    for (var i = 0; i < 3; i++) {
      v0[i] = p0[i] - p1[i];
      v1[i] = p2[i] - p1[i];
    }

    // The cross product of v0 and v1
    var c = new Float32Array(3);
    c[0] = v0[1] * v1[2] - v0[2] * v1[1];
    c[1] = v0[2] * v1[0] - v0[0] * v1[2];
    c[2] = v0[0] * v1[1] - v0[1] * v1[0];

    // Normalize the result
    var v = new Utils.Vector3(c);
    v.normalize();
    return v.elements;
  }
  //------------------------------------------------------------------------------
  // OBJObject Object
  //------------------------------------------------------------------------------
  export class OBJObject {
    public name: string;
    public faces: number[];
    public numIndices: number;
    constructor(name) {
      this.name = name;
      this.faces = new Array(0);
      this.numIndices = 0;
    }
    addFace(face) {
      this.faces.push(face);
      this.numIndices += face.numIndices;
    }


  }

  //------------------------------------------------------------------------------
  // MTLDoc Object
  //------------------------------------------------------------------------------
  export class MTLDoc {
    public complete: boolean;
    public materials: number[];
    constructor() {
      this.complete = false; // MTL is configured correctly
      this.materials = new Array(0);
    }
    parseNewmtl(sp) {
      return sp.getWord();         // Get name
    }

    parseRGB(sp, name) {
      var r = sp.getFloat();
      var g = sp.getFloat();
      var b = sp.getFloat();
      return (new Material(name, r, g, b, 1));
    }
  }



  //------------------------------------------------------------------------------
  // Material Object
  //------------------------------------------------------------------------------
  export function Material(name, r, g, b, a) {
    this.name = name;
    this.color = new Color(r, g, b, a);
  }

  //------------------------------------------------------------------------------
  // Vertex Object
  //------------------------------------------------------------------------------
  export function Vertex(x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z;
  }

  //------------------------------------------------------------------------------
  // Normal Object
  //------------------------------------------------------------------------------
  export function Normal(x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z;
  }

  //------------------------------------------------------------------------------
  // Color Object
  //------------------------------------------------------------------------------
  export function Color(r, g, b, a) {
    this.r = r;
    this.g = g;
    this.b = b;
    this.a = a;
  }



  //------------------------------------------------------------------------------
  // Face Object
  //------------------------------------------------------------------------------
  export class Face {
    public materialName: string;
    public vIndices: number[];
    public nIndices;
    public normal;
    public numIndices;
    constructor(materialName) {
      this.materialName = materialName;
      if (materialName == null) this.materialName = "";
      this.vIndices = new Array(0);
      this.nIndices
    }
  }

  //------------------------------------------------------------------------------
  // DrawInfo Object
  //------------------------------------------------------------------------------
  export class DrawingInfo {
    public vertices;
    public normals;
    public colors;
    public indices;
    constructor(vertices, normals, colors, indices) {
      this.vertices = vertices;
      this.normals = normals;
      this.colors = colors;
      this.indices = indices;
    }
  }
  //------------------------------------------------------------------------------
  // Constructor
  export class StringParser {
    private str: string;// Store the string specified by the argument
    private index: number;// Position in the string to be processed
    constructor(str?: string) {
      this.init(str);
    }
    // Initialize StringParser object
    init(str: string) {
      this.str = str;
      this.index = 0;
    }

    // Skip delimiters
    skipDelimiters() {
      for (var i = this.index, len = this.str.length; i < len; i++) {
        var c = this.str.charAt(i);
        // Skip TAB, Space, '(', ')
        if (c == '\t' || c == ' ' || c == '(' || c == ')' || c == '"') continue;
        break;
      }
      this.index = i;
    }

    // Skip to the next word
    skipToNextWord() {
      this.skipDelimiters();
      var n = getWordLength(this.str, this.index);
      this.index += (n + 1);
    }

    // Get word
    getWord() {
      this.skipDelimiters();
      var n = getWordLength(this.str, this.index);
      if (n == 0) return null;
      var word = this.str.substr(this.index, n);
      this.index += (n + 1);

      return word;
    }

    // Get integer
    getInt() {
      return parseInt(this.getWord());
    }

    // Get floating number
    getFloat() {
      return parseFloat(this.getWord());
    }
  }
  // Check Materials
  export function isMTLComplete() {
    if (this.mtls.length == 0) return true;
    for (var i = 0; i < this.mtls.length; i++) {
      if (!this.mtls[i].complete) return false;
    }
    return true;
  }

  // Find color by material name
  export function findColor(name) {
    for (var i = 0; i < this.mtls.length; i++) {
      for (var j = 0; j < this.mtls[i].materials.length; j++) {
        if (this.mtls[i].materials[j].name == name) {
          return (this.mtls[i].materials[j].color)
        }
      }
    }
    return (new Color(0.8, 0.8, 0.8, 1));
  }

  //------------------------------------------------------------------------------
  // Retrieve the information for drawing 3D model
  export function getDrawingInfo() {
    // Create an arrays for vertex coordinates, normals, colors, and indices
    var numIndices = 0;
    for (var i = 0; i < this.objects.length; i++) {
      numIndices += this.objects[i].numIndices;
    }
    var numVertices = numIndices;
    var vertices = new Float32Array(numVertices * 3);
    var normals = new Float32Array(numVertices * 3);
    var colors = new Float32Array(numVertices * 4);
    var indices = new Uint16Array(numIndices);

    // Set vertex, normal and color
    var index_indices = 0;
    for (var i = 0; i < this.objects.length; i++) {
      var object = this.objects[i];
      for (var j = 0; j < object.faces.length; j++) {
        var face = object.faces[j];
        var color = this.findColor(face.materialName);
        var faceNormal = face.normal;
        for (var k = 0; k < face.vIndices.length; k++) {
          // Set index
          indices[index_indices] = index_indices;
          // Copy vertex
          var vIdx = face.vIndices[k];
          var vertex = this.vertices[vIdx];
          vertices[index_indices * 3 + 0] = vertex.x;
          vertices[index_indices * 3 + 1] = vertex.y;
          vertices[index_indices * 3 + 2] = vertex.z;
          // Copy color
          colors[index_indices * 4 + 0] = color.r;
          colors[index_indices * 4 + 1] = color.g;
          colors[index_indices * 4 + 2] = color.b;
          colors[index_indices * 4 + 3] = color.a;
          // Copy normal
          var nIdx = face.nIndices[k];
          if (nIdx >= 0) {
            var normal = this.normals[nIdx];
            normals[index_indices * 3 + 0] = normal.x;
            normals[index_indices * 3 + 1] = normal.y;
            normals[index_indices * 3 + 2] = normal.z;
          } else {
            normals[index_indices * 3 + 0] = faceNormal.x;
            normals[index_indices * 3 + 1] = faceNormal.y;
            normals[index_indices * 3 + 2] = faceNormal.z;
          }
          index_indices++;
        }
      }
    }

    return new DrawingInfo(vertices, normals, colors, indices);
  }

  //------------------------------------------------------------------------------
  // OBJParser
  //------------------------------------------------------------------------------

  // OBJDoc object
  // Constructor
  export class OBJDoc {
    public fileName: string;
    public mtls: Array<any>;
    public objects: Array<any>;
    public vertices: Array<any>;
    public normals: Array<any>;
    constructor(fileName) {
      this.fileName = fileName;
      this.mtls = new Array(0);      // Initialize the property for MTL
      this.objects = new Array(0);   // Initialize the property for Object
      this.vertices = new Array(0);  // Initialize the property for Vertex
      this.normals = new Array(0);   // Initialize the property for Normal
    }

    // Parsing the OBJ file
    parse(fileString, scale, reverse) {
      var lines = fileString.split('\n');  // Break up into lines and store them as array
      lines.push(null); // Append null
      var index = 0;    // Initialize index of line

      var currentObject = null;
      var currentMaterialName = "";

      // Parse line by line
      var line;         // A string in the line to be parsed
      var sp = new Utils.StringParser();  // Create StringParser
      while ((line = lines[index++]) != null) {
        sp.init(line);                  // init StringParser
        var command = sp.getWord();     // Get command
        if (command == null) continue;  // check null command

        switch (command) {
          case '#':
            continue;  // Skip comments
          case 'mtllib':     // Read Material chunk
            var path = this.parseMtllib(sp, this.fileName);
            var mtl = new MTLDoc();   // Create MTL instance
            this.mtls.push(mtl);
            var request = new XMLHttpRequest();
            request.onreadystatechange = () => {
              if (request.readyState == 4) {
                if (request.status != 404) {
                  onReadMTLFile(request.responseText, mtl);
                } else {
                  mtl.complete = true;
                }
              }
            }
            request.open('GET', path, true);  // Create a request to acquire the file
            request.send();                   // Send the request
            continue; // Go to the next line
          case 'o':
          case 'g':   // Read Object name
            var object = this.parseObjectName(sp);
            this.objects.push(object);
            currentObject = object;
            continue; // Go to the next line
          case 'v':   // Read vertex
            var vertex = this.parseVertex(sp, scale);
            this.vertices.push(vertex);
            continue; // Go to the next line
          case 'vn':   // Read normal
            var normal = this.parseNormal(sp);
            this.normals.push(normal);
            continue; // Go to the next line
          case 'usemtl': // Read Material name
            currentMaterialName = this.parseUsemtl(sp);
            continue; // Go to the next line
          case 'f': // Read face
            var face = this.parseFace(sp, currentMaterialName, this.vertices, reverse);
            currentObject.addFace(face);
            continue; // Go to the next line
        }
      }

      return true;
    }

    parseMtllib(sp, fileName) {
      // Get directory path
      var i = fileName.lastIndexOf("/");
      var dirPath = "";
      if (i > 0) dirPath = fileName.substr(0, i + 1);

      return dirPath + sp.getWord();   // Get path
    }

    parseObjectName(sp) {
      var name = sp.getWord();
      return (new OBJObject(name));
    }

    parseVertex(sp, scale) {
      var x = sp.getFloat() * scale;
      var y = sp.getFloat() * scale;
      var z = sp.getFloat() * scale;
      return (new Vertex(x, y, z));
    }

    parseNormal(sp) {
      var x = sp.getFloat();
      var y = sp.getFloat();
      var z = sp.getFloat();
      return (new Normal(x, y, z));
    }

    parseUsemtl(sp) {
      return sp.getWord();
    }

    parseFace(sp, materialName, vertices, reverse) {
      var face = new Face(materialName);
      // get indices
      for (; ;) {
        var word = sp.getWord();
        if (word == null) break;
        var subWords = word.split('/');
        if (subWords.length >= 1) {
          var vi = parseInt(subWords[0]) - 1;
          face.vIndices.push(vi);
        }
        if (subWords.length >= 3) {
          var ni = parseInt(subWords[2]) - 1;
          face.nIndices.push(ni);
        } else {
          face.nIndices.push(-1);
        }
      }

      // calc normal
      var v0 = [
        vertices[face.vIndices[0]].x,
        vertices[face.vIndices[0]].y,
        vertices[face.vIndices[0]].z];
      var v1 = [
        vertices[face.vIndices[1]].x,
        vertices[face.vIndices[1]].y,
        vertices[face.vIndices[1]].z];
      var v2 = [
        vertices[face.vIndices[2]].x,
        vertices[face.vIndices[2]].y,
        vertices[face.vIndices[2]].z];

      // 面の法線を計算してnormalに設定
      var normal: any = calcNormal(v0, v1, v2);
      // 法線が正しく求められたか調べる
      if (normal == null) {
        if (face.vIndices.length >= 4) { // 面が四角形なら別の3点の組み合わせで法線計算
          var v3 = [
            vertices[face.vIndices[3]].x,
            vertices[face.vIndices[3]].y,
            vertices[face.vIndices[3]].z];
          normal = calcNormal(v1, v2, v3);
        }
        if (normal == null) {         // 法線が求められなかったのでY軸方向の法線とする
          normal = [0.0, 1.0, 0.0];
        }
      }
      if (reverse) {
        normal[0] = -normal[0];
        normal[1] = -normal[1];
        normal[2] = -normal[2];
      }
      face.normal = new Normal(normal[0], normal[1], normal[2]);

      // Devide to triangles if face contains over 3 points.
      if (face.vIndices.length > 3) {
        var n = face.vIndices.length - 2;
        var newVIndices = new Array(n * 3);
        var newNIndices = new Array(n * 3);
        for (var i = 0; i < n; i++) {
          newVIndices[i * 3 + 0] = face.vIndices[0];
          newVIndices[i * 3 + 1] = face.vIndices[i + 1];
          newVIndices[i * 3 + 2] = face.vIndices[i + 2];
          newNIndices[i * 3 + 0] = face.nIndices[0];
          newNIndices[i * 3 + 1] = face.nIndices[i + 1];
          newNIndices[i * 3 + 2] = face.nIndices[i + 2];
        }
        face.vIndices = newVIndices;
        face.nIndices = newNIndices;
      }
      face.numIndices = face.vIndices.length;

      return face;
    }
  }
}


////---------------------


class OBJViewer {
  constructor() {
    // Retrieve <canvas> element
    var canvas = document.getElementById('webgl') as HTMLCanvasElement;

    // Get the rendering context for WebGL
    var gl = cuonUtils.getWebGLContext(canvas);
    if (!gl) {
      console.log('Failed to get the rendering context for WebGL');
      return;
    }

    // Initialize shaders
    if (!Utils.initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
      console.log('Failed to intialize shaders.');
      return;
    }

    // Set the clear color and enable the depth test
    gl.clearColor(0.2, 0.2, 0.2, 1.0);
    gl.enable(gl.DEPTH_TEST);

    // Get the storage locations of attribute and uniform variables
    var program = gl.program;
    program.a_Position = gl.getAttribLocation(program, 'a_Position');
    program.a_Normal = gl.getAttribLocation(program, 'a_Normal');
    program.a_Color = gl.getAttribLocation(program, 'a_Color');
    program.u_MvpMatrix = gl.getUniformLocation(program, 'u_MvpMatrix');
    program.u_NormalMatrix = gl.getUniformLocation(program, 'u_NormalMatrix');

    if (program.a_Position < 0 || program.a_Normal < 0 || program.a_Color < 0 ||
      !program.u_MvpMatrix || !program.u_NormalMatrix) {
      console.log('attribute, uniform変数の格納場所の取得に失敗');
      return;
    }

    // Prepare empty buffer objects for vertex coordinates, colors, and normals
    var model = this.initVertexBuffers(gl, program);
    if (!model) {
      console.log('Failed to set the vertex information');
      return;
    }

    // ビュー投影行列を計算
    var viewProjMatrix = new cuonMatix.Matrix4();
    viewProjMatrix.setPerspective(30.0, canvas.width / canvas.height, 1.0, 5000.0);
    viewProjMatrix.lookAt(0.0, 500.0, 200.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0);

    // Start reading the OBJ file
    this.readOBJFile('cube.obj', gl, model, 60, true);

    var currentAngle = 0.0; // Current rotation angle [degree]
    var tick = () => {   // Start drawing
      currentAngle = this.animate(currentAngle); // Update current rotation angle
      this.draw(gl, gl.program, currentAngle, viewProjMatrix, model);
      requestAnimationFrame(tick);
    };
    tick();
  }

  // Create an buffer object and perform an initial configuration
  initVertexBuffers(gl, program) {
    var o: any = new Object(); // Utilize Object object to return multiple buffer objects
    o.vertexBuffer = this.createEmptyArrayBuffer(gl, program.a_Position, 3, gl.FLOAT);
    o.normalBuffer = this.createEmptyArrayBuffer(gl, program.a_Normal, 3, gl.FLOAT);
    o.colorBuffer = this.createEmptyArrayBuffer(gl, program.a_Color, 4, gl.FLOAT);
    o.indexBuffer = gl.createBuffer();
    if (!o.vertexBuffer || !o.normalBuffer || !o.colorBuffer || !o.indexBuffer) { return null; }

    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    return o;
  }

  // Create a buffer object, assign it to attribute variables, and enable the assignment
  createEmptyArrayBuffer(gl, a_attribute, num, type) {
    var buffer = gl.createBuffer();  // Create a buffer object
    if (!buffer) {
      console.log('Failed to create the buffer object');
      return null;
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.vertexAttribPointer(a_attribute, num, type, false, 0, 0);  // Assign the buffer object to the attribute variable
    gl.enableVertexAttribArray(a_attribute);  // Enable the assignment

    return buffer;
  }

  // Read a file
  readOBJFile(fileName, gl, model, scale, reverse) {
    var request = new XMLHttpRequest();

    request.onreadystatechange = () => {
      if (request.readyState === 4 && request.status !== 404) {
        this.onReadOBJFile(request.responseText, fileName, gl, model, scale, reverse);
      }
    }
    request.open('GET', fileName, true); // Create a request to acquire the file
    request.send();                      // Send the request
  }

  private g_objDoc = null;      // The information of OBJ file
  private g_drawingInfo = null; // The information for drawing 3D model

  // OBJ File has been read
  onReadOBJFile(fileString, fileName, gl, o, scale, reverse) {
    var objDoc = new Utils.OBJDoc(fileName);  // Create a OBJDoc object
    var result = objDoc.parse(fileString, scale, reverse); // Parse the file
    if (!result) {
      this.g_objDoc = null; this.g_drawingInfo = null;
      console.log("OBJ file parsing error.");
      return;
    }
    this.g_objDoc = objDoc;
  }

  // Coordinate transformation matrix
  private g_modelMatrix = new cuonMatix.Matrix4();
  private g_mvpMatrix = new cuonMatix.Matrix4();
  private g_normalMatrix = new cuonMatix.Matrix4();

  // 描画関数
  draw(gl, program, angle, viewProjMatrix, model) {
    if (this.g_objDoc != null && this.g_objDoc.isMTLComplete()) { // OBJ and all MTLs are available
      this.g_drawingInfo = this.onReadComplete(gl, model, this.g_objDoc);
      this.g_objDoc = null;
    }
    if (!this.g_drawingInfo) return;   // モデルを読み込み済みか判定

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);  // Clear color and depth buffers

    this.g_modelMatrix.setRotate(angle, 1.0, 0.0, 0.0); // 適当に回転
    this.g_modelMatrix.rotate(angle, 0.0, 1.0, 0.0);
    this.g_modelMatrix.rotate(angle, 0.0, 0.0, 1.0);

    // Calculate the normal transformation matrix and pass it to u_NormalMatrix
    this.g_normalMatrix.setInverseOf(this.g_modelMatrix);
    this.g_normalMatrix.transpose();
    gl.uniformMatrix4fv(program.u_NormalMatrix, false, this.g_normalMatrix.elements);

    // Calculate the model view project matrix and pass it to u_MvpMatrix
    this.g_mvpMatrix.set(viewProjMatrix);
    this.g_mvpMatrix.multiply(this.g_modelMatrix);
    gl.uniformMatrix4fv(program.u_MvpMatrix, false, this.g_mvpMatrix.elements);

    // Draw
    gl.drawElements(gl.TRIANGLES, this.g_drawingInfo.indices.length, gl.UNSIGNED_SHORT, 0);
  }

  // OBJ File has been read compreatly
  onReadComplete(gl, model, objDoc) {
    // Acquire the vertex coordinates and colors from OBJ file
    var drawingInfo = objDoc.getDrawingInfo();

    // Write date into the buffer object
    gl.bindBuffer(gl.ARRAY_BUFFER, model.vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, drawingInfo.vertices, gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, model.normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, drawingInfo.normals, gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, model.colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, drawingInfo.colors, gl.STATIC_DRAW);

    // Write the indices to the buffer object
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, model.indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, drawingInfo.indices, gl.STATIC_DRAW);

    return drawingInfo;
  }

  private ANGLE_STEP = 30;   // The increments of rotation angle (degrees)

  private last = Date.now(); // Last time that this function was called
  animate(angle) {
    var now = Date.now();   // Calculate the elapsed time
    var elapsed = now - this.last;
    this.last = now;
    // Update the current rotation angle (adjusted by the elapsed time)
    var newAngle = angle + (this.ANGLE_STEP * elapsed) / 1000.0;
    return newAngle % 360;
  }
}
