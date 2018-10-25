const request = require('request').defaults({ strictSSL: false })

class ZestyioAPIWrapper {
  constructor(instanceZUID, token, options = {}) {
    this.defaultAccessError = 'Request Failed'
  
    this.instancesAPIEndpoints = {
      modelsGETAll: '/content/models',
      itemsGETAll: '/content/models/MODEL_ZUID/items',
      itemsPOST: '/content/models/MODEL_ZUID/items',
      itemsGET: '/content/models/MODEL_ZUID/items/ITEM_ZUID',
      itemsPUT: '/content/models/MODEL_ZUID/items/ITEM_ZUID',
      viewsGETAll: '/web/views',
      viewsGET: '/web/views/VIEW_ZUID',
      viewsPOST: '/web/views',
      viewsPUT: '/web/views/VIEW_ZUID',
      viewsPUTPUBLISH: '/web/views/VIEW_ZUID?publish=true',
      stylesheetsGETAll: '/web/stylesheets',
      stylesheetsPOST: '/web/stylesheets',
      stylesheetsPUT: '/web/stylesheets/STYLESHEET_ZUID',
      scriptsGETAll: '/web/scripts',
      scriptsPOST: '/web/scripts',
      scriptsPUT: '/web/scripts/SCRIPT_ZUID'
    }
  
    this.accountsAPIEndpoints = {
      instanceGET: '/instances/INSTANCE_ZUID',
      instanceUsersGET: '/instances/INSTANCE_ZUID/users/roles'
    }
  
    this.mediaAPIEndpoints = {
      binsPOST: '/media-manager-service/bin',
      binsGETAll: '/media-manager-service/site/SITE_ID/bins', // DONE
      binsGET: '/media-manager-service/bin/BIN_ID', // DONE
      // Update bin
      // Delete bin - probably not for now...
      filesPOST: '/media-storage-service/upload/gcp/SOME_ID', // TODO replace SOME_ID, remove gcp hard coding?
      filesGET: '/media-manager-service/file/FILE_ID', // DONE
      filesGETAll: '/media-manager-service/bin/BIN_ID/files', // DONE
      filesDELETE: '/media-manager-service/file/FILE_ID', // DONE
      // Update file
      groupsGET: '/media-manager-service/group/GROUP_ID', // DONE
      groupsGETAll: '/media-manager-service/bin/BIN_ID/groups', // DONE
      groupsPOST: '/media-manager-service/group', // DONE
      groupsPATCH: '/media-manager-service/group/GROUP_ID',
      groupsDELETE: '/media-manager-service/group/GROUP_ID' // DONE
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

  logError(msg) { // probably static
    // Don't log null messages
    if (this.logErrors && msg !== null) {
      console.log(msg)
    }
  }

  logResponse(msg) { // probably static
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

  async getItems(modelZUID) {
    const itemsURL = this.buildAPIURL(
      this.replaceInURL(
        this.instancesAPIEndpoints.itemsGETAll,
        { MODEL_ZUID:modelZUID }
      )
    )
    return await this.getRequest(itemsURL)
  }

  async getViews() {
    return await this.getRequest(this.buildAPIURL(this.instancesAPIEndpoints.viewsGETAll))
  }

  async saveView(viewZUID, payload) {
    const viewPutURL = this.replaceInURL(
      this.buildAPIURL(this.instancesAPIEndpoints.viewsPUT),
      { VIEW_ZUID: viewZUID }
    )
    return await this.putRequest(viewPutURL, payload)
  }

  async createView(payload) {
    return await this.postRequest(this.buildAPIURL(this.instancesAPIEndpoints.viewsPOST), payload)
  }

  async getScripts() {
    return await this.getRequest(this.buildAPIURL(this.instancesAPIEndpoints.scriptsGETAll))
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

  async getInstanceUsers(){
    const instanceUsersAPIURL = this.replaceInURL(
      this.buildAPIURL(this.accountsAPIEndpoints.instanceUsersGET, 'accounts'),
      { INSTANCE_ZUID: this.instanceZUID }
    )
    return await this.getRequest(instanceUsersAPIURL)
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
        this.logError(error)
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
        this.logError(error)
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
        this.logError(error)
        
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
        this.logError(error)
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
        this.logError(error)
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
}

module.exports = ZestyioAPIWrapper