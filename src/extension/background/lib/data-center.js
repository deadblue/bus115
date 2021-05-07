/*
The data center is a data storage on cloud.
*/

;(function(factory){
    window.DataCenter = factory();
})(function(){

    class _GithubDriver {
        constructor(config) {
            this._token = config.token || null;
        }

        _callApi(url, method, body) {
            const req = {
                method: method,
                headers: new Headers({
                    'Accept': 'application/vnd.github.v3+json',
                    'Authorization': `token ${this._token}`
                })
            };
            if(body) {
                req['body'] = body
            }
            return fetch(url, req)
        }

        async _searchGist(key) {
            const resp = await this._callApi(
                'https://api.github.com/gists', 'GET', null
            );
            const result = await resp.json();
            for(const gist of result) {
                for(const name in gist.files) {
                    if (name === key) {
                        return gist;
                    }
                }
            }
            return null;
        }

        async get(name) {
            const gist = await this._searchGist(name);
            if(gist === null) {
                return null;
            }
            const file = gist.files[name];
            const resp = await fetch(file['raw_url']);
            return resp.text();
        }

        async put(name, value) {
            const body = {files: {}}
            body.files[name] = {
                content: value
            };
            try {
                const gist = await this._searchGist(name);
                let url = '', method = 'POST';
                if(gist === null) {
                    // Create new gist
                    url = 'https://api.github.com/gists';
                    body['public'] = false;
                } else {
                    // Update existing gist
                    url = `https://api.github.com/gists/${gist.id}`;
                    method = 'PATCH';
                }
                const resp = await this._callApi(
                    url, method, JSON.stringify(body)
                );
                return resp.ok
            } catch (err) {
                console.log(err);
                return false;
            }
        }
    }

    const _subtle = window.crypto.subtle;
    const _encoder = new TextEncoder();
    const _decoder = new TextDecoder();

    class _DataCenter {
        constructor(config) {
            this._key = null;
            if (config.type === 'github') {
                this._driver = new _GithubDriver(config);
            }
        }

        async init(password) {
            const keyData = await _subtle.digest('SHA-256', _encoder.encode(password));
            this._iv = keyData.slice(20);
            this._key = await _subtle.importKey(
                'raw', keyData, 'AES-GCM', true, ['encrypt', 'decrypt']);
        }

        async get(name) {
            let data = await this._driver.get(name);
            // Decrypt
            if (this._key !== null) {
                data = await _subtle.decrypt({
                    name: 'AES-GCM',
                    iv: this._iv
                }, this._key, Base64.stdDecode(data));
                return _decoder.decode(data);
            } else {
                return data;
            }
        }

        async put(name, data) {
            // Encrypt
            if (this._key !== null) {
                data = await _subtle.encrypt({
                    name: 'AES-GCM',
                    iv: this._iv
                }, this._key, _encoder.encode(data));
                data = Base64.stdEncode(data);
            }
            return this._driver.put(name, data);
        }
    }

    return _DataCenter;
});