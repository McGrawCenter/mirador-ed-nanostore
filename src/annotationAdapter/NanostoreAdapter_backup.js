/** */
export default class NanostoreAdapter {


  constructor(annotationPageId, endpoint, userData) {
    this.annotationPageId = annotationPageId;
    this.endpoint = endpoint;
    this.userData = userData;
    console.log(endpoint,userData);
  }


  async get() {
    console.log("entering the get");
    const annotations = await this.all();
    console.log("GETTING THE NEW");
    if (annotations) {
       return {
	   id: this.annotationPageId,
	   type: 'AnnotationPage',
	   items: annotations
	   };
    }
    return null;
  }
 
  getStorageAdapterUser() {
    return this.userData;
  }

  async create(annotation) {
    delete annotation.maeData;
    annotation['type'] = "Annotation";
    annotation['created'] = Date.parse(annotation.creationDate);
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
            "id": "https://figgy.princeton.edu/concern/scanned_resources/b592d95a-6c86-47ee-bec4-643e1f0cb1eb/manifest",
            "type": "Manifest"
        }}
        annotation.target = newtarget;
    }
    
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
    .catch(() => this.all());
  }
  
  
  
  async update(annotation) {
    const annotationPage = await this.all();
    if (annotationPage) {
      const currentIndex = annotationPage.items.findIndex((item) => item.id === annotation.id);
      annotationPage.items.splice(currentIndex, 1, annotation);
      return fetch(`${this.endpoint}/update`, {
        body: JSON.stringify(annotationPage),
          headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        method: 'PUT',
      }).catch(() => this.all());

    }
    return null;
  }
  


  async remove(annoId) {
    console.log('delete annotation');
    return fetch(`${this.endpoint}/delete`, {
      body: JSON.stringify(annotation),
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      method: 'POST',
      body: JSON.stringify("id",annoId)
    }).catch(() => this.all());
  }
  
  
  
  /** */
  async all() {
    return fetch(`${this.endpoint}/query`, {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      method: 'POST',
      body: JSON.stringify({ "type": "Annotation","target.source": this.annotationPageId })
    }).then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    }).then(data => {
	return {
	   id: this.annotationPageId,
	   type: 'AnnotationPage',
	   items: data
	   };
    })
    .catch(() => this.all()); 
  }

}
