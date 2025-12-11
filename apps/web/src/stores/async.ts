import type { MobxQuery } from "@tinkerbells/mobx-query";
import { cacheService } from "./cache";

class AsyncStore {
  constructor(private readonly cache: MobxQuery) { }

  public asyncQuery() {
    return this.cache.createQuery(["key"], async () => {
      await this.delay(1500)
      console.log("Async query started...")
      return {
        message: "your async message"
      }
    })
  }

  public get asyncQueryMessage() {
    return this.asyncQuery().data?.message
  }

  public get isLoading() {
    console.log(this.asyncQuery().isLoading)
    return this.asyncQuery().isLoading
  }

  private delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

}

export const asyncStore = new AsyncStore(cacheService)
