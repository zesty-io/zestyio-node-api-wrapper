const request = require("request").defaults({ strictSSL: false });
const moment = require("moment");

class ZestyioAPIWrapper {
  constructor(instanceZUID, token, options = {}) {
    this.defaultAccessError = "Request Failed";

    this.instancesAPIEndpoints = {
      modelsGETAll: "/content/models",
      modelsGET: "/content/models/MODEL_ZUID",
      fieldsGETAll: "/content/models/MODEL_ZUID/fields",
      fieldGET: "/content/models/MODEL_ZUID/fields/FIELD_ZUID",
      itemsGETAll: "/content/models/MODEL_ZUID/items",
      itemsPOST: "/content/models/MODEL_ZUID/items",
      itemsGET: "/content/models/MODEL_ZUID/items/ITEM_ZUID",
      itemsGETPublishings:
        "/content/models/MODEL_ZUID/items/ITEM_ZUID/publishings",
      itemsGETPublishing:
        "/content/models/MODEL_ZUID/items/ITEM_ZUID/publishings/PUBLISHING_ZUID",
      itemsGETVersions: "/content/models/MODEL_ZUID/items/ITEM_ZUID/versions",
      itemsGETVersion:
        "/content/models/MODEL_ZUID/items/ITEM_ZUID/versions/VERSION_NUMBER",
      itemsPUT: "/content/models/MODEL_ZUID/items/ITEM_ZUID",
      viewsGETAll: "/web/views",
      viewsGET: "/web/views/VIEW_ZUID",
      viewsGETVersions: "/web/views/VIEW_ZUID/versions",
      viewsGETVersion: "/web/views/VIEW_ZUID/versions/VERSION_NUMBER",
      viewsPOST: "/web/views",
      viewsPUT: "/web/views/VIEW_ZUID",
      viewsPUTPublish: "/web/views/VIEW_ZUID?action=publish&purge_cache=true",
      settingsGETAll: "/env/settings",
      settingsGET: "/env/settings/SETTINGS_ID",
      stylesheetsGETAll: "/web/stylesheets",
      stylesheetsGET: "/web/stylesheets/STYLESHEET_ZUID",
      stylesheetsGETVersions: "/web/stylesheets/STYLESHEET_ZUID/versions",
      stylesheetsGETVersion:
        "/web/stylesheets/STYLESHEET_ZUID/versions/VERSION_NUMBER",
      stylesheetsPOST: "/web/stylesheets",
      stylesheetsPUT: "/web/stylesheets/STYLESHEET_ZUID",
      stylesheetsPUTPublish: "/web/stylesheets/STYLESHEET_ZUID?action=publish&purge_cache=true",
      scriptsGETAll: "/web/scripts",
      scriptsGET: "/web/scripts/SCRIPT_ZUID",
      scriptsGETVersions: "/web/scripts/SCRIPT_ZUID/versions",
      scriptsGETVersion: "/web/scripts/SCRIPT_ZUID/versions/VERSION_NUMBER",
      scriptsPOST: "/web/scripts",
      scriptsPUT: "/web/scripts/SCRIPT_ZUID",
      scriptsPUTPublish: "/web/scripts/SCRIPT_ZUID?action=publish&purge_cache=true",
      siteHeadGET: "/web/headers",
      navGET: "/env/nav",
      searchGET: "/search/items?q=SEARCH_TERM", // Undocumented
      headTagsGETAll: "/web/headtags",
      headTagsGET: "/web/headtags/HEADTAG_ZUID",
      headTagsDELETE: "/web/headtags/HEADTAG_ZUID",
      headTagsPUT: "/web/headtags/HEADTAG_ZUID",
      headTagsPOST: "/web/headtags",
      auditsGETAll: "/env/audits",
      auditsGET: "/env/audits/AUDIT_ZUID",
      auditsGETParams: "/env/audits?AUDIT_SEARCH_PARAMS"
    };

    this.accountsAPIEndpoints = {
      instanceGET: "/instances/INSTANCE_ZUID",
      instanceUsersGET: "/instances/INSTANCE_ZUID/users/roles",
      userGET: "/users/USER_ZUID",
      instanceGETAll: "/instances",
    };

    this.sitesServiceEndpoints = {
      schedulePublishPOST: "/content/items/ITEM_ZUID/publish-schedule",
      scheduleUnpublishPATCH:
        "/content/items/ITEM_ZUID/publish-schedule/PUBLISHING_ZUID",
      itemsDELETE: "/content/sets/MODEL_ZUID/items/ITEM_ZUID"
    };

    this.mediaAPIEndpoints = {
      binsGETAll: "/media-manager-service/site/SITE_ID/bins",
      binsGET: "/media-manager-service/bin/BIN_ID",
      binsPATCH: "/media-manager-service/bin/BIN_ID",
      filesPOST: "/media-storage-service/upload/STORAGE_DRIVER/STORAGE_NAME",
      filesGET: "/media-manager-service/file/FILE_ID",
      filesGETAll: "/media-manager-service/bin/BIN_ID/files",
      filesPATCH: "/media-manager-service/file/FILE_ID",
      filesDELETE: "/media-manager-service/file/FILE_ID",
      groupsGET: "/media-manager-service/group/GROUP_ID",
      groupsGETAll: "/media-manager-service/bin/BIN_ID/groups",
      groupsPOST: "/media-manager-service/group",
      groupsPATCH: "/media-manager-service/group/GROUP_ID",
      groupsDELETE: "/media-manager-service/group/GROUP_ID"
    };

    this.instancesAPIURL = options.hasOwnProperty("instancesAPIURL")
      ? options.instancesAPIURL
      : "https://INSTANCE_ZUID.api.zesty.io/v1";
    this.accountsAPIURL = options.hasOwnProperty("accountsAPIURL")
      ? options.accountsAPIURL
      : "https://accounts.api.zesty.io/v1";
    this.mediaAPIURL = options.hasOwnProperty("mediaAPIURL")
      ? options.mediaAPIURL
      : "https://svc.zesty.io";
    this.sitesServiceURL = options.hasOwnProperty("sitesServiceURL")
      ? options.sitesServiceURL
      : "https://svc.zesty.io/sites-service/INSTANCE_ZUID";
    this.logErrors = options.hasOwnProperty("logErrors")
      ? options.logErrors
      : false;
    this.logResponses = options.hasOwnProperty("logResponses")
      ? options.logResponses
      : false;

    this.instanceZUID = instanceZUID;
    this.token = token;
    this.instancesAPIURL = this.makeInstanceZUIDURL(
      this.instancesAPIURL,
      instanceZUID
    );
    this.sitesServiceURL = this.makeInstanceZUIDURL(
      this.sitesServiceURL,
      instanceZUID
    );
  }

  logError(msg) {
    // Don't log null messages
    if (this.logErrors && msg !== null) {
      console.log(msg);
    }
  }

  logResponse(msg) {
    if (this.logResponses) {
      console.log(msg);
    }
  }

  makeInstanceZUIDURL(url, zuid) {
    return this.replaceInURL(url, { INSTANCE_ZUID: zuid });
  }

  buildAPIURL(uri, api = "instances") {
    switch (api) {
      case "accounts":
        return `${this.accountsAPIURL}${uri}`;
      case "instances":
        return `${this.instancesAPIURL}${uri}`;
      case "sites-service":
        return `${this.sitesServiceURL}${uri}`;
      case "media":
        return `${this.mediaAPIURL}${uri}`;
      default:
        return "";
    }
  }

  replaceInURL(url, replacementObject) {
    for (const key in replacementObject) {
      url = url.replace(key, replacementObject[key]);
    }

    return url;
  }

  sitesServiceResponseFormatter(response) {
    return !response
      ? response
      : {
          _meta: {
            timestamp: moment.utc().toISOString(),
            totalResults: 1,
            start: 0,
            offset: 0,
            limit: 1
          },
          message: response.message || {},
          data: response.data || {}
        };
  }

  async getSiteId() {
    if (this.siteId) {
      return this.siteId;
    }

    const instanceData = await this.getInstance();
    this.siteId = instanceData.data.ID;

    return this.siteId;
  }

  async getModels() {
    const uri = this.buildAPIURL(this.instancesAPIEndpoints.modelsGETAll);

    return await this.getRequest({
      uri
    });
  }

  async getModel(modelZUID) {
    const uri = this.buildAPIURL(
      this.replaceInURL(this.instancesAPIEndpoints.modelsGET, {
        MODEL_ZUID: modelZUID
      })
    );

    return await this.getRequest({
      uri
    });
  }

  async getFields(modelZUID) {
    const uri = this.buildAPIURL(
      this.replaceInURL(this.instancesAPIEndpoints.fieldsGETAll, {
        MODEL_ZUID: modelZUID
      })
    );

    return await this.getRequest({
      uri
    });
  }

  async getField(modelZUID, fieldZUID) {
    const uri = this.buildAPIURL(
      this.replaceInURL(this.instancesAPIEndpoints.fieldGET, {
        MODEL_ZUID: modelZUID,
        FIELD_ZUID: fieldZUID
      })
    );

    return await this.getRequest({
      uri
    });
  }

  async getItem(modelZUID, itemZUID) {
    const uri = this.buildAPIURL(
      this.replaceInURL(this.instancesAPIEndpoints.itemsGET, {
        MODEL_ZUID: modelZUID,
        ITEM_ZUID: itemZUID
      })
    );

    return await this.getRequest({
      uri
    });
  }

  async saveItem(modelZUID, itemZUID, payload, showErr=false) {
    const uri = this.buildAPIURL(
      this.replaceInURL(this.instancesAPIEndpoints.itemsPUT, {
        MODEL_ZUID: modelZUID,
        ITEM_ZUID: itemZUID
      })
    );

    return await this.putRequest({
      uri,
      payload
    }, showErr);
  }

  async createItem(modelZUID, payload, showErr=false) {
    const uri = this.buildAPIURL(
      this.replaceInURL(this.instancesAPIEndpoints.itemsPOST, {
        MODEL_ZUID: modelZUID
      })
    );

    return await this.postRequest({
      uri,
      payload
    },showErr);
  }

  async publishItemImmediately(modelZUID, itemZUID, versionNumber) {
    // modelZUID is not required yet, but will be when we move from
    // sites-service to instances-api for this endpoint.  At this
    // point versionNumber will no longer be required.

    const uri = this.buildAPIURL(
      this.replaceInURL(this.sitesServiceEndpoints.schedulePublishPOST, {
        ITEM_ZUID: itemZUID
      }),
      "sites-service"
    );

    const payload = {
      version_num: versionNumber
    };

    return await this.postRequest({
      uri,
      payload,
      usesXAuthHeader: true,
      successCode: 200,
      responseFormatter: this.sitesServiceResponseFormatter
    });
  }

  async unpublishItemImmediately(modelZUID, itemZUID, publishingZUID) {
    // modelZUID is not required yet, but will be when we move from
    // sites-service to instances-api for this endpoint.  At this point
    // publishingZUID will no longer be required.

    const uri = this.buildAPIURL(
      this.replaceInURL(this.sitesServiceEndpoints.scheduleUnpublishPATCH, {
        ITEM_ZUID: itemZUID,
        PUBLISHING_ZUID: publishingZUID
      }),
      "sites-service"
    );

    const payload = {
      take_offline_at: moment.utc().format("YYYY-MM-DD HH:mm:ss")
    };

    return await this.patchRequest({
      uri,
      payload,
      usesXAuthHeader: true,
      responseFormatter: this.sitesServiceResponseFormatter
    });
  }

  async getItemPublishings(modelZUID, itemZUID) {
    const uri = this.buildAPIURL(
      this.replaceInURL(this.instancesAPIEndpoints.itemsGETPublishings, {
        MODEL_ZUID: modelZUID,
        ITEM_ZUID: itemZUID
      })
    );

    return await this.getRequest({
      uri
    });
  }

  async getItemPublishing(modelZUID, itemZUID, publishingZUID) {
    const uri = this.buildAPIURL(
      this.replaceInURL(this.instancesAPIEndpoints.itemsGETPublishing, {
        MODEL_ZUID: modelZUID,
        ITEM_ZUID: itemZUID,
        PUBLISHING_ZUID: publishingZUID
      })
    );

    return await this.getRequest({
      uri
    });
  }

  async getItems(modelZUID) {
    const uri = this.buildAPIURL(
      this.replaceInURL(this.instancesAPIEndpoints.itemsGETAll, {
        MODEL_ZUID: modelZUID
      })
    );

    return await this.getRequest({
      uri
    });
  }

  async getItemVersions(modelZUID, itemZUID) {
    const uri = this.buildAPIURL(
      this.replaceInURL(this.instancesAPIEndpoints.itemsGETVersions, {
        MODEL_ZUID: modelZUID,
        ITEM_ZUID: itemZUID
      })
    );

    return await this.getRequest({
      uri
    });
  }

  async getItemVersion(modelZUID, itemZUID, versionNumber) {
    const uri = this.buildAPIURL(
      this.replaceInURL(this.instancesAPIEndpoints.itemsGETVersion, {
        MODEL_ZUID: modelZUID,
        ITEM_ZUID: itemZUID,
        VERSION_NUMBER: versionNumber
      })
    );

    return await this.getRequest({
      uri
    });
  }

  async deleteItem(modelZUID, itemZUID) {
    const uri = this.buildAPIURL(
      this.replaceInURL(this.sitesServiceEndpoints.itemsDELETE, {
        MODEL_ZUID: modelZUID,
        ITEM_ZUID: itemZUID
      }),
      "sites-service"
    );

    return await this.deleteRequest({
      uri,
      usesXAuthHeader: true,
      responseFormatter: this.sitesServiceResponseFormatter
    });
  }

  async getViews() {
    const uri = this.buildAPIURL(this.instancesAPIEndpoints.viewsGETAll);

    return await this.getRequest({
      uri
    });
  }

  async getView(viewZUID) {
    const uri = this.replaceInURL(
      this.buildAPIURL(
        this.replaceInURL(this.instancesAPIEndpoints.viewsGET, {
          VIEW_ZUID: viewZUID
        })
      )
    );

    return await this.getRequest({
      uri
    });
  }

  async getViewVersions(viewZUID) {
    const uri = this.replaceInURL(
      this.buildAPIURL(
        this.replaceInURL(this.instancesAPIEndpoints.viewsGETVersions, {
          VIEW_ZUID: viewZUID
        })
      )
    );

    return await this.getRequest({
      uri
    });
  }

  async getViewVersion(viewZUID, versionNumber) {
    const uri = this.replaceInURL(
      this.buildAPIURL(
        this.replaceInURL(this.instancesAPIEndpoints.viewsGETVersion, {
          VIEW_ZUID: viewZUID,
          VERSION_NUMBER: versionNumber
        })
      )
    );

    return await this.getRequest({
      uri
    });
  }

  async saveView(viewZUID, payload, showErr=false) {
    const uri = this.replaceInURL(
      this.buildAPIURL(this.instancesAPIEndpoints.viewsPUT),
      { VIEW_ZUID: viewZUID }
    );

    return await this.putRequest({
      uri,
      payload
    },showErr);
  }

  async saveAndPublishView(viewZUID, payload, showErr=false) {
    const uri = this.replaceInURL(
      this.buildAPIURL(this.instancesAPIEndpoints.viewsPUTPublish),
      { VIEW_ZUID: viewZUID }
    );

    return await this.putRequest({
      uri,
      payload
    },showErr);
  }

  async createView(payload, showErr=false) {
    const uri = this.buildAPIURL(this.instancesAPIEndpoints.viewsPOST);

    return await this.postRequest({
      uri,
      payload
    }, showErr);
  }

  async getScripts() {
    const uri = this.buildAPIURL(this.instancesAPIEndpoints.scriptsGETAll);

    return await this.getRequest({
      uri
    });
  }

  async getScript(scriptZUID) {
    const uri = this.replaceInURL(
      this.buildAPIURL(this.instancesAPIEndpoints.scriptsGET),
      { SCRIPT_ZUID: scriptZUID }
    );

    return await this.getRequest({
      uri
    });
  }

  async getScriptVersions(scriptZUID) {
    const uri = this.replaceInURL(
      this.buildAPIURL(this.instancesAPIEndpoints.scriptsGETVersions),
      { SCRIPT_ZUID: scriptZUID }
    );

    return await this.getRequest({
      uri
    });
  }

  async getScriptVersion(scriptZUID, versionNumber) {
    const uri = this.replaceInURL(
      this.buildAPIURL(this.instancesAPIEndpoints.scriptsGETVersion),
      {
        SCRIPT_ZUID: scriptZUID,
        VERSION_NUMBER: versionNumber
      }
    );

    return await this.getRequest({
      uri
    });
  }

  async saveScript(scriptZUID, payload, showErr=false) {
    const uri = this.replaceInURL(
      this.buildAPIURL(this.instancesAPIEndpoints.scriptsPUT),
      { SCRIPT_ZUID: scriptZUID }
    );

    return await this.putRequest({
      uri,
      payload
    }, showErr);
  }

  async saveAndPublishScript(scriptZUID, payload, showErr=false) {
    const uri = this.replaceInURL(
      this.buildAPIURL(this.instancesAPIEndpoints.scriptsPUTPublish),
      { SCRIPT_ZUID: scriptZUID }
    );

    return await this.putRequest({
      uri,
      payload
    }, showErr);
  }

  async createScript(payload, showErr=false) {
    const uri = this.buildAPIURL(this.instancesAPIEndpoints.scriptsPOST);

    return await this.postRequest({
      uri,
      payload
    }, showErr);
  }

  async getStylesheets() {
    const uri = this.buildAPIURL(this.instancesAPIEndpoints.stylesheetsGETAll);
    return await this.getRequest({
      uri
    });
  }

  async getStylesheet(stylesheetZUID) {
    const uri = this.replaceInURL(
      this.buildAPIURL(this.instancesAPIEndpoints.stylesheetsGET),
      { STYLESHEET_ZUID: stylesheetZUID }
    );

    return await this.getRequest({
      uri
    });
  }

  async getStylesheetVersions(stylesheetZUID) {
    const uri = this.replaceInURL(
      this.buildAPIURL(this.instancesAPIEndpoints.stylesheetsGETVersions),
      { STYLESHEET_ZUID: stylesheetZUID }
    );

    return await this.getRequest({
      uri
    });
  }

  async getStylesheetVersion(stylesheetZUID, versionNumber) {
    const uri = this.replaceInURL(
      this.buildAPIURL(this.instancesAPIEndpoints.stylesheetsGETVersion),
      {
        STYLESHEET_ZUID: stylesheetZUID,
        VERSION_NUMBER: versionNumber
      }
    );

    return await this.getRequest({
      uri
    });
  }

  async saveStylesheet(stylesheetZUID, payload, showErr=false) {
    const uri = this.replaceInURL(
      this.buildAPIURL(this.instancesAPIEndpoints.stylesheetsPUT),
      { STYLESHEET_ZUID: stylesheetZUID }
    );

    return await this.putRequest({
      uri,
      payload
    }, showErr);
  }

  async saveAndPublishStylesheet(stylesheetZUID, payload, showErr=false) {
    const uri = this.replaceInURL(
      this.buildAPIURL(this.instancesAPIEndpoints.stylesheetsPUTPublish),
      { STYLESHEET_ZUID: stylesheetZUID }
    );

    return await this.putRequest({
      uri,
      payload
    }, showErr);
  }

  async createStylesheet(payload, showErr=false) {
    const uri = this.buildAPIURL(this.instancesAPIEndpoints.stylesheetsPOST);
    return await this.postRequest({
      uri,
      payload
    }, showErr);
  }

  async getInstance() {
    const uri = this.replaceInURL(
      this.buildAPIURL(this.accountsAPIEndpoints.instanceGET, "accounts"),
      { INSTANCE_ZUID: this.instanceZUID }
    );

    return await this.getRequest({
      uri
    });
  }

  async getInstances() {
    const uri = this.buildAPIURL(this.accountsAPIEndpoints.instanceGETAll, "accounts");
    return await this.getRequest({
      uri
    });
  }

  async getUser(userZUID) {
    const uri = this.replaceInURL(
      this.buildAPIURL(this.accountsAPIEndpoints.userGET, "accounts"),
      { USER_ZUID: userZUID }
    );

    return await this.getRequest({
      uri
    });
  }

  async getSiteHead() {
    const uri = this.buildAPIURL(this.instancesAPIEndpoints.siteHeadGET);

    return await this.getRequest({
      uri
    });
  }

  async getNav() {
    const uri = this.buildAPIURL(this.instancesAPIEndpoints.navGET);
    return await this.getRequest({
      uri
    });
  }

  async search(searchTerm) {
    const uri = this.replaceInURL(
      this.buildAPIURL(this.instancesAPIEndpoints.searchGET),
      { SEARCH_TERM: searchTerm }
    );

    return await this.getRequest({
      uri
    });
  }

  async getInstanceUsers() {
    const uri = this.replaceInURL(
      this.buildAPIURL(this.accountsAPIEndpoints.instanceUsersGET, "accounts"),
      { INSTANCE_ZUID: this.instanceZUID }
    );

    return await this.getRequest({
      uri
    });
  }

  async getSettings() {
    const uri = this.buildAPIURL(this.instancesAPIEndpoints.settingsGETAll);

    return await this.getRequest({
      uri
    });
  }

  async getSetting(settingsId) {
    const uri = this.replaceInURL(
      this.buildAPIURL(this.instancesAPIEndpoints.settingsGET),
      { SETTINGS_ID: settingsId }
    );

    return await this.getRequest({
      uri
    });
  }

  async createHeadTag(payload) {
    const uri = this.buildAPIURL(this.instancesAPIEndpoints.headTagsPOST);

    return await this.postRequest({
      uri,
      payload
    });
  }

  async saveHeadTag(headTagZUID, payload) {
    const uri = this.replaceInURL(
      this.buildAPIURL(this.instancesAPIEndpoints.headTagsPUT),
      { HEADTAG_ZUID: headTagZUID }
    );

    return await this.putRequest({
      uri,
      payload
    });
  }

  async getHeadTags() {
    const uri = this.buildAPIURL(this.instancesAPIEndpoints.headTagsGETAll);

    return await this.getRequest({
      uri
    });
  }

  async getHeadTag(headTagZUID) {
    const uri = this.replaceInURL(
      this.buildAPIURL(this.instancesAPIEndpoints.headTagsGET),
      { HEADTAG_ZUID: headTagZUID }
    );

    return this.getRequest({
      uri
    });
  }

  async deleteHeadTag(headTagZUID) {
    const uri = this.replaceInURL(
      this.buildAPIURL(this.instancesAPIEndpoints.headTagsDELETE),
      { HEADTAG_ZUID: headTagZUID }
    );

    return this.deleteRequest({
      uri
    });
  }

  async getAuditTrailEntries() {
    const uri = this.buildAPIURL(this.instancesAPIEndpoints.auditsGETAll);
    return await this.getRequest({
      uri
    });
  }

  async getAuditTrailEntry(auditTrailEntryZUID) {
    const uri = this.replaceInURL(
      this.buildAPIURL(this.instancesAPIEndpoints.auditsGET),
      { AUDIT_ZUID: auditTrailEntryZUID }
    );

    return await this.getRequest({
      uri
    });
  }

  async searchAuditTrailEntries(searchParams) {
    // Object keys can be:
    // order
    // dir
    // start_date
    // end_date
    // limit
    // page
    // action
    // affectedZUID
    // userZUID

    let requestParams = "";

    for (const paramName in searchParams) {
      requestParams = `${requestParams}${paramName}=${
        searchParams[paramName]
      }&`;
    }

    if (requestParams.endsWith("&")) {
      requestParams = requestParams.substring(0, requestParams.length - 1);
    }

    const uri = this.replaceInURL(
      this.buildAPIURL(this.instancesAPIEndpoints.auditsGETParams),
      { AUDIT_SEARCH_PARAMS: requestParams }
    );

    return await this.getRequest({
      uri
    });
  }

  // Media API functions
  async getMediaBins() {
    const siteId = await this.getSiteId();
    const uri = this.replaceInURL(
      this.buildAPIURL(this.mediaAPIEndpoints.binsGETAll, "media"),
      { SITE_ID: siteId }
    );

    return await this.getRequest({
      uri
    });
  }

  async getMediaBin(mediaBinId) {
    const uri = this.replaceInURL(
      this.buildAPIURL(this.mediaAPIEndpoints.binsGET, "media"),
      { BIN_ID: mediaBinId }
    );

    return await this.getRequest({
      uri
    });
  }

  async updateMediaBin(mediaBinId, payload) {
    const uri = this.replaceInURL(
      this.buildAPIURL(this.mediaAPIEndpoints.binsPATCH, "media"),
      { BIN_ID: mediaBinId }
    );

    return await this.formPatchRequest({
      uri,
      payload
    });
  }

  async getMediaFiles(mediaBinId) {
    const uri = this.replaceInURL(
      this.buildAPIURL(this.mediaAPIEndpoints.filesGETAll, "media"),
      { BIN_ID: mediaBinId }
    );

    return await this.getRequest({
      uri
    });
  }

  async getMediaFile(fileId) {
    const uri = this.replaceInURL(
      this.buildAPIURL(this.mediaAPIEndpoints.filesGET, "media"),
      { FILE_ID: fileId }
    );

    return await this.getRequest({
      uri
    });
  }

  async createMediaFile(binId, groupId, fileName, title, contentType, stream) {
    let bin = await this.getMediaBin(binId);
    bin = bin.data[0];

    const uri = this.replaceInURL(
      this.buildAPIURL(this.mediaAPIEndpoints.filesPOST, "media"),
      {
        STORAGE_DRIVER: bin.storage_driver,
        STORAGE_NAME: bin.storage_name
      }
    );

    return await this.formPostRequest({
      uri,
      payload: {
        bin_id: binId,
        group_id: groupId,
        title: title,
        file: {
          value: stream,
          options: {
            filename: fileName,
            contentType: contentType
          }
        }
        // NOTE: user_id - seems to be optional, didn't add it because
        // it adds another API call overhead for no benefit?
      }
    });
  }

  // payload: filename, title, group_id
  async updateMediaFile(fileId, payload) {
    const uri = this.replaceInURL(
      this.buildAPIURL(this.mediaAPIEndpoints.filesPATCH, "media"),
      { FILE_ID: fileId }
    );

    return await this.formPatchRequest({
      uri,
      payload
    });
  }

  async deleteMediaFile(fileId) {
    const uri = this.replaceInURL(
      this.buildAPIURL(this.mediaAPIEndpoints.filesDELETE, "media"),
      { FILE_ID: fileId }
    );

    return await this.deleteRequest({
      uri
    });
  }

  async getMediaGroups(mediaBinId) {
    const uri = this.replaceInURL(
      this.buildAPIURL(this.mediaAPIEndpoints.groupsGETAll, "media"),
      { BIN_ID: mediaBinId }
    );

    return await this.getRequest({
      uri
    });
  }

  async getMediaGroup(groupId) {
    const uri = this.replaceInURL(
      this.buildAPIURL(this.mediaAPIEndpoints.groupsGET, "media"),
      { GROUP_ID: groupId }
    );

    return await this.getRequest({
      uri
    });
  }

  // payload: bin_id, group_id, name
  async createMediaGroup(payload) {
    const uri = this.buildAPIURL(this.mediaAPIEndpoints.groupsPOST, "media");

    return await this.formPostRequest({
      uri,
      payload
    });
  }

  // payload: group_id, name
  async updateMediaGroup(groupId, payload) {
    const uri = this.replaceInURL(
      this.buildAPIURL(this.mediaAPIEndpoints.groupsPATCH, "media"),
      { GROUP_ID: groupId }
    );

    return await this.formPatchRequest({
      uri,
      payload
    });
  }

  async deleteMediaGroup(groupId) {
    const uri = this.replaceInURL(
      this.buildAPIURL(this.mediaAPIEndpoints.groupsDELETE, "media"),
      { GROUP_ID: groupId }
    );

    return await this.deleteRequest({
      uri
    });
  }

  // params:
  // { method: 'GET',
  //   uri: 'https://...',
  //   successCode: 200,
  //   payload: { ... },
  //   isFormPayload: false,
  //   usesXAuthHeader: false,
  //   responseFormatter: <name of function to format response prior to returning it>
  // }
  async makeRequest(params, showError=false) {
    const $this = this;
    const opts = {
      method: params.method,
      uri: params.uri,
      json: true,
      auth: {
        bearer: $this.token
      }
    };

    if (params.usesXAuthHeader) {
      opts.headers = {
        "X-Auth": $this.token
      };
    } else {
      opts.auth = {
        bearer: $this.token
      };
    }

    if (params.payload) {
      if (params.isFormPayload) {
        opts.formData = params.payload;
      } else {
        opts.body = params.payload;
      }
    }

    // weienwong - showError has a default false value for backward compatibility reasons
    // if we wish to return the contents of an error from the response body, set showError = true
    if (showError) {
      return new Promise((resolve, reject) => {
        request(opts, (error, response, body) => {
          if (error) {
            reject(error);
          } else {
            resolve(response)
          }
        })
      })
    } else {
      return new Promise((resolve, reject) => {
        request(opts, (error, response, body) => {
          this.logResponse(response);
  
          if (!error && response.statusCode === params.successCode) {
            resolve(
              params.responseFormatter ? params.responseFormatter(body) : body
            );
          } else {
            this.logError(error);
            reject({
              reason: $this.defaultAccessError,
              statusCode: response.statusCode,
              error
            });
          }
        });
      });
    }
  }

  async getRequest(params) {
    if (!params.hasOwnProperty("successCode")) {
      params.successCode = 200;
    }

    return this.makeRequest({
      method: "GET",
      ...params
    });
  }

  async deleteRequest(params) {
    if (!params.hasOwnProperty("successCode")) {
      params.successCode = 200;
    }

    return this.makeRequest({
      method: "DELETE",
      ...params
    });
  }

  async putRequest(params, showErr=false) {
    if (!params.hasOwnProperty("successCode")) {
      params.successCode = 200;
    }

    return this.makeRequest({
      method: "PUT",
      ...params
    }, showErr);
  }

  async postRequest(params, showErr=false) {
    if (!params.hasOwnProperty("successCode")) {
      params.successCode = 201;
    }

    return this.makeRequest({
      method: "POST",
      ...params
    }, showErr);
  }

  async patchRequest(params) {
    if (!params.hasOwnProperty("successCode")) {
      params.successCode = 200;
    }

    return this.makeRequest({
      method: "PATCH",
      ...params
    });
  }

  async formPostRequest(params) {
    if (!params.hasOwnProperty("successCode")) {
      params.successCode = 201;
    }

    return this.makeRequest({
      method: "POST",
      isFormPayload: true,
      ...params
    });
  }

  async formPatchRequest(params) {
    if (!params.hasOwnProperty("successCode")) {
      params.successCode = 200;
    }

    return this.makeRequest({
      method: "PATCH",
      isFormPayload: true,
      ...params
    });
  }
}

module.exports = ZestyioAPIWrapper;
