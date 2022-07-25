// imports
const express = require("express");
const app = express();
const fs = require("fs");
const multer = require("multer");
const { createWorker } = require("tesseract.js");

//view engine
app.use(express.static(__dirname + "/views"));
app.set("view engine", "ejs");

//storage
const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, "./uploads");
  },
  filename: (req, file, callback) => {
    callback(null, file.originalname);
  },
});
const upload = multer({
  storage: storage,
}).single("marvel");

//route
app.get("/", (req, res) => {
  res.render("index");
});

app.post("/upload", (req, res) => {
  upload(req, res, (err) => {
    fs.readFile(`./uploads/${req.file.originalname}`, (err, data) => {
      if (err) {
        return console.log("This is your error", err);
      }
      /*worker
        .load()
        .recognize(data, "eng", { tessjs_create_pdf: 1 })
        .progress((progress) => {
          console.log(progress);
        })
        .then((result) => {
          res.send(result.text);
        })
        .finally(() => {
          worker.terminate();
        });*/

      (async () => {
        const worker = createWorker();
        await worker.load();
        await worker.loadLanguage("eng");
        await worker.initialize("eng");
        const {
          data: { text },
        } = await worker.recognize(data);
        //console.log(text);

        /* const { data2 } = await worker.getPDF("Tesseract OCR Result");
        fs.writeFileSync("tesseract-ocr-result.pdf", Buffer.from(data));
        console.log("Generate PDF: tesseract-ocr-result.pdf");
        res.redirect("/download");*/
        res.send(text);
        await worker.terminate();
      })();
    });
  });
});

/*app.get("/download", (req, res) => {
  const file = `${__dirname}/tesseract-ocr-result.pdf`;
  res.download(file);
});*/

//start server
const PORT = 5000 || process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
