import { Component, type ErrorInfo, type ReactNode } from 'react';

type Props = {
  children: ReactNode;
  sectionName: string;
  fallback?: ReactNode;
};

type State = {
  hasError: boolean;
};

/**
 * Catches render/lifecycle errors in a section so the rest of the page keeps working.
 */
export default class SectionErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(`[${this.props.sectionName}]`, error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <section className="section-padding">
          <div className="section-container rounded-2xl border border-primary-100 bg-white/90 px-6 py-10 text-center shadow-sm">
            <p className="font-sora text-lg font-semibold text-tropical">
              {this.props.sectionName} is temporarily unavailable
            </p>
            <p className="mt-2 text-sm text-dark/60">
              The rest of the site is working. Please refresh to try again.
            </p>
          </div>
        </section>
      );
    }
    return this.props.children;
  }
}
