/** */
export default class NanostoreAdapter {
  /** */
  constructor(annotationPageId, endpoint) {
    this.annotationPageId = annotationPageId;
    this.endpoint = endpoint;
  }


  getStorageAdapterUser() {
    return this.creatorName;
  }

  /** */
  async create(annotation) {
  
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
      body: JSON.stringify({ "type": "Annotation", "target.source": this.annotationPageId })
    })
    .then(response => {

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      return {
        id: this.annotationPageId,
        type: 'AnnotationPage',
        items: Array.isArray(data) ? data : []
      };
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
