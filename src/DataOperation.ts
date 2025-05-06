import { OperationOptions, OperationState } from './types';

export class DataOperation<TData = unknown, TError = Error, TVariables = void, TContext = unknown> {
  private state: OperationState<TData, TError, TVariables, TContext> = {
    status: 'idle',
    data: undefined,
    error: null,
    variables: undefined,
    context: undefined
  };

  constructor(private options: OperationOptions<TData, TError, TVariables, TContext>) {}

  async execute(variables: TVariables): Promise<TData> {
    try {
      this.state.status = 'loading';
      this.state.variables = variables;

      if (this.options.onMutate) {
        this.state.context = await this.options.onMutate(variables);
      }

      const data = await this.options.mutationFn(variables);
      this.state.data = data;
      this.state.status = 'success';

      if (this.options.onSuccess) {
        await this.options.onSuccess(data, variables, this.state.context);
      }

      return data;
    } catch (error) {
      this.state.error = error as TError;
      this.state.status = 'error';

      if (this.options.onError) {
        await this.options.onError(error as TError, variables, this.state.context);
      }

      throw error;
    } finally {
      if (this.options.onSettled) {
        await this.options.onSettled(
          this.state.data,
          this.state.error,
          variables,
          this.state.context
        );
      }
    }
  }

  reset(): void {
    this.state = {
      status: 'idle',
      data: undefined,
      error: null,
      variables: undefined,
      context: undefined
    };
  }

  getState(): OperationState<TData, TError, TVariables, TContext> {
    return { ...this.state };
  }
} 