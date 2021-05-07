// Browser compatibility
const isFirefox = (typeof window.browser !== 'undefined');
if (!isFirefox) {
    window.browser = window.chrome;
}

(async function(){
    // Load config
    const config = await extensionApis.storage.localGet(null);

    // const dc = new DataCenter({
    //     type: 'github',
    //     token: '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'
    // });
    // await dc.init('hello, world!');
    // await dc.put('test.cookie', 'very very looooooooooooooong data!');
    // const cookie = await dc.get('115.cookie');
    // console.log(cookie);

    const downloader = new Downloader();
    await downloader.install();
    console.log('115 Downloader installed!');

    // Handle download message.
    browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
        sendResponse('Accepted!');
        // Get download for each item
        const promises = [];
        for(let item of message.task.list) {
            // Do not support dir!
            if (item['is_dir']) {
                continue;
            }
            promises.push(downloader.getLink(item));
        }
        Promise.all(promises).then((items) => {
            browser.tabs.sendMessage(sender.tab.id, {
                list: items
            }, null);
        });
    });

})();
