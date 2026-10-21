if ("serviceWorker" in navigator) {
    window.addEventListener("load", async () => {
        try {
            const registration = await navigator.serviceWorker.register(
                new URL("../sw.js", import.meta.url),
                { updateViaCache: "none" }
            );
            console.info("Offline support registered:", registration.scope);
        } catch (error) {
            console.error("Offline support could not start:", error);
        }
    });
}
