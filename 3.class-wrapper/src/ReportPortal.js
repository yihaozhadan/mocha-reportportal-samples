const axios = require("axios");

const REPORTPORTAL_URL = "http://localhost:8080";
const REPORTPORTAL_API_KEY =
  "poc_4DaW0uOqRYSDcu-vaIWNYQzMWUhobNTTK7fD8wvVg8UEciK5_zcnZdBvukskIaSc";
const REPORTPORTAL_PROJECT = "poc";

module.exports = class ReportPortal {
  axioInstance;
  launch;
  rootItem;
  constructor(launchName, { description, attributes, mode, rerun, rerunOf }) {
    this.launch = new Launch(launchName, {
      description,
      attributes,
      mode,
      rerun,
      rerunOf,
    });
    this.axioInstance = axios.create({
      baseURL: REPORTPORTAL_URL,
      timeout: 10000,
      headers: {
        Authorization: `Bearer ${REPORTPORTAL_API_KEY}`,
        "Content-Type": "application/json",
      },
    });
  }
  async startLaunch() {
    try {
      const { data } = await this.axioInstance.post(
        `/api/v1/${REPORTPORTAL_PROJECT}/launch`,
        {
          ...this.launch.deconstruct(),
        }
      );
      this.launch.uuid = data.id;
    } catch (error) {
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error(error.response.data);
        console.error(error.response.status);
        console.error(error.response.headers);
      } else if (error.request) {
        // The request was made but no response was received
        // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
        // http.ClientRequest in node.js
        console.error(error.request);
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error("Error", error.message);
      }
      console.error(error.config);
    }
  }
  async finishLaunch(
    { description, status } = {
      description: `Finish launch ${this.launch.uuid}`,
      status: "passed",
    }
  ) {
    // Finish ReportPortal Launch
    try {
      await this.axioInstance.put(
        `/api/v1/${REPORTPORTAL_PROJECT}/launch/${this.launch.uuid}/finish`,
        {
          description,
          endTime: new Date().toISOString(),
          status,
        }
      );
    } catch (error) {
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error(error.response.data);
        console.error(error.response.status);
        console.error(error.response.headers);
      } else if (error.request) {
        // The request was made but no response was received
        // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
        // http.ClientRequest in node.js
        console.error(error.request);
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error("Error", error.message);
      }
      console.error(error.config);
    }
  }
  async startRootItem({
    name,
    description,
    attributes,
    codeRef,
    parameters,
    retry,
  }) {
    this.rootItem = new Item({
      name,
      type: "suite",
      launchUuid: this.launch.uuid,
      description,
      attributes,
      codeRef,
      parameters,
      retry,
      hasStats: true,
    });
    try {
      const { data } = await this.axioInstance.post(
        `/api/v1/${REPORTPORTAL_PROJECT}/item`,
        {
          ...this.rootItem.deconstruct(),
        }
      );
      this.rootItem.uuid = data.id;
    } catch (error) {
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error(error.response.data);
        console.error(error.response.status);
        console.error(error.response.headers);
      } else if (error.request) {
        // The request was made but no response was received
        // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
        // http.ClientRequest in node.js
        console.error(error.request);
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error("Error", error.message);
      }
      console.error(error.config);
    }
  }
  async finishRootItem(
    { name, status } = { name: this.rootItem.name, status: "passed" }
  ) {
    try {
      await this.axioInstance.put(
        `/api/v1/${REPORTPORTAL_PROJECT}/item/${this.rootItem.uuid}`,
        {
          name,
          endTime: Date.now(),
          launchUuid: this.launch.uuid,
          status,
        }
      );
    } catch (error) {
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error(error.response.data);
        console.error(error.response.status);
        console.error(error.response.headers);
      } else if (error.request) {
        // The request was made but no response was received
        // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
        // http.ClientRequest in node.js
        console.error(error.request);
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error("Error", error.message);
      }
      console.error(error.config);
    }
  }
  //   async startContainerItem() {}
  //   async finishContainerItem() {}
  //   async startStepItem() {}
  //   async finishStepItem() {}
  //   async startNestedStepItem() {}
  //   async finishNestedStepItem() {}
  async saveSingleLog({
    itemUuid = this.rootItem.uuid,
    message,
    level = 10000,
  }) {
    try {
      await this.axioInstance.post(`/api/v1/${REPORTPORTAL_PROJECT}/log`, {
        launchUuid: this.launch.uuid,
        itemUuid,
        time: Date.now(),
        level,
        message,
      });
    } catch (error) {
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error(error.response.data);
        console.error(error.response.status);
        console.error(error.response.headers);
      } else if (error.request) {
        // The request was made but no response was received
        // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
        // http.ClientRequest in node.js
        console.error(error.request);
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error("Error", error.message);
      }
      console.error(error.config);
    }
  }
};

class Launch {
  name;
  startTime;
  description = "";
  uuid;
  attributes;
  mode = "DEFAULT";
  rerun = false;
  rerunOf;
  constructor(name, { description, attributes, mode, rerun, rerunOf }) {
    this.name = name;
    this.startTime = Date.now();
    if (description) this.description = description;
    if (attributes) this.attributes = attributes;
    if (mode) this.mode = mode;
    if (rerun) this.rerun = rerun;
    if (rerun) this.rerun = rerun;
    if (rerunOf) this.rerunOf = rerunOf;
  }
  deconstruct() {
    return {
      name: this.name,
      startTime: this.startTime,
      description: this.description,
      attributes: this.attributes,
      mode: this.mode,
      rerun: this.rerun,
      rerunOf: this.rerunOf,
    };
  }
}

class Item {
  name;
  startTime;
  type;
  launchUuid;
  description;
  attributes;
  uuid;
  codeRef;
  parameters;
  uniqueId;
  retry = false;
  hasStats = true;
  constructor({
    name,
    type,
    launchUuid,
    description,
    attributes,
    codeRef,
    parameters,
    retry,
    hasStats,
  }) {
    this.name = name;
    this.startTime = Date.now();
    this.type = type;
    this.launchUuid = launchUuid;
    this.description = description;
    this.attributes = attributes;
    this.codeRef = codeRef;
    this.parameters = parameters;
    if (retry) this.retry = retry;
    if (hasStats) this.hasStats = hasStats;
  }

  deconstruct() {
    return {
      name: this.name,
      startTime: this.startTime,
      type: this.type,
      launchUuid: this.launchUuid,
      description: this.description,
      attributes: this.attributes,
      codeRef: this.codeRef,
      parameters: this.parameters,
      retry: this.retry,
      hasStats: this.hasStats,
    };
  }
}
