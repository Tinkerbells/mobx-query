import type { AdaptableMap } from '../AdaptableMap';
import type { KeyHash, UnknownCachedQuery } from '../MobxQuery/types';

/**
 * Сущность для инкапсулирования логики работы с устареванием данных
 */
export class PollingService {
  private timers = new Map<KeyHash, ReturnType<typeof setTimeout>>();

  private timerDates = new Map<
    KeyHash,
    { pollingTime: number; targetDate: number }
  >();

  private isVisible = true;

  constructor(
    private readonly _queryStorage: AdaptableMap<UnknownCachedQuery>,
    private readonly _invalidateByKeyHash: (keyHash: KeyHash) => void,
    private readonly _document: Document | undefined = globalThis.document,
  ) {
    this.init();
  }

  private updateIsVisible = () => {
    this.isVisible = this._document?.visibilityState === 'visible';
  };

  private init = () => {
    this.updateIsVisible();

    this._document?.addEventListener(
      'visibilitychange',
      this.handleVisibilityChange,
    );
  };

  private handleVisibilityChange = () => {
    this.updateIsVisible();

    if (this.isVisible) {
      this.restartPausedTimers();
    } else {
      this.pauseTimers();
    }
  };

  private restartPausedTimers = () => {
    [...this.timerDates.keys()].forEach((key) => {
      const dateNow = Date.now();
      const saved = this.timerDates.get(key);

      if (!saved) {
        return;
      }

      const { pollingTime, targetDate } = saved;
      const isAlreadyExpired = targetDate < dateNow;

      if (isAlreadyExpired) {
        this.invalidate(key);
      } else {
        this.setupTimer(key, pollingTime);
      }
    });
  };

  private pauseTimers = () => {
    [...this.timers.keys()].forEach((key) => {
      globalThis.clearTimeout(this.timers.get(key));
      this.timers.delete(key);
    });
  };

  /**
   * Очистка таймеров,
   * предполагается использование либо при срабатывании таймера,
   * либо при досрочном вызове из внешней инвалидации
   */
  public clean = (key: KeyHash) => {
    globalThis.clearTimeout(this.timers.get(key));
    this.timers.delete(key);
    this.timerDates.delete(key);
  };

  /**
   * Перезапуск имеющегося таймера, предполагается использование при срабатывании синхронизации между вкладками
   */
  public restart = (key: KeyHash) => {
    const saved = this.timerDates.get(key);

    if (saved) {
      this.setupTimer(key, saved.pollingTime);
    }
  };

  private invalidate = (key: KeyHash) => {
    const query = this._queryStorage.get(key);

    if (query) {
      this._invalidateByKeyHash(key);
    }

    this.clean(key);
  };

  /**
   * Установка таймера устаревания данных
   */
  public setupTimer = (key: KeyHash, pollingTime: number) => {
    if (this.timers.has(key)) {
      globalThis.clearTimeout(this.timers.get(key));
    }

    if (!this._queryStorage.get(key)) {
      return;
    }

    this.timerDates.set(key, {
      pollingTime,
      targetDate: Date.now() + pollingTime,
    });

    if (this.isVisible) {
      this.timers.set(
        key,
        globalThis.setTimeout(() => this.invalidate(key), pollingTime),
      );
    }
  };
}
