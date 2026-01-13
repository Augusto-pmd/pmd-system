"use client";

import React from "react";

export class DebugErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null; info: React.ErrorInfo | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null, info: null };
  }

  static getDerivedStateFromError(error: unknown) {
    return { hasError: true, error: error as Error };
  }

  componentDidCatch(error: unknown, info: React.ErrorInfo) {
    if (process.env.NODE_ENV === "development") {
      console.error("⛔ FULL ERROR CAUGHT BY BOUNDARY ⛔");
      console.error("ERROR:", error);
      if (error && typeof error === "object" && "stack" in error) {
        console.error("STACK:", error.stack);
      }
      console.error("INFO:", info);
    }
    this.setState({ error: error as Error, info });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 40, fontFamily: "monospace", color: "red" }}>
          <h2>React Error Boundary</h2>
          <pre>{String(this.state.error)}</pre>
          <pre>{this.state.error?.stack}</pre>
          <pre>{JSON.stringify(this.state.info, null, 2)}</pre>
        </div>
      );
    }

    return this.props.children;
  }
}

