import { when } from 'mobx';

import type { DataStorageFactory } from '../DataStorage';
import type { Keys } from '../MobxQuery/types';
import type { PollingService } from '../PollingService';
import type { StatusStorageFactory } from '../StatusStorage';

export class SynchronizationService {
  private readonly broadcastChannel?: BroadcastChannel;

  constructor(
    private readonly _statusStorageFactory: StatusStorageFactory,
    private readonly _dataStorageFactory: DataStorageFactory,
    private readonly _pollingService: PollingService,
    _BroadcastChannel:
      | typeof BroadcastChannel
      | undefined = globalThis.BroadcastChannel,
  ) {
    if (_BroadcastChannel) {
      this.broadcastChannel = new _BroadcastChannel('@astral/mobx-query');
    }

    this.init();
  }

  private init = () => {
    this.broadcastChannel?.addEventListener('message', (event) => {
      const data = JSON.parse(event.data) as {
        dataKeyHash: Keys['dataKeyHash'];
        statusKeyHash: Keys['statusKeyHash'];
        queryKeyHash: Keys['queryKeyHash'];
        data: unknown;
        statuses: {
          isLoading: boolean;
          isError: boolean;
          error?: unknown;
          isSuccess: boolean;
        };
      };

      this._dataStorageFactory.getStorage(data.dataKeyHash)?.setData(data.data);

      this._statusStorageFactory
        .getStorage(data.statusKeyHash)
        ?.setStatues(data.statuses);

      this._pollingService.restart(data.queryKeyHash);
    });
  };

  public emit = async (keys: Keys) => {
    const statusStorage = this._statusStorageFactory.getStorage(
      keys.statusKeyHash,
    );

    if (statusStorage) {
      await when(() => !statusStorage.isLoading);
    }

    this.broadcastChannel?.postMessage(
      JSON.stringify({
        ...keys,
        data: this._dataStorageFactory.getStorage(keys.dataKeyHash)?.data,
        statuses: statusStorage?.statuses,
      }),
    );
  };
}
