import React, { Component, ErrorInfo, ReactNode, type JSX } from "react";
import { capitalize } from "@courselit/utils";

interface Props {
    children: ReactNode;
    widgetName: string;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

class WidgetErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Widget Error:", error, errorInfo);
    }

    public render(): JSX.Element {
        if (this.state.hasError) {
            return (
                <div className="p-4 border border-red-200 rounded-md bg-red-50">
                    <h3 className="text-red-800 font-medium mb-2">
                        Erreur dans <b>{capitalize(this.props.widgetName)}</b>{" "}
                        block
                    </h3>
                    <p className="text-red-600 text-sm">
                        {this.state.error?.message ||
                            "Quelque chose n'a pas fonctionné"}
                    </p>
                </div>
            );
        }

        return <>{this.props.children}</>;
    }
}

export default WidgetErrorBoundary;
