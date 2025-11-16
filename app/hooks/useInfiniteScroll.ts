import { useCallback, useEffect, useRef, useState } from "react";

interface UseInfiniteScrollOptions {
    /**
     * Set a custom root element for the observer. Defaults to viewport.
     */
    root?: Element | null;
    /**
     * Preload more items before the sentinel is actually visible.
     * Example: "200px"
     */
    rootMargin?: string;
    /**
     * Intersection threshold. Defaults to 0.1
     */
    threshold?: number;
    /**
     * Whether to observe only once per intersection cycle while loading.
     */
    disabled?: boolean;
}

interface UseInfiniteScrollResult {
    /**
     * Attach this ref to a sentinel element at the end of your list.
     */
    setSentinel: (node: HTMLDivElement | null) => void;
    /**
     * Loading flag to help debounce UI.
     */
    isLoading: boolean;
    /**
     * Manually set loading state (e.g., when external request completes).
     */
    setIsLoading: (loading: boolean) => void;
}

export function useInfiniteScroll(
    onLoadMore: () => void | Promise<void>,
    { root = null, rootMargin = "300px", threshold = 0.1, disabled = false }: UseInfiniteScrollOptions = {},
): UseInfiniteScrollResult {
    const observerRef = useRef<IntersectionObserver | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const sentinelRef = useRef<HTMLDivElement | null>(null);

    const setSentinel = useCallback((node: HTMLDivElement | null) => {
        sentinelRef.current = node;
    }, []);

    useEffect(() => {
        if (disabled) {
            return;
        }
        if (observerRef.current) {
            observerRef.current.disconnect();
        }

        observerRef.current = new IntersectionObserver(
            async (entries) => {
                const entry = entries[0];
                if (!entry.isIntersecting || isLoading) {
                    return;
                }
                setIsLoading(true);
                try {
                    await onLoadMore();
                } finally {
                    setIsLoading(false);
                }
            },
            { root, rootMargin, threshold },
        );

        const currentSentinel = sentinelRef.current;
        if (currentSentinel) {
            observerRef.current.observe(currentSentinel);
        }

        return () => {
            observerRef.current?.disconnect();
        };
    }, [root, rootMargin, threshold, onLoadMore, isLoading, disabled]);

    return { setSentinel, isLoading, setIsLoading };
}


