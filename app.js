const express = require('express');
const multer = require('multer');
const ip = require('ip');
const fs = require('fs');
const dayjs = require('dayjs');

const app = express();
const port = 3585;

// 設置文件儲存目錄
const uploadDir = "D:/important/book i need";
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// 設置 Multer 用於文件上傳
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, dayjs().format('YYYY-MM-DD HH-mm-ss')+ '-' + file.originalname);
    }
});

const upload = multer({ storage: storage });

app.set('view engine', 'ejs');
app.set('views', './pages');

// 設置靜態文件服務
app.use('/uploads', express.static(uploadDir));
const generateFileList = (reqPath) => {
    let htmlFileList = ""
    if (reqPath != undefined) {
        console.log("Reading path: " + uploadDir + "/" + reqPath)
        fs.readdirSync(uploadDir + "/" + reqPath).forEach(file => {
            if (fs.statSync(uploadDir + "/" + reqPath + "/" + file).isDirectory()) {
                htmlFileList += `<li>📁 <a href="/?path=${reqPath + "/" + file}">${file}</a></li>`;
            } else {
                htmlFileList += `<li>📄 <a href="/uploads/${reqPath}/${file}">${file}</a></li>`;
            }
        })
    } else if (reqPath === undefined) {
        console.log("Reading path: " + uploadDir)
        fs.readdirSync(uploadDir).forEach(file => {
            if (fs.statSync(uploadDir + "/" + file).isDirectory()) {
                htmlFileList += `<li>📁 <a href="/?path=${file}">${file}</a></li>`;
            } else {
                htmlFileList += `<li>📄 <a href="/uploads/${file}">${file}</a></li>`;
            }
        })
    }
    return htmlFileList;
}
// 簡單的首頁
app.get('/', (req, res) => {


    const fileList = generateFileList(req.query.path);
    res.render('index', { fileList });


});


// 文件上傳路由
app.post('/upload', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).send('未選擇文件');
    }
    res.redirect('/');
});

// 啟動服務器
app.listen(port, "0.0.0.0", () => {
    console.log(`文件伺服器運行在 http://${ip.address()}:${port}`);
});