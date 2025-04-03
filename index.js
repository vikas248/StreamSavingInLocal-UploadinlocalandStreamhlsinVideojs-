import express, { json, urlencoded } from "express";
import cors from "cors";
import multer from "multer";
import { v4 as uuidV4 } from "uuid";
import path from "path"
import fs from "fs"
import {exec} from "child_process"
import { stderr, stdout } from "process";

const app = express();

//multer middleware

const storage = multer.diskStorage({
    destination: function(req, file, cb){
        cb(null, "./uploads")
    },
    filename: function(req, file, cb){
        cb(null, file.fieldname + "-" + uuidV4() + path.extname(file.originalname))
    }
})

//multer Configuration

const upload = multer({storage: storage})

app.use(
  cors({
    origin: ["http://localhost:3000", "http://localhost:5173"],
    credentials: true,
  })
);

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*")
    res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept"
    )
    next();
})

app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use("/uploads", express.static("uploads"))

app.get("/", (req, res) => {
  res.json({
    message: "Hello lets learn Streaming",
  });
});

app.post("/uploads", upload.single('file'), (req, res) => {
    const lessonId = uuidV4()
    //ye video path islie chahiye kyuki hme ye ffmpeg library ko dena padta h
    const videoPath = req.file.path //real scenario mein hum kisi bucket mein rkhte h uska paath bhejte h
    const outputPath = `./uploads/courses/${lessonId}`
    //ye video ni hota h unstiched video hota h
    const hlsPath = `${outputPath}/index.m3u8`
    // m3u8 file extension is a UTF-8 encoded playlist file
    // basically  index wagerh save krti h, 
    // isile hm jb video aage peeche krte h to video buffer ni hoti h, 
    // kyuki hota kya h hm basically index ko btate h
    // iske andar vide, audio seperate hote h
    // suppose hm 10 chunks mein video ko divide krre h, to main 10th chunk kha pe dekhunga(basically timestamp)
    console.log("hlsPath: ", hlsPath)
    console.log('lessonId: ', lessonId)
    console.log('videoPath: ', videoPath)
    if(!fs.existsSync(outputPath)){
        fs.mkdirSync(outputPath, {recursive: true}) //recursive - folder ke andar folder ho to use kr lete h
    }

    //ffmpeg
    //no queue because of Proof of concept
    const ffmpegCommand = `ffmpeg -i ${videoPath} -c:v libx264 -c:a aac -hls_time 10 -hls_playlist_type vod -hls_segment_filename "${outputPath}/segment%03d.ts" -start_number 0 ${hlsPath}`;

    exec(ffmpegCommand, (error, stdout, stderr) => {
        if(error){
            console.log(`exec error: ${error}`);
        }
        console.log(`stdout: ${stdout}`)
        console.log(`stderr: ${stderr}`)
    })
    // yhi url hm database mein save krwaate h
    const videoUrl = `http://localhost:8000/uploads/courses/${lessonId}/index.m3u8`

    res.json({
        message: `Video Converted to HLS format`,
        videoUrl: videoUrl,
        lessonId: lessonId
    })

})

app.listen(8000, () => {
  console.log("App is Connected to Port 8000");
});
