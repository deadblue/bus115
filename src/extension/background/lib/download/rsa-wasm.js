!(function (factory){
    window.initRsaWasm = factory();
})(function() {

    async function _initRsaWasm(codeUrl) {
        return new Promise((resolve, reject) => {
            const go = new Go();
            const cb = '_on_rsa_wasm_inited';
            window[cb] = () => {
                delete window[cb];
                resolve();
            }
            go.argv.push(cb);
            WebAssembly.instantiateStreaming(fetch(codeUrl), go.importObject).then(result => {
                go.run(result.instance);
            }).catch(reason => {
                reject(reason);
            });
        });
    }

    return _initRsaWasm;

});