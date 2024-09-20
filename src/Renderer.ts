import vertex from '@/shaders/vertex.wgsl?raw';
import fragment from '@/shaders/fragment.wgsl?raw';
import { TriangleMesh } from '@/helperClasses/TriangleMesh';
import { mat4 } from 'gl-matrix';

export class Renderer {
  canvas: HTMLCanvasElement;
  // Device/Context objects
  adapter!: GPUAdapter;
  device!: GPUDevice;
  context!: GPUCanvasContext;
  format!: GPUTextureFormat;

  // Pipeline objects
  uniformBuffer!: GPUBuffer;
  bindGroup!: GPUBindGroup;
  pipeline!: GPURenderPipeline;

  // Assets
  triangleMesh!: TriangleMesh;

  t: number;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.t = 0.0;
  }

  async Initialize() {
    await this.setupDevice();
    this.createAssets();
    await this.makePipeline();
  }

  async setupDevice() {
    this.adapter = <GPUAdapter>await navigator.gpu.requestAdapter();
    this.device = await this.adapter.requestDevice();
    this.context = <GPUCanvasContext>this.canvas.getContext('webgpu');
    this.format = navigator.gpu.getPreferredCanvasFormat();
    this.context.configure({
      device: this.device,
      format: this.format,
      alphaMode: 'opaque'
    });
  }

  async makePipeline() {
    this.uniformBuffer = this.device.createBuffer({
      size: 64 * 3,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
    });

    const bindGroupLayout = this.device.createBindGroupLayout({
      entries: [
        {
          binding: 0,
          visibility: GPUShaderStage.VERTEX,
          buffer: {}
        }
      ]
    });

    this.bindGroup = this.device.createBindGroup({
      layout: bindGroupLayout,
      entries: [
        {
          binding: 0,
          resource: { buffer: this.uniformBuffer }
        }
      ]
    });
    const pipelineLayout = this.device.createPipelineLayout({
      bindGroupLayouts: [bindGroupLayout]
    });

    this.pipeline = this.device.createRenderPipeline({
      vertex: {
        module: this.device.createShaderModule({ code: vertex }),
        entryPoint: 'vs_main',
        buffers: [this.triangleMesh.bufferLayout]
      },
      fragment: {
        module: this.device.createShaderModule({ code: fragment }),
        entryPoint: 'fs_main',
        targets: [{ format: this.format }]
      },
      primitive: { topology: 'triangle-list' },
      layout: pipelineLayout
    });
  }

  createAssets() {
    this.triangleMesh = new TriangleMesh(this.device);
  }

  render() {
    this.t += 0.01;
    if (this.t > 2.0 * Math.PI) {
      this.t -= 2.0 * Math.PI;
    }

    const projectionMatrix = mat4.create();
    // load perspective projection into the projection matrix,
    // Field of view = 45 degrees (pi/4)
    // Aspect ratio = canvas-width/canvas-height
    // near = 0.1, far = 10
    mat4.perspective(projectionMatrix, Math.PI / 4, this.canvas.width / this.canvas.height, 0.1, 10);

    const viewMatrix = mat4.create();
    //load lookat matrix into the view matrix,
    //looking from [-2, 0, 2]
    //looking at [0, 0, 0]
    //up vector is [0, 0, 1]
    mat4.lookAt(viewMatrix, [-2, 0, 2], [0, 0, 0], [0, 0, 1]);

    const modelMatrix = mat4.create();
    //Store, in the model matrix, the model matrix after rotating it by t radians around the z axis.
    //(yeah, I know, kinda weird.)
    mat4.rotate(modelMatrix, modelMatrix, this.t, [0, 0, 1]);

    this.device.queue.writeBuffer(this.uniformBuffer, 0, <ArrayBuffer>modelMatrix);
    this.device.queue.writeBuffer(this.uniformBuffer, 64, <ArrayBuffer>viewMatrix);
    this.device.queue.writeBuffer(this.uniformBuffer, 128, <ArrayBuffer>projectionMatrix);

    const commandEncoder = this.device.createCommandEncoder();
    const textureView = this.context.getCurrentTexture().createView();
    const renderPassDescriptor: GPURenderPassDescriptor = {
      colorAttachments: [
        {
          view: textureView,
          clearValue: { r: 0.0, g: 0.0, b: 0.0, a: 1.0 },
          loadOp: 'clear',
          storeOp: 'store'
        }
      ]
    };
    const renderPass = commandEncoder.beginRenderPass(renderPassDescriptor);
    renderPass.setPipeline(this.pipeline);
    renderPass.setBindGroup(0, this.bindGroup);
    renderPass.setVertexBuffer(0, this.triangleMesh.buffer);
    renderPass.draw(3, 1, 0, 0);
    renderPass.end();

    this.device.queue.submit([commandEncoder.finish()]);
  }
}
