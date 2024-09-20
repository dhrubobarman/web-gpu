export class TriangleMesh {
  buffer!: GPUBuffer;
  bufferLayout!: GPUVertexBufferLayout;

  constructor(device: GPUDevice) {
    this.init(device);
  }

  init(device: GPUDevice) {
    // x y r g b

    // prettier-ignore
    const vertices: Float32Array = new Float32Array(
      [
        0.0,  0.0,  0.5, 1.0, 0.0, 0.0,
        0.0, -0.5, -0.5, 0.0, 1.0, 0.0,
        0.0,  0.5, -0.5, 0.0, 0.0, 1.0
      ]
    );

    const usage: GPUBufferUsageFlags = GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST;
    const descriptor: GPUBufferDescriptor = {
      size: vertices.byteLength,
      usage,
      mappedAtCreation: true
    };
    this.buffer = device.createBuffer(descriptor);
    new Float32Array(this.buffer.getMappedRange()).set(vertices);
    this.buffer.unmap();

    this.bufferLayout = {
      arrayStride: 6 * Float32Array.BYTES_PER_ELEMENT,
      attributes: [
        {
          shaderLocation: 0,
          offset: 0,
          format: 'float32x3'
        },
        {
          shaderLocation: 1,
          offset: 3 * Float32Array.BYTES_PER_ELEMENT,
          format: 'float32x3'
        }
      ]
    };
  }
}
