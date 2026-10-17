/** */
export default class LocalStorageAdapter {
  /** */
  constructor(annotationPageId, creatorName, options = {}) {
    console.log("LOCALSTORAGE ADAPTER");
    this.annotationPageId = annotationPageId;
    this.creatorName = creatorName;
    
    // Store the educational metadata context
    this.institution = options.institution || null;
    this.course = options.course || null;
    this.project = options.project || null;
  }

  /**
   * Get the storage adapter user
   * @returns {*}
   */
  getStorageAdapterUser() {
    return this.user;
  }

  /** */
  async create(annotation) {
    const emptyAnnoPage = {
      id: this.annotationPageId,
      items: [],
      type: 'AnnotationPage',
    };
    const annotationPage = await this.all() || emptyAnnoPage;

    annotation.creator = this.user;
    annotation.created = new Date().toISOString();
    if(this.institution) { annotation.institution = this.institution; }
    if(this.course) { annotation.institution = this.institution; }
    if(this.project) { annotation.institution = this.institution; }
    
    console.log("user details: ",this.user, this.options);

    annotationPage.items.push(annotation);
    localStorage.setItem(this.annotationPageId, JSON.stringify(annotationPage));
    console.log('CREATE ANNOTATION', annotationPage);
    return annotationPage;
  }

  /** */
  async update(annotation) {
    const annotationPage = await this.all();
    if (annotationPage) {
      const currentIndex = annotationPage.items.findIndex((item) => item.id === annotation.id);
      annotationPage.items.splice(currentIndex, 1, annotation);
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
    }
    localStorage.setItem(this.annotationPageId, JSON.stringify(annotationPage));
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
    console.log(JSON.parse(localStorage.getItem(this.annotationPageId)));
    return JSON.parse(localStorage.getItem(this.annotationPageId));
  }
}

export const ANONYMOUS_USER = 'Anonymous';
