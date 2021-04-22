// Browser compatibility
const isFirefox = (typeof window.browser !== 'undefined');
if (!isFirefox) {
    window.browser = window.chrome;
}
const _apis = {
    storageLocalGet: isFirefox ? browser.storage.local.get : (keys) => {
        return new Promise(resolve => {
            chrome.storage.local.get(keys, items => {
                resolve(items);
            });
        })
    },

    storageLocalSet: isFirefox ? browser.storage.local.set : (items) => {
        return new Promise(resolve => {
            chrome.storage.local.set(items, () => {
                resolve();
            });
        })
    }
};

(async function(){

    // Load config
    const config = await _apis.storageLocalGet('config');

    // Initialize wasm at first.
    await window.initRsaWasm(
        browser.runtime.getURL('background/wasm/rsa.wasm')
    );

    const m115 = new M115();

    /**
     * @private
     * @param item {Object}
     * @return {Promise<Object>}
     */
    function _getDownloadLink(item) {
        return new Promise((resolve, reject) => {
            const key = m115.generateKey();
            const data = m115.encode(
                JSON.stringify({pickcode: item.pc}), key
            );
            const url = `https://proapi.115.com/app/chrome/downurl?t=${new Date().getTime()}`;
            fetch(url, {
                method: 'POST',
                headers: new Headers({
                    'Content-Type': 'application/x-www-form-urlencoded'
                }),
                body: new URLSearchParams({
                    data: data
                }),
            }).then(resp => {
                return resp.json();
            }).then(body => {
                if(body.state) {
                    try {
                        const result = JSON.parse(
                            m115.decode(body.data, key)
                        );
                        for (const file of Object.values(result)) {
                            resolve({
                                file_name: file['file_name'],
                                download_url: file['url']['url']
                            });
                        }
                        resolve(result);
                    } catch (e) {
                        reject('Decode failed!');
                    }
                } else {
                    reject('Call API failed!');
                }
            });
        });
    }

    browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
        sendResponse('Accepted!');
        // Get download for each item
        const promises = [];
        for(let item of message.task.list) {
            // Do not support dir!
            if (item['is_dir']) {
                continue;
            }
            promises.push(_getDownloadLink(item));
        }
        Promise.all(promises).then((items) => {
            chrome.tabs.sendMessage(sender.tab.id, {
                list: items
            }, null);
        });
    });

})();
