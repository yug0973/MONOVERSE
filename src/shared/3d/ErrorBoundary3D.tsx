import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw, Table } from 'lucide-react';
import { Button } from '../ui/Button';

interface Props {
  children: ReactNode;
  onOpenTableFallback?: () => void;
}

interface State {
  hasError: boolean;
  errorMessage: string;
}

export class ErrorBoundary3D extends Component<Props, State> {
  public state: State = {
    hasError: false,
    errorMessage: '',
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, errorMessage: error.message };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('WebGL / 3D Canvas error caught by boundary:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, errorMessage: '' });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="w-full h-full min-h-[500px] flex items-center justify-center p-8 bg-canvas border border-canvas-muted rounded-lg text-center">
          <div className="max-w-md">
            <div className="w-12 h-12 rounded-full bg-accent-terracotta/10 text-accent-terracotta flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-2xl font-semibold text-ink-primary mb-2">
              3D Viewport Temporarily Unavailable
            </h3>
            <p className="text-sm text-ink-muted mb-6 leading-relaxed font-mono text-xs">
              {this.state.errorMessage ||
                'Your graphics hardware or browser may not support WebGL2 accelerated rendering. You can continue exploring floor plans and flats through our accessible architectural directory.'}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button
                variant="primary"
                onClick={this.handleReset}
                icon={<RefreshCw className="w-4 h-4" />}
              >
                Reload 3D Scene
              </Button>
              {this.props.onOpenTableFallback && (
                <Button
                  variant="secondary"
                  onClick={this.props.onOpenTableFallback}
                  icon={<Table className="w-4 h-4" />}
                >
                  Browse All Flats (2D)
                </Button>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
