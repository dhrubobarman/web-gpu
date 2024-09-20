import { createElement } from '@/utils/createElement';

export const checkForWebGPU = () => {
  const output_label = createElement('h1', {
    className: 'underline fixed m-auto inset-0 max-w-fit max-h-fit text-[30px] font-bold animate-pulse select-none text-white/50 pointer-events-none',
    innerText: 'Testing'
  });

  if (navigator.gpu) {
    output_label.innerText = 'WebGPU is available';
    output_label.classList.add('hidden');
    return true;
  } else {
    output_label.innerText = 'WebGPU is not available';
    return false;
  }
};
