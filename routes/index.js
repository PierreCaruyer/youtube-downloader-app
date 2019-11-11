const express = require("express");
const router = express.Router();
const ytdl = require("youtube-dl");
const fs = require("fs");
const AUDIO_FORMAT = "mp3";
const VIDEO_FORMAT = "mp4";
const pending = [];

/* GET home page. */
router.get("/", (req, res) => res.sendFile(__dirname + "/index.html"));

router.post("/video", (req, res) => {
  const url = req.body.url;
  ytdl.getInfo(url, null, (err, info) => {
    if (err) {
      console.error(err);
      return;
    }
    download(url, info._filename, info.title);
  });
  res.redirect("/");
});

const download = (url, defaultFilename, actualFilename) => {
  ytdl.exec(url, ["-x", "--audio-format", AUDIO_FORMAT], {}, (err, output) => {
    if (err) {
      console.error(err);
      return;
    }
    console.log(output.join("\n"));
    renameFile(defaultFilename, `${actualFilename}.${AUDIO_FORMAT}`);
  });
};

const renameFile = (baseFilename, actualFilename) => {
  const filename = baseFilename.replace(VIDEO_FORMAT, AUDIO_FORMAT);
  fs.exists(filename, exists => {
    if (exists) {
      fs.rename(filename, actualFilename, err => {
        if (err) {
          return console.error(err);
        }
        console.log(
          `Successfully renamed the file ${filename} to ${actualFilename}`
        );
      });
      delete pending[filename];
    } else {
      console.warn(`${filename} does not exist`);
      pending[filename] = actualFilename;
    }
  });
};

module.exports = router;
