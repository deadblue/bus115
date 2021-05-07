;(function(){
    const _defaultConfig = {
        'download_mode': 'manually'
    }
    async function _loadConfig() {
        let config = await window.extensionApis.storage.localGet(null);
        if (config === null) {
            config = {};
        }
        for (let key of Object.keys(_defaultConfig)) {
            if(!config[key]) {
                config[key] = _defaultConfig[key];
            }
        }
        return config;
    }

    _loadConfig().then(config => {
        console.log(config);
    })

})();