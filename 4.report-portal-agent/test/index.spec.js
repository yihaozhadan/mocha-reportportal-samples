const assert = require("assert");
const PublicReportingAPI = require("@reportportal/agent-js-mocha/lib/publicReportingAPI");

describe("HTTP query parameter", function () {
  before(function () {
    // Start ReportPortal Launch
    PublicReportingAPI.setDescription("suite description");
  });
  it("should be 1", async function () {
    PublicReportingAPI.setDescription("test description");
    const res = await fetch("https://httpbin.org/get?q1=1");
    PublicReportingAPI.debug('Request: url: "https://httpbin.org/get?q1=1"');
    const data = await res.json();
    PublicReportingAPI.debug(`Response:${JSON.stringify(data, null, 2)}`);
    assert.equal(data.args.q1, 2, "The expected query parameter is not 1");
    // Report Portal set the test status automatically
    //PublicReportingAPI.setStatusPassed();
  });

  after(async function () {
    // Report Portal set the launch status automatically
    //PublicReportingAPI.setLaunchStatusPassed();
  });
});
