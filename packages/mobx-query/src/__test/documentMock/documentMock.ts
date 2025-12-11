import { mock } from 'vitest-mock-extended';

export const createDocumentMock = () => {
  let isVisible = true;
  const listeners: Array<() => void> = [];

  const documentMock = mock<
    Pick<Document, 'addEventListener' | 'visibilityState'>
  >({
    addEventListener: (_event, listener: () => void) =>
      listeners.push(listener),
    get visibilityState() {
      return isVisible ? 'visible' : 'hidden';
    },
    set visibilityState(_value: Document['visibilityState']) {},
  });

  const triggerVisibilityChange = () => {
    isVisible = !isVisible;
    listeners.forEach((listener) => listener());
  };

  return { documentMock, triggerVisibilityChange };
};
