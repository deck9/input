export function useMobileDetection(): {
    isMobileDevice: boolean;
} {
    return {
        isMobileDevice:
            /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
                navigator.userAgent
            ),
    };
}
