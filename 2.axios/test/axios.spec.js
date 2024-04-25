const assert = require("assert");
const axios = require("axios");

const REPORTPORTAL_URL = "http://localhost:8080";
const REPORTPORTAL_API_KEY =
  "{{the report portal api key}}";
const REPORTPORTAL_PROJECT = "poc";

const axioInstance = axios.create({
  baseURL: REPORTPORTAL_URL,
  timeout: 10000,
  headers: {
    Authorization: `Bearer ${REPORTPORTAL_API_KEY}`,
    "Content-Type": "application/json",
  },
});

describe("HTTP query parameter", function () {
  let launchId = "";
  before(async function () {
    // Start ReportPortal Launch
    try {
      const { data } = await axioInstance.post(
        `/api/v1/${REPORTPORTAL_PROJECT}/launch`,
        {
          name: "REST Test",
          description: "Test Report Portal REST API start\n",
          startTime: new Date().toISOString(),
          mode: "DEFAULT",
          attributes: [
            {
              key: "version",
              value: "0.0.1",
            },
            {
              value: "test",
            },
          ],
        }
      );
      launchId = data.id;
      console.log(`## Start launch: ${JSON.stringify(data)}`);
    } catch (error) {
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.log(error.response.data);
        console.log(error.response.status);
        console.log(error.response.headers);
      } else if (error.request) {
        // The request was made but no response was received
        // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
        // http.ClientRequest in node.js
        console.log(error.request);
      } else {
        // Something happened in setting up the request that triggered an Error
        console.log("Error", error.message);
      }
      console.log(error.config);
    }
  });
  it("should be 1", async function () {
    const { data } = await axioInstance.post(
      `/api/v1/${REPORTPORTAL_PROJECT}/item`,
      {
        name: "Start suite item",
        description: "Start root item\n",
        startTime: new Date().toISOString(),
        type: "suite",
        launchUuid: launchId,
      }
    );
    const rootItemId = data.id;

    await axioInstance.post(`/api/v1/${REPORTPORTAL_PROJECT}/log`, {
      launchUuid: launchId,
      itemUuid: rootItemId,
      time: Date.now(),
      level: 10000,
      message: `Request:
url: "https://httpbin.org/get?q1=1"`,
    });
    const res = await axios.get("https://httpbin.org/get?q1=1");
    await axioInstance.post(`/api/v1/${REPORTPORTAL_PROJECT}/log`, {
      launchUuid: launchId,
      itemUuid: rootItemId,
      time: Date.now(),
      level: 10000,
      message: `Response:${JSON.stringify(res.data, null, 2)}`,
    });
    assert.equal(res.data.args.q1, 1, "The expected query parameter is not 1");

    await axioInstance.put(
      `/api/v1/${REPORTPORTAL_PROJECT}/item/${rootItemId}`,
      {
        name: "Finish suite item",
        description: "Finish root item\n",
        endTime: new Date().toISOString(),
        status: "passed",
      }
    );
  });

  after(async function () {
    // Finish ReportPortal Launch
    try {
      const { data } = await axioInstance.put(
        `/api/v1/${REPORTPORTAL_PROJECT}/launch/${launchId}/finish`,
        {
          description: "Test Report Portal REST API finish",
          endTime: new Date().toISOString(),
          status: "passed",
        }
      );
      console.log(`## Launch finish: ${JSON.stringify(data)}`);
    } catch (error) {
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.log(error.response.data);
        console.log(error.response.status);
        console.log(error.response.headers);
      } else if (error.request) {
        // The request was made but no response was received
        // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
        // http.ClientRequest in node.js
        console.log(error.request);
      } else {
        // Something happened in setting up the request that triggered an Error
        console.log("Error", error.message);
      }
      console.log(error.config);
    }
  });
});
