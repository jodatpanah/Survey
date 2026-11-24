(() => {
    const welcome = document.getElementById('surveyWelcome');
    const viewport = window.visualViewport;
    if (!welcome || !viewport) {
        return;
    }

    let frame = null;

    function updateViewport() {
        frame = null;
        const { width, height, offsetTop, offsetLeft } = viewport;
        if (width <= 0 || height <= 0) {
            return;
        }

        welcome.style.setProperty('--survey-welcome-width', `${width}px`);
        welcome.style.setProperty('--survey-welcome-height', `${height}px`);
        welcome.style.setProperty('--survey-welcome-top', `${offsetTop}px`);
        welcome.style.setProperty('--survey-welcome-left', `${offsetLeft}px`);
        welcome.classList.add('survey-welcome-visual-viewport');
        welcome.classList.toggle('survey-welcome-compact', height <= 416);
    }

    function scheduleUpdate() {
        if (frame === null) {
            frame = window.requestAnimationFrame(updateViewport);
        }
    }

    viewport.addEventListener('resize', scheduleUpdate);
    viewport.addEventListener('scroll', scheduleUpdate);
    updateViewport();
})();
