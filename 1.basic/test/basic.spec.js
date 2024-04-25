const assert = require("assert");

const REPORTPORTAL_URL = "http://localhost:8080";
const REPORTPORTAL_API_KEY =
  "{{the report portal api key}}";
const REPORTPORTAL_PROJECT = "poc";

describe("HTTP query parameter", function () {
  let launchId = "";
  before(async function () {
    // Start ReportPortal Launch
    try {
      const res = await fetch(
        `${REPORTPORTAL_URL}/api/v1/${REPORTPORTAL_PROJECT}/launch`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${REPORTPORTAL_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
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
          }),
        }
      );
      const data = await res.json();
      console.log(`## Start launch: ${JSON.stringify(data, null, 2)}`);
      launchId = data.id;
    } catch (error) {
      console.error("Error in before function:", error);
    }
  });

  it("should be 1", async function () {
    const suiteItemRes = await fetch(
      `${REPORTPORTAL_URL}/api/v1/${REPORTPORTAL_PROJECT}/item`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${REPORTPORTAL_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: "Start suite item",
          description: "Start root item\n",
          startTime: new Date().toISOString(),
          type: "suite",
          launchUuid: launchId,
        }),
      }
    );
    const suiteItemResData = await suiteItemRes.json();
    const rootItemId = suiteItemResData.id;
    // Log the HTTP request info in Report Portal
    await fetch(`${REPORTPORTAL_URL}/api/v1/${REPORTPORTAL_PROJECT}/log`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${REPORTPORTAL_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        launchUuid: launchId,
        itemUuid: rootItemId,
        time: Date.now(),
        level: 10000,
        message: `Request:
url: "https://httpbin.org/get?q1=1"`,
      }),
    });

    const res = await fetch("https://httpbin.org/get?q1=1");
    const data = await res.json();
    assert.equal(data.args.q1, 1, "The expected query parameter is not 1");
    // Log the HTTP response info in Report Portal
    await fetch(`${REPORTPORTAL_URL}/api/v1/${REPORTPORTAL_PROJECT}/log`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${REPORTPORTAL_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        launchUuid: launchId,
        itemUuid: rootItemId,
        time: Date.now(),
        level: 10000,
        message: `Response: ${JSON.stringify(data, null, 2)}`,
      }),
    });

    await fetch(
      `${REPORTPORTAL_URL}/api/v1/${REPORTPORTAL_PROJECT}/item/${rootItemId}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${REPORTPORTAL_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: "Finish suite item",
          description: "Finish root item\n",
          endTime: new Date().toISOString(),
          status: "passed",
        }),
      }
    );
  });

  after(async function () {
    // Finish ReportPortal Launch
    try {
      const res = await fetch(
        `${REPORTPORTAL_URL}/api/v1/${REPORTPORTAL_PROJECT}/launch/${launchId}/finish`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${REPORTPORTAL_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            description: "Test Report Portal REST API finish",
            endTime: new Date().toISOString(),
            status: "passed",
          }),
        }
      );
      console.log(`## Launch finish: ${JSON.stringify(await res.json())}`);
    } catch (error) {
      console.error("Error in after function:", error);
    }
  });
});
