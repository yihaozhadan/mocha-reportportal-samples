const assert = require("assert");
const axios = require("axios");
const ReportPortal = require("../src/ReportPortal");

describe("HTTP query parameter", function () {
  let rp;
  before(async function () {
    rp = new ReportPortal("Test", { description: "Report Portal Sample" });
    await rp.startLaunch();
    await rp.startRootItem({name: 'root test item'});
  });

  it("should be 1", async function () {
    await rp.saveSingleLog({
      message: `Request: url: "https://httpbin.org/get?q1=1"`,
    });
    const res = await axios.get("https://httpbin.org/get?q1=1");
    await rp.saveSingleLog({
      message: `Response:${JSON.stringify(res.data, null, 2)}`,
    });
    assert.equal(res.data.args.q1, 1, "The expected query parameter is not 1");
  });

  after(async function () {
    await rp.finishRootItem();
    await rp.finishLaunch();
  });
});
