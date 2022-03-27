/*
 * File: ErrorBoundary.tsx
 * Project: next-cms
 * File Created: Sunday, 27th March 2022 10:42:47 am
 * Author: Allan Nava (allan.nava@hiway.media)
 * -----
 * Last Modified: Sunday, 27th March 2022 10:44:10 am
 * Modified By: Allan Nava (allan.nava@hiway.media>)
 * -----
 * Copyright 2022 - 2022 © 
 */
//
import React, { Component, ErrorInfo, ReactNode } from "react";
//
interface Props {
  children: ReactNode;
}
//
interface State {
  hasError: boolean;
}
//
class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(_: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    
    if (this.state.hasError) {
      return <h1>Sorry.. there was an error</h1>;
    }

    return this.props.children;
  }
}
//
export default ErrorBoundary;
//