/**
 * Why Did You Render Configuration
 * 
 * Development tool to track unnecessary re-renders
 * Helps identify performance bottlenecks in React components
 */

if (__DEV__) {
    try {
        const React = require('react');
        const whyDidYouRender = require('@welldone-software/why-did-you-render');

        whyDidYouRender(React, {
            // Track all React components for re-renders
            trackAllPureComponents: false, // Changed to false to reduce overhead

            // Track hooks changes - DISABLED due to compatibility issues with React Native
            trackHooks: false,

            // Track extra props
            trackExtraHooks: false,

            // Custom configuration
            logOnDifferentValues: true,

            // Only log when there are actual issues
            logLevel: 'warn',

            // Include component stack
            include: [/.*/],

            // Exclude some known components that re-render frequently
            exclude: [
                /^RCT/,
                /^React/,
                /NavigationContainer/,
                /Provider/,
                /Consumer/,
                /Context/,
                /ForwardRef/,
                /Memo/
            ],

            // Custom comparison for complex objects
            customCompareFunction: (prevValue: any, nextValue: any, path: string) => {
                // For socket data, only check if the actual data changed
                if (path.includes('socketData') || path.includes('realTimeData')) {
                    return JSON.stringify(prevValue) === JSON.stringify(nextValue);
                }

                // For arrays, check length and first/last items for quick comparison
                if (Array.isArray(prevValue) && Array.isArray(nextValue)) {
                    if (prevValue.length !== nextValue.length) return false;
                    if (prevValue.length === 0) return true;

                    // Quick check for large arrays
                    if (prevValue.length > 100) {
                        return (
                            prevValue[0] === nextValue[0] &&
                            prevValue[prevValue.length - 1] === nextValue[nextValue.length - 1]
                        );
                    }
                }

                return undefined; // Use default comparison
            },

            // Custom notification handler
            notifier: (options: any) => {
                const {
                    Component,
                    displayName,
                    hookName,
                    prevProps,
                    nextProps,
                    prevState,
                    nextState,
                    prevHook,
                    nextHook,
                    reason,
                    options: wdyrOptions
                } = options;

                // Custom logging format
                console.group(`🔄 ${displayName} re-rendered`);

                if (reason.propsDifferences) {
                    console.warn('Props differences:', reason.propsDifferences);
                }

                if (reason.stateDifferences) {
                    console.warn('State differences:', reason.stateDifferences);
                }

                if (reason.hookDifferences) {
                    console.warn('Hook differences:', reason.hookDifferences);
                }

                // Performance recommendations
                if (reason.propsDifferences && reason.propsDifferences.length > 5) {
                    console.info('💡 Consider using React.memo() or useMemo() for this component');
                }

                if (hookName && (hookName.includes('useState') || hookName.includes('useEffect'))) {
                    console.info('💡 Consider adding dependency array or useCallback/useMemo');
                }

                console.groupEnd();
            }
        });

        // Mark specific components for tracking
        const componentWhitelist = [
            'MenuScreen',
            'OrdersScreen',
            'OptimizedList',
            'MenuCard',
            'OrderCard',
            'HomeScreen',
            'ProfileScreen'
        ];

        // Helper to mark components for WDYR tracking
        const markForWhyDidYouRender = (Component: React.ComponentType<any>, displayName?: string) => {
            if (__DEV__) {
                (Component as any).whyDidYouRender = {
                    logOnDifferentValues: true,
                    customName: displayName || Component.displayName || Component.name
                };
            }
            return Component;
        };

        // Auto-mark components based on name
        const originalCreateElement = React.createElement;
        React.createElement = function (type: any, props: any, ...children: any[]) {
            if (
                typeof type === 'function' &&
                type.name &&
                componentWhitelist.some(name => type.name.includes(name))
            ) {
                markForWhyDidYouRender(type);
            }

            return originalCreateElement.call(this, type, props, ...children);
        };

        console.log('🔍 Why Did You Render initialized for performance debugging');
    } catch (error) {
        console.warn('⚠️ Why Did You Render failed to initialize:', error);
        // Silently fail - don't break the app if WDYR has issues
    }
}

/**
 * HOC to manually mark components for WDYR tracking
 */
export function withPerformanceTracking<P extends object>(
    Component: React.ComponentType<P>,
    options?: {
        trackProps?: boolean;
        trackState?: boolean;
        trackHooks?: boolean;
        customName?: string;
    }
) {
    if (__DEV__) {
        const { trackProps = true, trackState = true, trackHooks = true, customName } = options || {};

        (Component as any).whyDidYouRender = {
            logOnDifferentValues: true,
            trackProps,
            trackState,
            trackHooks,
            customName: customName || Component.displayName || Component.name
        };
    }

    return Component;
}

/**
 * Hook to track component render reasons
 */
export function useRenderTracker(componentName: string, props?: Record<string, any>) {
    if (__DEV__) {
        const React = require('react');
        const renderCount = React.useRef(0);
        const prevProps = React.useRef(props);

        React.useEffect(() => {
            renderCount.current += 1;

            if (renderCount.current > 1 && prevProps.current && props) {
                const changedProps = Object.keys(props).filter(
                    key => props[key] !== prevProps.current![key]
                );

                if (changedProps.length > 0) {
                    console.log(`🔄 ${componentName} render #${renderCount.current}`);
                    console.log('Changed props:', changedProps);
                }
            }

            prevProps.current = props;
        });

        React.useEffect(() => {
            if (renderCount.current > 10) {
                console.warn(`⚠️ ${componentName} has rendered ${renderCount.current} times`);
            }
        }, [componentName]);
    }
}

export default { withPerformanceTracking, useRenderTracker };