import express, { Express, NextFunction, Request, Response } from 'express';
import morgan from 'morgan';
import dotenv from 'dotenv';
import fileUpload from 'express-fileupload';
import AdmZip from 'adm-zip'
// import { existsSync, unlinkSync } from 'fs';

dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 8001;

// Set template engine
app.set('views', 'views');
app.set('view engine', 'ejs');

// Set middleware
app.use(fileUpload());
app.use(morgan("dev"));

app.get('/', (req: Request, res: Response) => {
    res.render('index', { title: "Create a ZIP File with Express" });
});

let zipFileName = 'archive'

app.post('/upload', async (req: Request, res: Response) => {
    zipFileName = req.body.file_name
    const outputFilePath = `./src/upload/${zipFileName}.zip`;
    const filesToCompress: fileUpload.UploadedFile[] = Array.isArray(req.files!.file) ? [...req.files!.file] : [req.files!.file];

    const zip = new AdmZip();

    for (const file of filesToCompress) {
        zip.addFile(file.name, file.data);
    }

    zip.writeZip(outputFilePath);

    res.render('file-compress', { title: "Create a ZIP File with Express", name: `${zipFileName}.zip` });
});

app.get('/download', (req, res) => {
    const filePath = `./src/upload/${zipFileName}.zip`;
    const fileName = `${zipFileName}.zip`;

    res.download(filePath, fileName, (err) => {
        if (err) res.status(400).send("Error")
        else {
            // TODO: uncomment line
            // if (existsSync(filePath)) unlinkSync(filePath)
        }
    })
});

// catch 404 and forward to the the error handler
app.use(function (req: Request, res: Response, next: NextFunction) {
    res.status(404).json({
        message: "No such route exists"
    })
});

// error handler
app.use(function (err: any, req: Request, res: Response, next: NextFunction) {
    res.status(err.status || 500).json({
        message: "Error Message"
    })
});

app.listen(PORT, () => {
    console.log(`⚡️[server]: Server is running at http://localhost:${PORT}`);
});
