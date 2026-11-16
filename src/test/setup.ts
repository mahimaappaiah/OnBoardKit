import '@testing-library/jest-dom';

// Robust canvas mock for JSDOM test environments using defineProperty
if (typeof HTMLCanvasElement !== 'undefined') {
  Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
    configurable: true,
    value: (contextId: string) => {
      if (contextId === '2d') {
        return {
          drawImage: () => {},
          translate: () => {},
          scale: () => {},
          fillRect: () => {},
          clearRect: () => {},
          getImageData: () => ({
            data: new Uint8ClampedArray([128, 128, 128, 255, 140, 140, 140, 255]),
          }),
          putImageData: () => {},
        };
      }
      return null;
    },
  });

  Object.defineProperty(HTMLCanvasElement.prototype, 'toDataURL', {
    configurable: true,
    value: () => 'data:image/jpeg;base64,mockcapturedcanvasframe',
  });
}
