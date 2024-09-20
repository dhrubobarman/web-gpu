import { Renderer } from '@/Renderer';
import { checkForWebGPU } from '@/utils/checkForWebGpu';
import './style.scss';
import { createElement } from '@/utils/createElement';

const container = createElement('div', {
  id: 'container',
  className: 'min-h-screen flex items-center justify-center'
});

const canvas = createElement(
  'canvas',
  {
    id: 'webgpu-canvas',
    width: 640,
    height: 480
  },
  container
);

async function main() {
  const isGpuAvailable = checkForWebGPU();
  if (!isGpuAvailable) return;
  const renderer = new Renderer(canvas);
  await renderer.Initialize();
  requestAnimationFrame(() => animate(renderer));
}

function animate(renderer: Renderer) {
  renderer.render();
  requestAnimationFrame(() => animate(renderer));
}

document.addEventListener('DOMContentLoaded', main);
