const request = require('request').defaults({ strictSSL: false })

class ZestyioAPIWrapper {
  constructor(instanceZUID, token, options = {}) {
    this.defaultAccessError = 'Request Failed'
  
    this.instancesAPIEndpoints = {
      modelsGETAll: '/content/models',
      modelsGET: '/content/models/MODEL_ZUID',
      fieldsGETAll: '/content/models/MODEL_ZUID/fields',
      fieldGET: '/content/models/MODEL_ZUID/fields/FIELD_ZUID',
      itemsGETAll: '/content/models/MODEL_ZUID/items',
      itemsPOST: '/content/models/MODEL_ZUID/items',
      itemsGET: '/content/models/MODEL_ZUID/items/ITEM_ZUID',
      itemsGETPublishings: '/content/models/MODEL_ZUID/items/ITEM_ZUID/publishings',
      itemsGETPublishing: '/content/models/MODEL_ZUID/items/ITEM_ZUID/publishings/PUBLISHING_ZUID',
      itemsGETVersions: '/content/models/MODEL_ZUID/items/ITEM_ZUID/versions',
      itemsGETVersion: '/content/models/MODEL_ZUID/items/ITEM_ZUID/versions/VERSION_NUMBER',
      itemsPUT: '/content/models/MODEL_ZUID/items/ITEM_ZUID',
      viewsGETAll: '/web/views',
      viewsGET: '/web/views/VIEW_ZUID',
      viewsGETVersions: '/web/views/VIEW_ZUID/versions',
      viewsGETVersion: '/web/views/VIEW_ZUID/versions/VERSION_NUMBER',
      viewsPOST: '/web/views',
      viewsPUT: '/web/views/VIEW_ZUID',
      viewsPUTPublish: '/web/views/VIEW_ZUID?publish=true',
      settingsGETAll: '/env/settings',
      settingsGET: '/env/settings/SETTINGS_ID',
      stylesheetsGETAll: '/web/stylesheets',
      stylesheetsGET: '/web/stylesheets/STYLESHEET_ZUID',
      stylesheetsGETVersions: '/web/stylesheets/STYLESHEET_ZUID/versions',
      stylesheetsGETVersion: '/web/stylesheets/STYLESHEET_ZUID/versions/VERSION_NUMBER',
      stylesheetsPOST: '/web/stylesheets',
      stylesheetsPUT: '/web/stylesheets/STYLESHEET_ZUID',
      scriptsGETAll: '/web/scripts',
      scriptsGET: '/web/scripts/SCRIPT_ZUID',
      scriptsGETVersions: '/web/scripts/SCRIPT_ZUID/versions',
      scriptsGETVersion: '/web/scripts/SCRIPT_ZUID/versions/VERSION_NUMBER',
      scriptsPOST: '/web/scripts',
      scriptsPUT: '/web/scripts/SCRIPT_ZUID',
      siteHeadGET: '/web/headers',
      navGET: '/env/nav',
      searchGET: '/search/items?q=SEARCH_TERM', // Undocumented
      headTagsGETAll: '/web/headtags',
      headTagsGET: '/web/headtags/HEADTAG_ZUID',
      headTagsDELETE: '/web/headtags/HEADTAG_ZUID',
      headTagsPUT: '/web/headtags/HEADTAG_ZUID',
      headTagsPOST: '/web/headtags',
      auditsGETAll: '/env/audits',
      auditsGET: '/env/audits/AUDIT_ZUID',
      auditsGETParams: '/env/audits?AUDIT_SEARCH_PARAMS'
    }
  
    this.accountsAPIEndpoints = {
      instanceGET: '/instances/INSTANCE_ZUID',
      instanceUsersGET: '/instances/INSTANCE_ZUID/users/roles'
    }
  
    this.mediaAPIEndpoints = {
      // binsPOST: '/media-manager-service/bin', // Not yet
      binsGETAll: '/media-manager-service/site/SITE_ID/bins',
      binsGET: '/media-manager-service/bin/BIN_ID',
      binsPATCH: '/media-manager-service/bin/BIN_ID',
      // binsDELETE: '/media-manager-service/bin/BIN_ID', // Not yet
      filesPOST: '/media-storage-service/upload/STORAGE_DRIVER/STORAGE_NAME',
      filesGET: '/media-manager-service/file/FILE_ID',
      filesGETAll: '/media-manager-service/bin/BIN_ID/files',
      filesPATCH: '/media-manager-service/file/FILE_ID',
      filesDELETE: '/media-manager-service/file/FILE_ID',
      groupsGET: '/media-manager-service/group/GROUP_ID',
      groupsGETAll: '/media-manager-service/bin/BIN_ID/groups',
      groupsPOST: '/media-manager-service/group',
      groupsPATCH: '/media-manager-service/group/GROUP_ID',
      groupsDELETE: '/media-manager-service/group/GROUP_ID'
    }

    this.instancesAPIURL = (options.hasOwnProperty('instancesAPIURL') ? options.instancesAPIURL : 'https://INSTANCE_ZUID.api.zesty.io/v1')
    this.accountsAPIURL = (options.hasOwnProperty('accountsAPIURL') ? options.accountsAPIURL : 'https://accounts.api.zesty.io/v1')
    this.mediaAPIURL = (options.hasOwnProperty('mediaAPIURL') ? options.mediaAPIURL : 'https://svc.zesty.io')
    this.logErrors = (options.hasOwnProperty('logErrors') ? options.logErrors : false)
    this.logResponses = (options.hasOwnProperty('logResponses') ? options.logResponses : false)
    
    this.instanceZUID = instanceZUID
    this.token = token
    this.makeInstancesAPIURL()
  }

  logError(msg) {
    // Don't log null messages
    if (this.logErrors && msg !== null) {
      console.log(msg)
    }
  }

  logResponse(msg) {
    if (this.logResponses) {
      console.log(msg)
    }
  }

  makeInstancesAPIURL() {
    this.instancesAPIURL = this.replaceInURL(
      this.instancesAPIURL,
      { INSTANCE_ZUID:this.instanceZUID }
    )
  }

  buildAPIURL(uri, api = 'instances') {
    switch(api) {
      case 'accounts':
        return `${this.accountsAPIURL}${uri}`
      case 'instances':
        return `${this.instancesAPIURL}${uri}`
      case 'media':
        return `${this.mediaAPIURL}${uri}`
      default:
        return ''
    }
  }

  replaceInURL(url, replacementObject) {
    for (const key in replacementObject) {
      url = url.replace(key, replacementObject[key])
    }

    return url
  }

  async getSiteId() {
    if (this.siteId) {
      return this.siteId;
    }

    const instanceData = await this.getInstance()
    this.siteId = instanceData.data.ID

    return this.siteId
  }

  async getModels() {
    const modelsURL =  this.buildAPIURL(this.instancesAPIEndpoints.modelsGETAll)
    
    return await this.getRequest(modelsURL)
  }

  async getModel(modelZUID) {
    const modelURL = this.buildAPIURL(
      this.replaceInURL(
        this.instancesAPIEndpoints.modelsGET,
        { MODEL_ZUID: modelZUID }
      )
    )

    return await this.getRequest(modelURL)
  }

  async getFields(modelZUID) {
    const fieldsURL = this.buildAPIURL(
      this.replaceInURL(
        this.instancesAPIEndpoints.fieldsGETAll,
        { MODEL_ZUID: modelZUID }
      )
    )

    return await this.getRequest(fieldsURL)
  }

  async getField(modelZUID, fieldZUID) {
    const fieldURL = this.buildAPIURL(
      this.replaceInURL(
        this.instancesAPIEndpoints.fieldGET,
        {
          MODEL_ZUID: modelZUID,
          FIELD_ZUID: fieldZUID
        }
      )
    )

    return await this.getRequest(fieldURL)
  }

  async getItem(modelZUID, itemZUID) {
    const itemURL = this.buildAPIURL(
      this.replaceInURL(
        this.instancesAPIEndpoints.itemsGET,
        { 
          MODEL_ZUID: modelZUID,
          ITEM_ZUID: itemZUID
        }
      )
    )

    return await this.getRequest(itemURL)
  }

  async saveItem(modelZUID, itemZUID, item) {
    const itemURL = this.buildAPIURL(
      this.replaceInURL(
        this.instancesAPIEndpoints.itemsPUT,
        {
          MODEL_ZUID: modelZUID,
          ITEM_ZUID: itemZUID
        }
      )
    )

    return await this.putRequest(itemURL, item)
  }

  async createItem(modelZUID, item) {
    const itemURL = this.buildAPIURL(
      this.replaceInURL(
        this.instancesAPIEndpoints.itemsPOST,
        {
          MODEL_ZUID: modelZUID
        }
      )
    )

    return await this.postRequest(itemURL, item)
  }

  async getItemPublishings(modelZUID, itemZUID) {
    const itemPublishingsURL = this.buildAPIURL(
      this.replaceInURL(
        this.instancesAPIEndpoints.itemsGETPublishings,
        {
          MODEL_ZUID: modelZUID,
          ITEM_ZUID: itemZUID
        }
      )
    )

    return await this.getRequest(itemPublishingsURL)
  }

  async getItemPublishing(modelZUID, itemZUID, publishingZUID) {
    const itemPublishingURL = this.buildAPIURL(
      this.replaceInURL(
        this.instancesAPIEndpoints.itemsGETPublishing,
        {
          MODEL_ZUID: modelZUID,
          ITEM_ZUID: itemZUID,
          PUBLISHING_ZUID: publishingZUID
        }
      )
    )

    return await this.getRequest(itemPublishingURL)
  }

  async getItems(modelZUID) {
    const itemsURL = this.buildAPIURL(
      this.replaceInURL(
        this.instancesAPIEndpoints.itemsGETAll,
        { MODEL_ZUID: modelZUID }
      )
    )

    return await this.getRequest(itemsURL)
  }

  async getItemVersions(modelZUID, itemZUID) {
    const itemVersionsURL = this.buildAPIURL(
      this.replaceInURL(
        this.instancesAPIEndpoints.itemsGETVersions,
        { 
          MODEL_ZUID: modelZUID,
          ITEM_ZUID: itemZUID
        }
      )
    )

    return await this.getRequest(itemVersionsURL)
  }

  async getItemVersion(modelZUID, itemZUID, versionNumber) {
    const itemVersionURL = this.buildAPIURL(
      this.replaceInURL(
        this.instancesAPIEndpoints.itemsGETVersion,
        {
          MODEL_ZUID: modelZUID,
          ITEM_ZUID: itemZUID,
          VERSION_NUMBER: versionNumber
        }
      )
    )

    return await this.getRequest(itemVersionURL)
  }

  async getViews() {
    return await this.getRequest(this.buildAPIURL(this.instancesAPIEndpoints.viewsGETAll))
  }

  async getView(viewZUID) {
    const viewGetURL = this.replaceInURL(
      this.buildAPIURL(
        this.replaceInURL(
          this.instancesAPIEndpoints.viewsGET,
          { VIEW_ZUID: viewZUID }
        )
      )
    )

    return await this.getRequest(viewGetURL)
  }

  async getViewVersions(viewZUID) {
    const viewGetURL = this.replaceInURL(
      this.buildAPIURL(
        this.replaceInURL(
          this.instancesAPIEndpoints.viewsGETVersions,
          { VIEW_ZUID: viewZUID }
        )
      )
    )

    return await this.getRequest(viewGetURL)
  }

  async getViewVersion(viewZUID, versionNumber) {
    const viewGetVersionURL = this.replaceInURL(
      this.buildAPIURL(
        this.replaceInURL(
          this.instancesAPIEndpoints.viewsGETVersion,
          { 
            VIEW_ZUID: viewZUID,
            VERSION_NUMBER: versionNumber
          }
        )
      )
    )

    return await this.getRequest(viewGetVersionURL)
  }

  async saveView(viewZUID, payload) {
    const viewPutURL = this.replaceInURL(
      this.buildAPIURL(this.instancesAPIEndpoints.viewsPUT),
      { VIEW_ZUID: viewZUID }
    )

    return await this.putRequest(viewPutURL, payload)
  }

  async saveAndPublishView(viewZUID, payload) {
    const viewPutPublishURL = this.replaceInURL(
      this.buildAPIURL(this.instancesAPIEndpoints.viewsPUTPublish),
      { VIEW_ZUID: viewZUID }
    )

    return await this.putRequest(viewPutPublishURL, payload)
  }

  async createView(payload) {
    return await this.postRequest(this.buildAPIURL(this.instancesAPIEndpoints.viewsPOST), payload)
  }

  async getScripts() {
    return await this.getRequest(this.buildAPIURL(this.instancesAPIEndpoints.scriptsGETAll))
  }

  async getScript(scriptZUID) {
    const scriptURL = this.replaceInURL(
      this.buildAPIURL(this.instancesAPIEndpoints.scriptsGET),
      { SCRIPT_ZUID: scriptZUID }
    )

    return await this.getRequest(scriptURL)
  }

  async getScript(scriptZUID) {
    const scriptURL = this.replaceInURL(
      this.buildAPIURL(this.instancesAPIEndpoints.scriptsGET),
      { SCRIPT_ZUID: scriptZUID }
    )

    return await this.getRequest(scriptURL)
  }

  async getScriptVersions(scriptZUID) {
    const scriptVersionsURL = this.replaceInURL(
      this.buildAPIURL(this.instancesAPIEndpoints.scriptsGETVersions),
      { SCRIPT_ZUID: scriptZUID }
    )

    return await this.getRequest(scriptVersionsURL)
  }

  async getScriptVersion(scriptZUID, versionNumber) {
    const scriptVersionURL = this.replaceInURL(
      this.buildAPIURL(this.instancesAPIEndpoints.scriptsGETVersion),
      { 
        SCRIPT_ZUID: scriptZUID,
        VERSION_NUMBER: versionNumber
      }
    )

    return await this.getRequest(scriptVersionURL)
  }  

  async saveScript(scriptZUID, payload) {
    const scriptPutURL = this.replaceInURL(
      this.buildAPIURL(this.instancesAPIEndpoints.scriptsPUT),
      { SCRIPT_ZUID: scriptZUID }
    )

    return await this.putRequest(scriptPutURL, payload)
  }

  async createScript(payload) {
    return await this.postRequest(this.buildAPIURL(this.instancesAPIEndpoints.scriptsPOST), payload)
  }

  async getStylesheets() {
    return await this.getRequest(this.buildAPIURL(this.instancesAPIEndpoints.stylesheetsGETAll))
  }

  async getStylesheet(stylesheetZUID) {
    const stylesheetURL = this.replaceInURL(
      this.buildAPIURL(this.instancesAPIEndpoints.stylesheetsGET),
      { STYLESHEET_ZUID: stylesheetZUID }
    )

    return await this.getRequest(stylesheetURL)
  }

  async getStylesheetVersions(stylesheetZUID) {
    const stylesheetVersionsURL = this.replaceInURL(
      this.buildAPIURL(this.instancesAPIEndpoints.stylesheetsGETVersions),
      { STYLESHEET_ZUID: stylesheetZUID }
    )

    return await this.getRequest(stylesheetVersionsURL)
  }

  async getStylesheetVersion(stylesheetZUID, versionNumber) {
    const stylesheetVersionURL = this.replaceInURL(
      this.buildAPIURL(this.instancesAPIEndpoints.stylesheetsGETVersion),
      { 
        STYLESHEET_ZUID: stylesheetZUID,
        VERSION_NUMBER: versionNumber
      }
    )

    return await this.getRequest(stylesheetVersionURL)
  }

  async saveStylesheet(stylesheetZUID, payload) {
    const stylesheetPutURL = this.replaceInURL(
      this.buildAPIURL(this.instancesAPIEndpoints.stylesheetsPUT),
      { STYLESHEET_ZUID: stylesheetZUID }
    )

    return await this.putRequest(stylesheetPutURL, payload)
  }

  async createStylesheet(payload) {
    return await this.postRequest(this.buildAPIURL(this.instancesAPIEndpoints.stylesheetsPOST), payload)
  }

  async getInstance() {
    const instanceGETURL = this.replaceInURL(
      this.buildAPIURL(this.accountsAPIEndpoints.instanceGET, 'accounts'),
      { INSTANCE_ZUID: this.instanceZUID }
    )

    return await this.getRequest(instanceGETURL)
  }
  
  async getSiteHead() {
    const siteHeadGetURL = this.buildAPIURL(this.instancesAPIEndpoints.siteHeadGET)
    return await this.getRequest(siteHeadGetURL)
  }

  async getNav() {
    const navGetURL = this.buildAPIURL(this.instancesAPIEndpoints.navGET)
    return await this.getRequest(navGetURL)
  }

  async search(searchTerm) {
    const searchURL = this.replaceInURL(
      this.buildAPIURL(this.instancesAPIEndpoints.searchGET), 
      { SEARCH_TERM: searchTerm }
    )

    return await this.getRequest(searchURL)
  }

  async getInstanceUsers() {
    const instanceUsersAPIURL = this.replaceInURL(
      this.buildAPIURL(this.accountsAPIEndpoints.instanceUsersGET, 'accounts'),
      { INSTANCE_ZUID: this.instanceZUID }
    )

    return await this.getRequest(instanceUsersAPIURL)
  }

  async getSettings() {
    return await this.getRequest(this.buildAPIURL(this.instancesAPIEndpoints.settingsGETAll))
  }

  async getSetting(settingsId) {
    const settingURL = this.replaceInURL(
      this.buildAPIURL(this.instancesAPIEndpoints.settingsGET),
      { SETTINGS_ID: settingsId }
    )

    return await this.getRequest(settingURL)
  }

  async createHeadTag(tag) {
    const headTagURL = this.buildAPIURL(this.instancesAPIEndpoints.headTagsPOST)

    return await this.postRequest(headTagURL, tag)
  }

  async saveHeadTag(headTagZUID, tag) {
    const headTagURL = this.replaceInURL(
      this.buildAPIURL(this.instancesAPIEndpoints.headTagsPUT),
      { HEADTAG_ZUID: headTagZUID }
    )

    return await this.putRequest(headTagURL, tag)
  }

  async getHeadTags() {
    const headTagURL = this.buildAPIURL(this.instancesAPIEndpoints.headTagsGETAll)

    return await this.getRequest(headTagURL)
  }

  async getHeadTag(headTagZUID) {
    const headTagURL = this.replaceInURL(
      this.buildAPIURL(this.instancesAPIEndpoints.headTagsGET),
      { HEADTAG_ZUID: headTagZUID }
    )

    return this.getRequest(headTagURL)
  }

  async deleteHeadTag(headTagZUID) {
    const headTagURL = this.replaceInURL(
      this.buildAPIURL(this.instancesAPIEndpoints.headTagsDELETE),
      { HEADTAG_ZUID: headTagZUID }
    )

    return this.deleteRequest(headTagURL)
  }

  async getAuditTrailEntries() {
    const auditURL = this.buildAPIURL(this.instancesAPIEndpoints.auditsGETAll)
    return await this.getRequest(auditURL)
  }

  async getAuditTrailEntry(auditTrailEntryZUID) {
    const auditURL = this.replaceInURL(
      this.buildAPIURL(this.instancesAPIEndpoints.auditsGET),
      { AUDIT_ZUID: auditTrailEntryZUID }
    )

    return await this.getRequest(auditURL)
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

    let requestParams = ''

    for (const paramName in searchParams) {
      requestParams = `${requestParams}${paramName}=${searchParams[paramName]}&`
    }

    if (requestParams.endsWith('&')) {
      requestParams = requestParams.substring(0, requestParams.length -1)
    }
    
    const auditURL = this.replaceInURL(
      this.buildAPIURL(this.instancesAPIEndpoints.auditsGETParams),
      { AUDIT_SEARCH_PARAMS: requestParams }
    )

    return await this.getRequest(auditURL)
  }

  // Media API functions
  async getMediaBins() {
    const siteId = await this.getSiteId()
    const mediaBinsAPIURL = this.replaceInURL(
      this.buildAPIURL(this.mediaAPIEndpoints.binsGETAll, 'media'),
      { SITE_ID: siteId }
    )

    return await this.getRequest(mediaBinsAPIURL)
  }

  async getMediaBin(mediaBinId) {
    const mediaBinAPIURL = this.replaceInURL(
      this.buildAPIURL(this.mediaAPIEndpoints.binsGET, 'media'),
      { BIN_ID: mediaBinId }
    )  

    return await this.getRequest(mediaBinAPIURL)
  }

  // payload: name
  async updateMediaBin(mediaBinId, payload) {
    const mediaBinAPIURL = this.replaceInURL(
      this.buildAPIURL(this.mediaAPIEndpoints.binsPATCH, 'media'),
      { BIN_ID: mediaBinId }
    )  

    return await this.formPatchRequest(mediaBinAPIURL, payload)
  }

  async getMediaFiles(mediaBinId) {
    const mediaBinAPIURL = this.replaceInURL(
      this.buildAPIURL(this.mediaAPIEndpoints.filesGETAll, 'media'),
      { BIN_ID: mediaBinId }
    )      

    return await this.getRequest(mediaBinAPIURL)
  }

  async getMediaFile(fileId) {
    const mediaBinAPIURL = this.replaceInURL(
      this.buildAPIURL(this.mediaAPIEndpoints.filesGET, 'media'),
      { FILE_ID: fileId }
    )

    return await this.getRequest(mediaBinAPIURL)
  }

  async createMediaFile(binId, groupId, fileName, title, contentType, stream) {
    let bin = await this.getMediaBin(binId)
    bin = bin.data[0]

    const mediaUploadURL = this.replaceInURL(
      this.buildAPIURL(this.mediaAPIEndpoints.filesPOST, 'media'),
      {
        STORAGE_DRIVER: bin.storage_driver,
        STORAGE_NAME: bin.storage_name
      }
    )

    return await this.formPostRequest(mediaUploadURL, {
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
    })
  }

  // payload: filename, title, group_id
  async updateMediaFile(fileId, payload) {
    const mediaBinAPIURL = this.replaceInURL(
      this.buildAPIURL(this.mediaAPIEndpoints.filesPATCH, 'media'),
      { FILE_ID: fileId }
    )

    return await this.formPatchRequest(mediaBinAPIURL, payload)
  }

  async deleteMediaFile(fileId) {
    const mediaBinAPIURL = this.replaceInURL(
      this.buildAPIURL(this.mediaAPIEndpoints.filesDELETE, 'media'),
      { FILE_ID: fileId }
    )

    return await this.deleteRequest(mediaBinAPIURL)
  }

  async getMediaGroups(mediaBinId) {
    const mediaBinAPIURL = this.replaceInURL(
      this.buildAPIURL(this.mediaAPIEndpoints.groupsGETAll, 'media'),
      { BIN_ID: mediaBinId }
    )      

    return await this.getRequest(mediaBinAPIURL)
  }

  async getMediaGroup(groupId) {
    const mediaBinAPIURL = this.replaceInURL(
      this.buildAPIURL(this.mediaAPIEndpoints.groupsGET, 'media'),
      { GROUP_ID: groupId }
    )      

    return await this.getRequest(mediaBinAPIURL)
  }

  // payload: bin_id, group_id, name
  async createMediaGroup(payload) {
    const mediaBinAPIURL = this.buildAPIURL(this.mediaAPIEndpoints.groupsPOST, 'media')

    return await this.formPostRequest(
      mediaBinAPIURL, 
      payload
    )
  }

  // payload: group_id, name
  async updateMediaGroup(groupId, payload) {
    const mediaBinAPIURL = this.replaceInURL(
      this.buildAPIURL(this.mediaAPIEndpoints.groupsPATCH, 'media'),
      { GROUP_ID: groupId }
    )

    return await this.formPatchRequest(
      mediaBinAPIURL,
      payload
    )
  }

  async deleteMediaGroup(groupId) {
    const mediaBinAPIURL = this.replaceInURL(
      this.buildAPIURL(this.mediaAPIEndpoints.groupsDELETE, 'media'),
      { GROUP_ID: groupId }
    )

    return await this.deleteRequest(mediaBinAPIURL)
  }

  async getRequest(url) {
    const $this = this
    return new Promise((resolve, reject) => {
      request.get(url, {
        auth: {
          bearer: $this.token
        }
      }, (error, response, body) => {
        body = JSON.parse(body)
        this.logResponse(response)

        if (!error && response.statusCode === 200) {
          resolve(body)
        } else {
          this.logError(error)
          reject({
            reason: $this.defaultAccessError
          })
        }
      })
    })
  }

  async deleteRequest(url) {
    const $this = this
    return new Promise((resolve, reject) => {
      request.delete(url, {
        auth: {
          bearer: $this.token
        }
      }, (error, response, body) => {
        body = JSON.parse(body)
        this.logResponse(response)

        if (!error && response.statusCode === 200) {
          resolve(body)
        } else {
          this.logError(error)
          reject({
            reason: $this.defaultAccessError
          })
        }
      })
    })
  }  

  async putRequest(url, payload) {
    const $this = this
      return new Promise((resolve, reject) => {
      request.put({
        url: url,
        body: JSON.stringify(payload),
        auth: {
          bearer: $this.token
        }
      }, (error, response, body) => {
        body = JSON.parse(body)
        this.logResponse(response)
        
        if (!error && response.statusCode === 200) {
          resolve(body)
        } else {
          this.logError(error)
          reject({
            reason: $this.defaultAccessError
          })
        }
      })
    })
  }

  async postRequest(url, payload) {
    const $this = this
    return new Promise((resolve, reject) => {
      request.post({
        url : url,
        body: JSON.stringify(payload),
        auth: {
          bearer: $this.token
        }
      }, (error, response, body) => {
        this.logResponse(response)
        body = JSON.parse(body)

        if (!error && response.statusCode === 201) {
          resolve(body)
        } else {
          this.logError(error)
          reject({
            reason: $this.defaultAccessError
          })
        }
      })
    })
  }

  async formPostRequest(url, payload) {
    const $this = this
    return new Promise((resolve, reject) => {
      request.post({
        url : url,
        auth: {
          bearer: $this.token
        },
        formData: payload
      }, (error, response, body) => {
        this.logResponse(response)
        body = JSON.parse(body)

        if (!error && response.statusCode === 201) {
          resolve(body)
        } else {
          this.logError(error)
          reject({
            reason: $this.defaultAccessError
          })
        }
      })
    })
  }

  async formPatchRequest(url, payload) {
    const $this = this
    return new Promise((resolve, reject) => {
      request.patch({
        url : url,
        auth: {
          bearer: $this.token
        },
        formData: payload
      }, (error, response, body) => {
        this.logResponse(response)
        body = JSON.parse(body)

        if (!error && response.statusCode === 200) {
          resolve(body)
        } else {
          this.logError(error)
          reject({
            reason: $this.defaultAccessError
          })
        }
      })
    })
  }
}

module.exports = ZestyioAPIWrapper