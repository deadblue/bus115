// Fake browserInterface
;(function(){

    const core = window.Core;

    window.browserInterface = {
        CreateDownloadTask: (task) => {
            core.MinMessage.Show({
                type: 'load',
                text: '创建下载任务 ...',
                timeout: 1000
            });
            window.postMessage({
                source: 'page',
                data: task
            }, '*');
        },

        GetBrowserVersion: () => {
            return "99.9.9";
        }
    };

    window.addEventListener('message', ev => {
        core.MinMessage.Hide();
        const message = ev.data;
        if(message.source !== 'extension') {
            return;
        }
        const content = ['<ul style="padding: 20px;">'];
        for(const item of message.data.list) {
            content.push(`<li><a href="${item.download_url}"><span style="text-decoration:underline;">${item.file_name}</span></a></li>`);
        }
        content.push('</ul>')
        const dlg = new core.DialogBase({
            title: '下载文件',
            content: content.join('')
        });
        dlg.Open(null);
    });
})();


