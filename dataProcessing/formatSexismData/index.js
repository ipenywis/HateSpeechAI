import neatCsv from "neat-csv";
import { createObjectCsvWriter } from "csv-writer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const OUTPUT_FILE_PATH = path.resolve(__dirname, "../../data/sexism-final.csv");

const FILE_PATH = path.resolve(
  __dirname,
  "../../data/12k tweets with tweet id and class.csv"
);
let CHUNK_SIZE = 5048;
let buffer = Buffer.alloc(CHUNK_SIZE);
let offset = 0;
let lines = [];

const file = fs.openSync(FILE_PATH, "r");

let readBuffer;
let chunkCount = 0;
let bytesRead = 0;

while ((bytesRead = fs.readSync(file, buffer, 0, CHUNK_SIZE, offset))) {
  console.log("Fetched Chunk: ", chunkCount, buffer.length);

  // let bytesRead = readBuffer.bytesRead;
  offset += bytesRead;
  let str = buffer.slice(0, bytesRead).toString();
  let arr = str.split("\n");

  if (bytesRead == CHUNK_SIZE) {
    // the last item of the arr may be not a full line, leave it to the next chunk
    offset -= arr.pop().length;
  }

  console.log("Line: ", arr, arr.length);
  lines.push(...arr);

  chunkCount++;
}

const TWEET_CLASS = {
  neutral: 2,
  normal: 2,
  hate: 0,
  hateful: 0,
  offensive: 1,
  abusive: 3,
  insult: 4,
  racism: 5,
  spam: 6,
  sexism: 5,
  none: 2,
};

(async () => {
  // console.log("Lines: ", lines);

  const Data = await neatCsv(lines.join("\n"));

  console.log("Tweets: ", Data);

  let i = 0;

  for (const tweet of Data) {
    const tweetClass = tweet.Class;
    const tweetText = tweet.Tweets;
    const rightClass = TWEET_CLASS[tweetClass];

    const tweetData = {
      count: i,
      tweet: tweetText,
      class: rightClass,
    };

    console.log("Tweet: ", tweetData);

    const csvWriter = createObjectCsvWriter({
      path: OUTPUT_FILE_PATH,
      append: true,
      header: [
        { id: "count", title: "count" },
        { id: "class", title: "class" },
        { id: "tweet", title: "tweet" },
      ],
    });

    await csvWriter.writeRecords([tweetData]);

    i++;
  }
})();
