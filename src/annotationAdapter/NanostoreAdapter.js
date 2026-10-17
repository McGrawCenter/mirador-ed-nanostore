/** */
export default class NanostoreAdapter {
  /** */
  constructor(annotationPageId, endpoint, options = {}) {
    this.annotationPageId = annotationPageId;
    this.endpoint = endpoint;
  }

  /**
   * Get the storage adapter user
   * @returns {*}
   */
  getStorageAdapterUser() {
    return this.creatorName;
  }
  
  getMiradorStore() {
    const store = this._getMiradorStore?.() ?? null;

    if (!store) {
      console.warn('NanostoreAdapter: Mirador store is not available yet.');
      return null;
    }

  return store;
  }
  
  getManifestId() {
    var store = this.getMiradorStore();
    var state = store.getState();
    if(!state) { return false; }
    for(var i in state.windows) { 
      console.log(this.annotationPageId, state.windows[i].canvasId);
      if(state.windows[i].canvasId == this.annotationPageId) { return state.windows[i].manifestId; }
    }
    return "";
  }
  
  annotationRewrite(annotation) {
    annotation['@context'] = ["http://www.w3.org/ns/anno.jsonld",
	    {
               "lti": "https://purl.imsglobal.org/spec/lti/claim/",
               "institution": {
                  "@id": "lti:tool_platform",
                  "@type": "@id",
                  "id": "@id"
               },
               "course": {
                  "@id": "lti:context",
                  "@type": "@id",
                  "id": "@id"
               },
               "assignment": {
                  "@id": "lti:resource_link",
                  "@type": "@id",
                  "id": "@id"
               }
            }];
            annotation['type'] = "Annotation";
            annotation['created'] = Date.parse(annotation.creationDate);
            annotation['creator'] = "Jules Verne";
            annotation['institution'] = this.institution;
            annotation['course'] = this.course;
            annotation['assignment'] = this.assignment;
            if(annotation.target.includes("#xywh=")) {
               var parts = annotation.target.split("#xywh=");
               var newtarget = {
                  "source": parts[0],
        "selector": {
            "type": "FragmentSelector",
            "conformsTo": "http://www.w3.org/TR/media-frags/",
            "value": "xywh="+parts[1]+""
        },
        "partOf": {
            "id": this.getManifestId(),
            "type": "Manifest"
        }}
        annotation.target = newtarget;
        return annotation;
    }
  }
  

  /** */
  async create(annotation) {

    //delete annotation.maeData;
    annotation = this.annotationRewrite(annotation);
    return fetch(`${this.endpoint}/create`, {
      body: JSON.stringify(annotation),
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      method: 'POST',
    })
    .then((data) => {
       return this.all();
    })
    .catch((error) => {
      console.error('Failed to fetch annotations from RERUM endpoint:', error);
      // Return a safe fallback structure instead of looping infinitely
      return {
        id: this.annotationPageId,
        type: 'AnnotationPage',
        items: []
      };
    });

  }

  /** */
  async update(annotation) {
    const annotationPage = await this.all();
    if (annotationPage) {
      const currentIndex = annotationPage.items.findIndex((item) => item.id === annotation.id);
      if (currentIndex !== -1) {
        annotationPage.items.splice(currentIndex, 1, annotation);
      }
      localStorage.setItem(this.annotationPageId, JSON.stringify(annotationPage));
      console.log('UPDATE ANNOTATION', annotationPage);
      return annotationPage;
    }
    return null;
  }

  /** */
  async delete(annoId) {
    const annotationPage = await this.all();
    if (annotationPage) {
      annotationPage.items = annotationPage.items.filter((item) => item.id !== annoId);
      localStorage.setItem(this.annotationPageId, JSON.stringify(annotationPage));
    }
    return annotationPage;
  }

  /** */
  async get(annoId) {
    const annotationPage = await this.all();
    if (annotationPage) {
      return annotationPage.items.find((item) => item.id === annoId);
    }
    return null;
  }

  /** */
  async all() {

    if (!this.endpoint) {
      console.warn('NanostoreAdapter: No endpoint provided, returning empty annotation page.');
      return {
        id: this.annotationPageId,
        type: 'AnnotationPage',
        items: []
      };
    }

    // Added 'return' so the async function actually passes the promise back
    return fetch(`${this.endpoint}/query`, {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      method: 'POST',
      body: JSON.stringify({ "target.source": this.annotationPageId })
    })
    .then(response => {

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      var returnVal = {
        id: this.annotationPageId,
        type: 'AnnotationPage',
        items: Array.isArray(data) ? data : []
      }
      console.log(returnVal);
      return returnVal;
    
    })
    .catch((error) => {
      console.error('Failed to fetch annotations from RERUM endpoint:', error);
      // Return a safe fallback structure instead of looping infinitely
      return {
        id: this.annotationPageId,
        type: 'AnnotationPage',
        items: []
      };
    });
  }
}

export const ANONYMOUS_USER = 'Anonymous';
