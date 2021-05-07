;(function(factory){
    window.Aria2 = factory();
})(function(){

    const _defaultConfig = {
        host: '127.0.0.1',
        port: 6800,
        token: ''
    };

    function _mergeConfig(config) {
        const result = config ? config : {};
        for (let key of Object.keys(_defaultConfig)) {
            if(!result[key]) {
                result[key] = _defaultConfig[key];
            }
        }
        return result;
    }

    class _Aria2 {
        /**
         *
         * @param config
         */
        constructor(config) {
            this._config = _mergeConfig(config);
            this._reqId = 1;
        }

        _rpcCall(method, ...params) {
            const req = {
                jsonrpc: '2.0',
                id: ++this._reqId,
                method: method,
                params: []
            };
            if(this._config.token !== '') {
                req.params.push(`token:${this._config.token}`);
            }
            if (params.length > 0) {
                req.params.push(...params);
            }
            const url = `http://${this._config.host}:${this._config.port}/jsonrpc`;
            return new Promise((resolve, reject) => {
                fetch(url, {
                    method: 'POST',
                    headers: new Headers({
                        'Content-Type': 'application/json'
                    }),
                    body: JSON.stringify(req)
                }).then(resp => {
                    if (resp.ok) {
                        return resp.json();
                    } else {
                        return Promise.reject(resp.statusText);
                    }
                }).then(body => {
                    resolve(body.result);
                }).catch(reason => {
                    reject(reason);
                })
            });
        }

        async getVersion() {
            const result = await this._rpcCall('aria2.getVersion');
            return result['version'];
        }

        async addTask(downUrl, headers) {
            return this._rpcCall('aria2.addUri', [downUrl], {
                header: headers
            });
        }

    }

    return _Aria2;
});