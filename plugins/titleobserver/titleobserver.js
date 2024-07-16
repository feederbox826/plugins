function titleObserver() {
    const listener = new EventTarget()
    window.titleObs = listener

    const notifyTitle = () => listener.dispatchEvent(new Event("titlechange"))

    new MutationObserver(() => notifyTitle()).observe(document.querySelector("title"), {
        childList: true,
    });
}
titleObserver()
