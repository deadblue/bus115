;(function(factory){
    window.Downloader = factory();
})(function() {

    class _Downloader {

        async install() {
            // Load wasm code
            await window.initRsaWasm(
                browser.runtime.getURL('background/wasm/rsa.wasm')
            );
            this._m115 = new M115();
        }

        async getLink(item) {
            const key = this._m115.generateKey();
            const data = this._m115.encode(
                JSON.stringify({pickcode: item.pc}), key
            );
            const url = `https://proapi.115.com/app/chrome/downurl?t=${new Date().getTime()}`;
            const resp = await fetch(url, {
                method: 'POST',
                headers: new Headers({
                    'Content-Type': 'application/x-www-form-urlencoded'
                }),
                body: new URLSearchParams({
                    data: data
                }),
            });
            const body = await resp.json();
            if(body.state) {
                try {
                    const result = JSON.parse(
                        this._m115.decode(body.data, key)
                    );
                    const files = Object.values(result);
                    if (files.length > 0) {
                        return {
                            file_name: files[0]['file_name'],
                            download_url: files[0]['url']['url']
                        }
                    } else {
                        console.log('No files!');
                    }
                } catch (e) {
                    console.log(`Decrypt body failed: ${e}`);
                }
            } else {
                console.log('Call API failed!');
            }
            return null;
        }

        async download(items) {
            const promises = [];
            for(const item of items) {
                const p = extensionApis.downloads.download({
                    filename: item.file_name,
                    conflictAction: 'prompt',
                    saveAs: false,
                    url: item.download_url
                });
                promises.push(p);
            }
            return Promise.all(promises);
        }

        async _rpcDownloadOne(item) {
            const cookies = await extensionApis.cookies.getAll({
                url: item.download_url
            });
            const cookieHeader = cookies.map((cookie) => {
                return `${cookie.name}=${cookie.value}`
            }).join('; ')
            console.log(`Cookie header: ${cookieHeader}`);
            console.log(`User-Agent header: ${navigator.userAgent}`);
        }

        async rpcDownload(items) {
            for(const item of items) {
                await this._rpcDownloadOne(item);
            }
        }

    }

    return _Downloader;
});