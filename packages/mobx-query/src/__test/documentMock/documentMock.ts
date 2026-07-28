import { mock } from 'vitest-mock-extended';

export const createDocumentMock = () => {
  let isVisible = true;
  const listeners: Array<() => void> = [];

  const documentMock = mock<
    Pick<Document, 'addEventListener' | 'visibilityState'>
  >({
    addEventListener: ((
      _event: string,
      listener: EventListenerOrEventListenerObject,
    ) => {
      if (typeof listener === 'function') {
        listeners.push(() => listener(new Event('visibilitychange')));
      }
    }) as Document['addEventListener'],
    get visibilityState() {
      return isVisible ? 'visible' : 'hidden';
    },
    set visibilityState(_value: Document['visibilityState']) {
      void _value;
    },
  });

  const triggerVisibilityChange = () => {
    isVisible = !isVisible;
    listeners.forEach((listener) => listener());
  };

  return { documentMock, triggerVisibilityChange };
};
