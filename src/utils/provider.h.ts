/**
 * Simple interface for all providers to share two common functions.
 */
export interface Provider {
  /**
   * The `update` function of a provider should refresh all provided variables of a `Provider`.
   */
  update(): void;
  /**
   * The `stats` method should print a short summary about the exposed variables and for example the amount by type. The function is used for the `/stats` api.
   */
  stats(): string;
}
