const fs = require('fs');
fs.readdir('./img', (err, files) => {
    const entries = [];
    files.forEach(fileName => {
        if (!fileName.endsWith('jxl')) return;
        let fn = fileName.replace('.jxl', '');
        entries.push(fn);
    });
    fs.writeFileSync('./index.html', `
    <!DOCTYPE html>
    <html>
    <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width">
    <title>JXL.js Demo</title>
    <link rel="prefetch" href="jxl_dec.js" fetchpriority="high">
    <link rel="prefetch" href="jxl_dec.wasm" fetchpriority="high">
    <script src="jxl.min.js"></script>
    </head>
    <body>
        <h1>JXL demo</h1>
        ${entries.map(entry => `<button onclick="(function(){
            document.getElementById('wrapper').innerHTML = ${`\`
            <div style='display: grid; grid-template-columns: 1fr 1fr; grid-gap: 10px;'>
            <div>JXL</div>
            <div>JPEG</div>
            <img style='max-width: 100%;' src='img/${entry}.jxl' alt='Here is the image'>
            <img style='max-width: 100%;' src='img/${entry}.jpg' alt='Here is the image'>
            </div>\``}
            return false;
        })();return false;">${entry}</button>`).join('\n')}
        <div id="wrapper"></div>
    </body>
    </html>`)
})
