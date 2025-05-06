import { MutationOptions, MutationState } from './types';

export class MutationObserver<TData, TError = Error, TVariables = unknown, TContext = unknown> {
  private state: MutationState<TData, TError, TVariables, TContext>;
  private options: MutationOptions<TData, TError, TVariables, TContext>;
  private retryCount: number = 0;

  constructor(options: MutationOptions<TData, TError, TVariables, TContext>) {
    this.options = options;
    this.state = {
      status: 'idle',
      isPending: false,
      isSuccess: false,
      isError: false,
      error: null,
    };
  }

  private setState(updates: Partial<MutationState<TData, TError, TVariables, TContext>>) {
    this.state = { ...this.state, ...updates };
  }

  private shouldRetry(error: TError): boolean {
    const retry = this.options.retry;
    if (retry === false) return false;
    if (retry === true) return true;
    if (typeof retry === 'number') return this.retryCount < retry;
    return false;
  }

  async reset(): Promise<void> {
    this.setState({
      status: 'idle',
      isPending: false,
      isSuccess: false,
      isError: false,
      error: null,
      data: undefined,
      variables: undefined,
      context: undefined,
    });
  }

  async mutate(variables: TVariables): Promise<TData> {
    this.setState({
      status: 'loading',
      isPending: true,
      variables,
    });

    let context: TContext | undefined;

    try {
      if (this.options.onMutate) {
        context = await this.options.onMutate(variables);
        this.setState({ context });
      }

      const data = await this.options.mutationFn(variables);

      this.setState({
        status: 'success',
        data,
        isPending: false,
        isSuccess: true,
      });

      if (this.options.onSuccess) {
        await this.options.onSuccess(data, variables, context as TContext);
      }

      if (this.options.onSettled) {
        await this.options.onSettled(data, null, variables, context as TContext);
      }

      return data;
    } catch (error) {
      const typedError = error as TError;

      if (this.shouldRetry(typedError)) {
        this.retryCount++;
        return this.mutate(variables);
      }

      this.setState({
        status: 'error',
        error: typedError,
        isPending: false,
        isError: true,
      });

      if (this.options.onError) {
        await this.options.onError(typedError, variables, context as TContext);
      }

      if (this.options.onSettled) {
        await this.options.onSettled(undefined, typedError, variables, context as TContext);
      }

      throw error;
    }
  }

  async mutateAsync(variables: TVariables): Promise<TData> {
    return this.mutate(variables);
  }

  getState(): MutationState<TData, TError, TVariables, TContext> {
    return this.state;
  }
} 