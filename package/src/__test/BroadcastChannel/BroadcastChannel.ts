// Мок не предусматривает полного повторения функционала оригинального BroadcastChannelMock
// поэтому он будет вызывать даже подписчиков вкладки инициатора,
// но благодаря общему подходу, ожидается, что это не вызовет проблем
export const createBroadcastChannelMock = () => {
  const listeners: Array<(event: MessageEvent) => void> = [];

  class BroadcastChannelMock {
    public addEventListener = (
      _event: string,
      listener: (event: MessageEvent) => void,
    ) => listeners.push(listener);

    public postMessage = (data: unknown) =>
      listeners.forEach((listener) => listener({ data } as MessageEvent));
  }

  return BroadcastChannelMock;
};
