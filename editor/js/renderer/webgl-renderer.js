export class WebGLRenderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.gl = canvas.getContext("webgl2") || canvas.getContext("webgl");
    this.version = this.gl instanceof WebGL2RenderingContext ? "WebGL 2.0" : "WebGL 1.0";
    this.program = null;
    this.buffers = new Map();
    this.lineBuffers = {};
    this.init();
  }

  init() {
    const gl = this.gl;
    const vertexSource = `
      attribute vec3 a_position;
      uniform mat4 u_projection;
      uniform mat4 u_view;
      uniform mat4 u_model;
      uniform vec4 u_color;
      varying vec4 v_color;
      void main() {
        gl_Position = u_projection * u_view * u_model * vec4(a_position, 1.0);
        v_color = u_color;
      }
    `;

    const fragmentSource = `
      precision mediump float;
      varying vec4 v_color;
      void main() {
        gl_FragColor = v_color;
      }
    `;

    const vertexShader = this.createShader(gl.VERTEX_SHADER, vertexSource);
    const fragmentShader = this.createShader(gl.FRAGMENT_SHADER, fragmentSource);
    this.program = this.createProgram(vertexShader, fragmentShader);

    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);
    gl.clearColor(0.1, 0.1, 0.1, 1);

    this.createGrid();
    this.createAxes();
  }

  createShader(type, source) {
    const gl = this.gl;
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    return shader;
  }

  createProgram(vs, fs) {
    const gl = this.gl;
    const program = gl.createProgram();
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    return program;
  }

  resize() {
    const { canvas, gl } = this;
    const dpr = window.devicePixelRatio || 1;
    const width = Math.floor(canvas.clientWidth * dpr);
    const height = Math.floor(canvas.clientHeight * dpr);
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
      gl.viewport(0, 0, width, height);
    }
  }

  createGrid(size = 50, divisions = 50) {
    const step = size / divisions;
    const half = size / 2;
    const vertices = [];
    for (let i = 0; i <= divisions; i += 1) {
      const pos = -half + i * step;
      vertices.push(pos, 0, -half, pos, 0, half);
      vertices.push(-half, 0, pos, half, 0, pos);
    }
    this.lineBuffers.grid = this.createLineBuffer(vertices);
  }

  createAxes() {
    const vertices = [
      0, 0, 0, 1, 0, 0,
      0, 0, 0, 0, 1, 0,
      0, 0, 0, 0, 0, 1,
    ];
    this.lineBuffers.axes = this.createLineBuffer(vertices);
  }

  createLineBuffer(vertices) {
    const gl = this.gl;
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    return { buffer, count: vertices.length / 3 };
  }

  getCubeBuffer() {
    if (this.buffers.has("cube")) {
      return this.buffers.get("cube");
    }
    const vertices = [
      // Front
      -1, -1, 1, 1, -1, 1, 1, 1, 1,
      -1, -1, 1, 1, 1, 1, -1, 1, 1,
      // Back
      -1, -1, -1, -1, 1, -1, 1, 1, -1,
      -1, -1, -1, 1, 1, -1, 1, -1, -1,
      // Left
      -1, -1, -1, -1, -1, 1, -1, 1, 1,
      -1, -1, -1, -1, 1, 1, -1, 1, -1,
      // Right
      1, -1, -1, 1, 1, -1, 1, 1, 1,
      1, -1, -1, 1, 1, 1, 1, -1, 1,
      // Top
      -1, 1, -1, -1, 1, 1, 1, 1, 1,
      -1, 1, -1, 1, 1, 1, 1, 1, -1,
      // Bottom
      -1, -1, -1, 1, -1, -1, 1, -1, 1,
      -1, -1, -1, 1, -1, 1, -1, -1, 1,
    ];
    const gl = this.gl;
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    const data = { buffer, count: vertices.length / 3 };
    this.buffers.set("cube", data);
    return data;
  }

  render({ projection, view, meshes, gizmoMode }) {
    const gl = this.gl;
    this.resize();
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.useProgram(this.program);

    const positionLoc = gl.getAttribLocation(this.program, "a_position");
    const projectionLoc = gl.getUniformLocation(this.program, "u_projection");
    const viewLoc = gl.getUniformLocation(this.program, "u_view");
    const modelLoc = gl.getUniformLocation(this.program, "u_model");
    const colorLoc = gl.getUniformLocation(this.program, "u_color");

    gl.uniformMatrix4fv(projectionLoc, false, projection);
    gl.uniformMatrix4fv(viewLoc, false, view);

    this.drawGrid(positionLoc, modelLoc, colorLoc);
    this.drawAxes(positionLoc, modelLoc, colorLoc);

    meshes.forEach((mesh) => {
      if (!mesh.visible) return;
      const buffer = this.getCubeBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer.buffer);
      gl.enableVertexAttribArray(positionLoc);
      gl.vertexAttribPointer(positionLoc, 3, gl.FLOAT, false, 0, 0);

      const model = mat4Identity();
      mat4Translate(model, mesh.transform.position);
      mat4RotateX(model, mesh.transform.rotation[0]);
      mat4RotateY(model, mesh.transform.rotation[1]);
      mat4RotateZ(model, mesh.transform.rotation[2]);
      mat4Scale(model, mesh.transform.scale);

      gl.uniformMatrix4fv(modelLoc, false, model);
      const [r, g, b, a] = mesh.material.color;
      gl.uniform4f(colorLoc, r, g, b, a);
      gl.drawArrays(gl.TRIANGLES, 0, buffer.count);
    });

    if (gizmoMode) {
      this.drawGizmo(positionLoc, modelLoc, colorLoc, gizmoMode);
    }
  }

  drawGrid(positionLoc, modelLoc, colorLoc) {
    const gl = this.gl;
    const { buffer, count } = this.lineBuffers.grid;
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.enableVertexAttribArray(positionLoc);
    gl.vertexAttribPointer(positionLoc, 3, gl.FLOAT, false, 0, 0);
    gl.uniformMatrix4fv(modelLoc, false, mat4Identity());
    gl.uniform4f(colorLoc, 0.27, 0.27, 0.27, 1);
    gl.drawArrays(gl.LINES, 0, count);
  }

  drawAxes(positionLoc, modelLoc, colorLoc) {
    const gl = this.gl;
    const { buffer, count } = this.lineBuffers.axes;
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.enableVertexAttribArray(positionLoc);
    gl.vertexAttribPointer(positionLoc, 3, gl.FLOAT, false, 0, 0);
    gl.uniformMatrix4fv(modelLoc, false, mat4Identity());
    gl.uniform4f(colorLoc, 1, 0.27, 0.27, 1);
    gl.drawArrays(gl.LINES, 0, 2);
    gl.uniform4f(colorLoc, 0.27, 1, 0.27, 1);
    gl.drawArrays(gl.LINES, 2, 2);
    gl.uniform4f(colorLoc, 0.27, 0.27, 1, 1);
    gl.drawArrays(gl.LINES, 4, 2);
  }

  drawGizmo(positionLoc, modelLoc, colorLoc, mode) {
    const gl = this.gl;
    const { buffer, count } = this.lineBuffers.axes;
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.enableVertexAttribArray(positionLoc);
    gl.vertexAttribPointer(positionLoc, 3, gl.FLOAT, false, 0, 0);
    gl.uniformMatrix4fv(modelLoc, false, mat4ScaleMatrix([1.8, 1.8, 1.8]));
    const alpha = mode === "move" ? 1 : 0.5;
    gl.uniform4f(colorLoc, 1, 0.2, 0.2, alpha);
    gl.drawArrays(gl.LINES, 0, 2);
    gl.uniform4f(colorLoc, 0.2, 1, 0.2, alpha);
    gl.drawArrays(gl.LINES, 2, 2);
    gl.uniform4f(colorLoc, 0.2, 0.2, 1, alpha);
    gl.drawArrays(gl.LINES, 4, 2);
  }
}

export function mat4Identity() {
  return new Float32Array([
    1, 0, 0, 0,
    0, 1, 0, 0,
    0, 0, 1, 0,
    0, 0, 0, 1,
  ]);
}

export function mat4Perspective(fov, aspect, near, far) {
  const f = 1 / Math.tan((fov * Math.PI) / 360);
  const rangeInv = 1 / (near - far);
  return new Float32Array([
    f / aspect, 0, 0, 0,
    0, f, 0, 0,
    0, 0, (near + far) * rangeInv, -1,
    0, 0, near * far * rangeInv * 2, 0,
  ]);
}

export function mat4LookAt(eye, target, up) {
  const zAxis = normalize(subtract(eye, target));
  const xAxis = normalize(cross(up, zAxis));
  const yAxis = cross(zAxis, xAxis);

  return new Float32Array([
    xAxis[0], yAxis[0], zAxis[0], 0,
    xAxis[1], yAxis[1], zAxis[1], 0,
    xAxis[2], yAxis[2], zAxis[2], 0,
    -dot(xAxis, eye), -dot(yAxis, eye), -dot(zAxis, eye), 1,
  ]);
}

export function mat4Translate(matrix, position) {
  const [x, y, z] = position;
  matrix[12] += x;
  matrix[13] += y;
  matrix[14] += z;
}

export function mat4Scale(matrix, scale) {
  matrix[0] *= scale[0];
  matrix[5] *= scale[1];
  matrix[10] *= scale[2];
}

export function mat4ScaleMatrix(scale) {
  return new Float32Array([
    scale[0], 0, 0, 0,
    0, scale[1], 0, 0,
    0, 0, scale[2], 0,
    0, 0, 0, 1,
  ]);
}

export function mat4RotateX(matrix, deg) {
  const rad = (deg * Math.PI) / 180;
  const c = Math.cos(rad);
  const s = Math.sin(rad);
  const m1 = matrix[1];
  const m5 = matrix[5];
  const m9 = matrix[9];
  matrix[1] = m1 * c + matrix[2] * -s;
  matrix[5] = m5 * c + matrix[6] * -s;
  matrix[9] = m9 * c + matrix[10] * -s;
  matrix[2] = m1 * s + matrix[2] * c;
  matrix[6] = m5 * s + matrix[6] * c;
  matrix[10] = m9 * s + matrix[10] * c;
}

export function mat4RotateY(matrix, deg) {
  const rad = (deg * Math.PI) / 180;
  const c = Math.cos(rad);
  const s = Math.sin(rad);
  const m0 = matrix[0];
  const m4 = matrix[4];
  const m8 = matrix[8];
  matrix[0] = m0 * c + matrix[2] * s;
  matrix[4] = m4 * c + matrix[6] * s;
  matrix[8] = m8 * c + matrix[10] * s;
  matrix[2] = m0 * -s + matrix[2] * c;
  matrix[6] = m4 * -s + matrix[6] * c;
  matrix[10] = m8 * -s + matrix[10] * c;
}

export function mat4RotateZ(matrix, deg) {
  const rad = (deg * Math.PI) / 180;
  const c = Math.cos(rad);
  const s = Math.sin(rad);
  const m0 = matrix[0];
  const m4 = matrix[4];
  const m8 = matrix[8];
  matrix[0] = m0 * c + matrix[1] * -s;
  matrix[4] = m4 * c + matrix[5] * -s;
  matrix[8] = m8 * c + matrix[9] * -s;
  matrix[1] = m0 * s + matrix[1] * c;
  matrix[5] = m4 * s + matrix[5] * c;
  matrix[9] = m8 * s + matrix[9] * c;
}

function subtract(a, b) {
  return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
}

function cross(a, b) {
  return [
    a[1] * b[2] - a[2] * b[1],
    a[2] * b[0] - a[0] * b[2],
    a[0] * b[1] - a[1] * b[0],
  ];
}

function dot(a, b) {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}

function normalize(v) {
  const len = Math.hypot(v[0], v[1], v[2]) || 1;
  return [v[0] / len, v[1] / len, v[2] / len];
}
