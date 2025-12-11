import { type MobxQuery } from '../../MobxQuery';
import { type Mutation, type MutationExecutor } from '../../Mutation';

/**
 * Налор мутаций. Цель: единый интерфейс создания и использования наборов Query и Mutation
 * @example
 * const docFetcher = {
 *   mutations: {
 *     editDoc: mobxQuery.createMutationSet((params: DocsDTO.EditDocInput) => {
 *       return docsEndpoints.editDoc(params);
 *     }),
 *   },
 *  queries: {
 *     doc: mobxQuery.createQuerySet((id: string) => ({
 *       execute: () => docsEndpoints.getDoc(id).then(({ data }) => data),
 *     })),
 *   },
 * }
 */
export class MutationSet<TResponse, TParams = void, TDefaultError = unknown> {
  constructor(
    private readonly _cache: MobxQuery,
    private readonly _executor: MutationExecutor<TResponse, TParams>,
  ) {}

  /**
   * Создает мутацию
   * @returns Mutation объект
   * @example
   * const editDocMutation = docFetcher.mutations.editDoc.create();
   * // Выполняет мутацию
   * editDocMutation.sync({ params: { id: 'docId', content: 'Новое содержимое' } });
   */
  public create = <TError = TDefaultError>() =>
    this._cache.createMutation<TResponse, TError, TParams>(this._executor);
}
