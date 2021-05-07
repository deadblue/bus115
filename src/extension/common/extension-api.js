;(function (factory){
    window.extensionApis = factory();
})(function (){
    const _isFirefox = (typeof window.browser !== 'undefined');

    return {
        cookies: {
            getAll: _isFirefox ? browser.cookies.getAll: (details) => {
                return new Promise(resolve => {
                    chrome.cookies.getAll(details, cookies => {
                        resolve(cookies);
                    });
                });
            }
        },
        downloads: {
            download: _isFirefox ? browser.downloads.download : (options) => {
                return new Promise(resolve => {
                    chrome.downloads.download(options, downloadId => {
                        resolve(downloadId);
                    });
                });
            }
        },
        runtime: {
            sendMessage: _isFirefox ? browser.runtime.sendMessage : (message) => {
                return new Promise(resolve => {
                    chrome.runtime.sendMessage(message, response => {
                        resolve(response);
                    });
                })
            }
        },
        storage: {
            localGet: _isFirefox ? browser.storage.local.get : (keys) => {
                return new Promise(resolve => {
                    chrome.storage.local.get(keys, items => {
                        resolve(items);
                    });
                })
            },

            localSet: _isFirefox ? browser.storage.local.set : (items) => {
                return new Promise(resolve => {
                    chrome.storage.local.set(items, () => {
                        resolve();
                    });
                })
            }
        }
    };
});