import { Component, type ErrorInfo, type ReactNode } from 'react';
import { PageError } from './PageError';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  error: Error | null;
}

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    // TODO: 接入 Sentry 之类的上报服务后替换这里
    console.error(
      '[ErrorBoundary] Uncaught error:',
      error,
      info.componentStack,
    );
  }

  private handleRetry = (): void => {
    this.setState({ error: null });
  };

  render(): ReactNode {
    if (this.state.error) {
      return (
        <PageError
          message={this.state.error.message}
          onRetry={this.handleRetry}
        />
      );
    }
    return this.props.children;
  }
}
