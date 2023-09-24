// const express = require("express");
// const app = express();
// const fs = require("fs");

// app.get("/", function (req, res) {
//   res.sendFile(__dirname + "/index.html");
// });

// app.get("/video", function (req, res) {
//   // Ensure there is a range given for the video
//   const range = req.headers.range;
//   if (!range) {
//     res.status(400).send("Requires Range header");
//   }

//   // get video stats (about 61MB)
//   const videoPath = "jiraVideo.mp4";
//   const videoSize = fs.statSync("jiraVideo.mp4").size;

//   // Parse Range
//   // Example: "bytes=32324-"
//   const CHUNK_SIZE = 10 ** 6; // 1MB
//   const start = Number(range.replace(/\D/g, ""));
//   const end = Math.min(start + CHUNK_SIZE, videoSize - 1);

//   // Create headers
//   const contentLength = end - start + 1;
//   const headers = {
//     "Content-Range": `bytes ${start}-${end}/${videoSize}`,
//     "Accept-Ranges": "bytes",
//     "Content-Length": contentLength,
//     "Content-Type": "video/mp4",
//   };

//   // HTTP Status 206 for Partial Content
//   res.writeHead(206, headers);

//   // create video read stream for this particular chunk
//   const videoStream = fs.createReadStream(videoPath, { start, end });

//   // Stream the video chunk to the client
//   videoStream.pipe(res);
// });

// app.listen(8000, function () {
//   console.log("Listening on port 8000!");
// });


// ************** Updated Code *****************


const fs = require('fs');
const express = require('express');
const bodyParser = require('body-parser');
const expressFileUpload = require('express-fileupload');
const ffmpeg = require('fluent-ffmpeg');
const path = require('path');

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// require('./mongo_db/mongo_conn.js')

app.use(
    expressFileUpload({
        useTempFiles: true,
        tempFileDir: "/tmp/",
    })
);

ffmpeg.setFfmpegPath("C:/Users/HP/Downloads/ffmpeg-6.0-essentials_build/ffmpeg-6.0-essentials_build/bin/ffmpeg.exe");
ffmpeg.setFfprobePath("C:/Users/HP/Downloads/ffmpeg-6.0-essentials_build/ffmpeg-6.0-essentials_build/bin/ffprobe.exe");
ffmpeg.setFlvtoolPath("C:/Users/HP/Downloads/ffmpeg-6.0-essentials_build/ffmpeg-6.0-essentials_build/bin/ffplay.exe");


app.listen(6200, (error) => {
    if (!error)
        console.log("Server is running at port 6200");
    else
        console.log("Error Occurred ", error);
});

app.get('/', (req, res) => {
    const filePath = path.join(__dirname, 'index.html');
    res.sendFile(filePath);
});



// app.get("/video", function (req, res) {
//   // Ensure there is a range given for the video
//   const range = req.headers.range;
//   if (!range) {
//     res.status(400).send("Requires Range header");
//   }

//   // get video stats (about 61MB)
//   const videoPath = "C:\\Users\\HP\\Downloads\\output (14).mp4";
//   const videoSize = fs.statSync("C:\\Users\\HP\\Downloads\\output (14).mp4").size;

//   // Parse Range
//   // Example: "bytes=32324-"
//   const CHUNK_SIZE = 10 ** 6; // 1MB
//   const start = Number(range.replace(/\D/g, ""));
//   const end = Math.min(start + CHUNK_SIZE, videoSize - 1);

//   // Create headers
//   const contentLength = end - start + 1;
//   const headers = {
//     "Content-Range": `bytes ${start}-${end}/${videoSize}`,
//     "Accept-Ranges": "bytes",
//     "Content-Length": contentLength,
//     "Content-Type": "video/mp4",
//   };

//   // HTTP Status 206 for Partial Content
//   res.writeHead(206, headers);

//   // create video read stream for this particular chunk
//   const videoStream = fs.createReadStream(videoPath, { start, end });

//   // Stream the video chunk to the client
//   videoStream.pipe(res);
// });

app.post('/convert', (req, res) => {
    let to = req.body.to;
    let files = req.files.files;

    if (!Array.isArray(files)) {
        files = [files];
    }

    const filePaths = [];

    files.forEach((file, index) => {
        const filePath = `tmp/${index}_${file.name}`;
        filePaths.push(filePath);

        file.mv(filePath, function (err) {
            if (err) {
                console.error(`Error uploading file ${index}:`, err);
                res.status(500).json({ error: 'File upload failed' });
            } else {
                console.log(`File ${index} uploaded successfully`);
            }
        });
    });

    const videoFileName = 'output.' + to;
    const inputFiles = filePaths.map((filePath) => {
        return `file '${filePath}'`;
    });


    const inputListFile = 'input.txt';
    fs.writeFileSync(inputListFile, inputFiles.join('\n'));


    ffmpeg()
        .input(inputListFile)
        .inputOptions(['-f concat', '-safe 0'])
        .outputOptions(['-r 8'])
        .output(`tmp/${videoFileName}`)
        .on('end', function () {
            console.log('Video creation finished');
            const vdopath = `tmp/${videoFileName}`;

            res.download(`${__dirname}/tmp/${videoFileName}`, videoFileName, function (err) {
              
                if (err) {
                    console.error('Error sending video file:', err);
                    res.status(500).json({ error: 'Video send failed' });
                } else {
                    console.log('Video file sent successfully');


                    filePaths.forEach((filePath) => {
                        fs.unlinkSync(filePath);
                    });
                    fs.unlinkSync(inputListFile);
                    fs.unlinkSync(`${__dirname}/tmp/${videoFileName}`);
                }
            });
        })
        .on('error', function (err) {
            console.error('Error creating video:', err);
            res.status(500).json({ error: 'Video creation failed' });
        })
        .run();
});

app.get("/video", function (req, res) {
  res.sendFile(path.join(__dirname, 'video.html'));
  // Ensure there is a range given for the video
  //const range = req.headers.range;
  range = 'byte=0-999';
  if (!range) {
    res.status(400).send("Requires Range header");
  }

  // get video stats (about 61MB)
  const videoPath = "C:\\Users\\HP\\Downloads\\output (14).mp4";
  const videoSize = fs.statSync("C:\\Users\\HP\\Downloads\\output (14).mp4").size;

  // Parse Range
  // Example: "bytes=32324-"
  const CHUNK_SIZE = 10 ** 6; // 1MB
  const start = Number(range.replace(/\D/g, ""));
  const end = Math.min(start + CHUNK_SIZE, videoSize - 1);

  // Create headers
  const contentLength = end - start + 1;
  const headers = {
    "Content-Range": `bytes ${start}-${end}/${videoSize}`,
    "Accept-Ranges": "bytes",
    "Content-Length": contentLength,
    "Content-Type": "video/mp4",
  };

  // HTTP Status 206 for Partial Content
  res.writeHead(206, headers);

  // create video read stream for this particular chunk
  const videoStream = fs.createReadStream(videoPath, { start, end });

  // Stream the video chunk to the client
  videoStream.pipe(res);
});