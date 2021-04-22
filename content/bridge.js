;(function () {
    // Checking browser
    const isFirefox = (typeof window.browser !== 'undefined');
    if (!isFirefox) {
        window.browser = window.chrome;
    }

    // Inject our script
    const elem = document.createElement('script');
    elem.type = 'text/javascript';
    elem.src = browser.runtime.getURL('web/inject.js');
    document.body.appendChild(elem);

    // Handle message from injected script
    window.addEventListener('message', ev => {
        const message = ev.data;
        if (message.source !== 'page') {
            return;
        }
        const task = JSON.parse( decodeURIComponent(message.data) );
        if (isFirefox) {
            window.browser.runtime.sendMessage({
                task: task,
            }).catch(reason => {
                console.log(`Failed: ${reason}`)
            });
        } else {
            chrome.runtime.sendMessage({
                task: task,
            })
        }
    });

    // Handle message from background script
    browser.runtime.onMessage.addListener((message) => {
        window.postMessage({
            source: 'extension',
            data: message
        }, '*');
    });

})();
