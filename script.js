const fs = require('fs');
fs.readdir('./img', (err, files) => {
    const entries = [];
    files.forEach(fileName => {
        if (!fileName.endsWith('jxl')) return;
        let fn = fileName.replace('.jxl', '');
        entries.push(fn);
        fs.writeFileSync('./set/' + fn + '.html', `
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
    <h1><a href="https://github.com/niutech/jxl.js" style="color: inherit;">JXL.js</a> demo</h1>
    <div style="display: grid; grid-template-columns: 1fr 1fr; grid-gap: 10px;">
    <div>JXL</div>
    <div>JPEG</div>
    <img style="max-width: 100%;" src="/img/${fn}.jxl" alt="Here is the image">
    <img style="max-width: 100%;" src="/img/${fn}.jpeg" alt="Here is the image">
    </div>
</body>
</html>`
        );
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
        ${entries.map(entry => `<a href="set/${entry}.html" target="_blank">${entry}</a>`).join('<br/>')}
    </body>
    </html>`)
})
