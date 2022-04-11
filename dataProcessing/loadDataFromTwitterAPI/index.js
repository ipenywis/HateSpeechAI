import { Client } from "twitter-api-sdk";
import path from "path";
import fs from "fs";
import neatCsv from "neat-csv";
// const neatCsv = require("neat-csv");
import { fileURLToPath } from "url";
import { createObjectCsvWriter } from "csv-writer";

const TWITTER_OAUTH2_TOKEN =
  "AAAAAAAAAAAAAAAAAAAAAAs4bAEAAAAAEoWLw%2F2Lv8z6F2HmXyrSQzK%2FJlE%3DgsX4MBRkcxrVNNslcwbbFme7lrgtICYxRIm9oVWO7nyQdCb31b";

const client = new Client(TWITTER_OAUTH2_TOKEN);

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const FILE_PATH = path.resolve(
  __dirname,
  "../../data/80k_dataset/hatespeechtwitter.csv"
);
let CHUNK_SIZE = 5048;
let buffer = Buffer.alloc(CHUNK_SIZE);
let offset = 0;
let lines = [];

const OUTPUT_FILE_PATH = path.resolve(
  __dirname,
  "../../data/80k_dataset/final.csv"
);

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
};

async function fetchTweets(ids) {
  return client.tweets.findTweetsById({ ids });
}

const wait = async (ms) => new Promise((resolve) => setTimeout(resolve, ms));

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

console.log("Lines: ", lines, lines.length);

(async () => {
  try {
    let idx = 0;
    let done = false;

    // console.log(readBuffer.buffer.toString());

    // const parser = parse({ delimiter: "," });

    const Data = await neatCsv(lines.join("\n"));

    console.log("Parsed data length", Data.length, Data.slice(0, 20));

    const fetchedTweets = [];

    //Split data to 100s chunks (Twitter support max 100 tweets per request)
    const chunks = [];
    for (let i = 0; i < Data.length; i += 100) {
      chunks.push(Data.slice(i, i + 100));
    }

    console.log("Num of Chunks: ", chunks.length);

    //TOTAL: 800chunks
    //SPLIT1: 280chunks
    //SPLIT2: 280chunks
    //SPLIT3: 240chunks

    console.log("Offset: 561 - 800");

    for (const chunk of chunks.slice(561, 800)) {
      if (done) break;

      if (idx !== 0) {
        console.log(
          "Waiting 2 second. Before running next fetch to avoid rate limit..."
        );
        await wait(2000);
      }

      console.log("Fetching Batch No: ", chunks.indexOf(chunk) + 1);

      const tweets = await fetchTweets(chunk.map((row) => row.tweet_id));
      console.log("Tweets Fetched! Batch No:", chunks.indexOf(chunk) + 1);
      console.log("Processing Tweets...");

      for (const tweet of tweets.data) {
        if (done) break;

        const originalTweet = chunk.find((row) => row.tweet_id === tweet.id);
        const tweetId = tweet.id;
        const label = originalTweet.maj_label && originalTweet.maj_label.trim();
        const classLabel = TWEET_CLASS[label];

        if (!tweetId || !classLabel || !tweet.text) continue;

        const tweetData = {
          count: idx,
          class: classLabel,
          tweet: tweet.text,
        };

        fetchedTweets.push(tweetData);

        idx += 1;
      }
    }

    console.log("Tweets Fetching & Processing Finished!");
    console.log(
      "Processed Tweets: ",
      fetchedTweets.slice(0, 100),
      fetchedTweets.length
    );

    console.log("Writing to File...");

    const csvWriter = createObjectCsvWriter({
      path: OUTPUT_FILE_PATH,
      append: true,
      header: [
        { id: "count", title: "count" },
        { id: "class", title: "class" },
        { id: "tweet", title: "tweet" },
      ],
    });

    await csvWriter.writeRecords(fetchedTweets);

    console.log("Write Finished!");
    console.log("Tweets Fetching, Processing & Writing Finished!");
    console.log("Done!");

    // client.tweets.findTweetsById()
  } catch (err) {
    console.log("Unexpected error occured!");
    console.log(err);
  }
})();
