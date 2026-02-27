import { Component, ErrorInfo, ReactNode } from "react";
import { motion } from "framer-motion";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("ErrorBoundary caught:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background p-6">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="card-kid max-w-md text-center"
          >
            <motion.span
              className="text-6xl block mb-4"
              animate={{ rotate: [0, -10, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              🦉💔
            </motion.span>
            <h2 className="font-display text-2xl font-bold mb-2 text-foreground">
              Oops! Something went wrong
            </h2>
            <p className="text-muted-foreground font-body mb-6 text-sm">
              Don't worry, our owl is fixing things up!
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => window.location.reload()}
              className="btn-kid gradient-primary text-primary-foreground px-8 py-3"
            >
              🔄 Try Again
            </motion.button>
          </motion.div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
