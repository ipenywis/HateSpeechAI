const jsonData = require("../../data/hatespeech-offensive 20k/dataset.json");
const { createObjectCsvWriter } = require("csv-writer");
const { resolve } = require("path");

const OUTPUT_FILE_PATH = resolve(
  __dirname,
  "../../data/hatespeech-offensive 20k/final.csv"
);

function getMajorityAnnotation(annotations) {
  const map = new Map();

  for (const annotation of annotations) {
    map.set(annotation.label, (map.get(annotation.label) || 0) + 1);
  }

  let max = 0;
  let maxLabel = null;
  for (const [label, count] of map) {
    if (count > max) {
      max = count;
      maxLabel = label;
    }
  }

  return maxLabel;
}

const TWEET_CLASS = {
  neutral: 2,
  normal: 2,
  hate: 0,
  hatespeech: 0,
  offensive: 1,
  abusive: 3,
  insult: 4,
  racism: 5,
  spam: 6,
};

(async () => {
  let i = 0;

  for (const tweet of Object.values(jsonData)) {
    const postId = tweet["post_id"];
    const annotators = tweet.annotators;
    const numAnnotators = annotators.length;

    const postTokens = tweet["post_tokens"];
    const post = postTokens.join(" ");

    const majorityLabel = getMajorityAnnotation(annotators);

    const csvWriter = createObjectCsvWriter({
      path: OUTPUT_FILE_PATH,
      append: true,
      header: [
        { id: "count", title: "count" },
        { id: "class", title: "class" },
        { id: "tweet", title: "tweet" },
      ],
    });

    const record = { count: i, class: TWEET_CLASS[majorityLabel], tweet: post };
    console.log("Count: ", i, "Label: ", majorityLabel);

    await csvWriter.writeRecords([record]);

    // if (i === 10) break;

    i++;
  }
})();
