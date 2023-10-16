const axios = require('axios');
import { environment } from '../src/environments/environment';

let instance = axios.create({baseURL: environment.basePath});

const ApiWorker = {
  async GetBusinessPitchModelByAlias(alias) {
    instance = axios.create({
      baseURL: environment.basePath,
    });
    return await instance.get(`search/alias/${alias}`)
      .then(res => {
        return res;
      }).catch(err => {
        console.log(err.toString());
      })
  },

  async HasPreviewChanged(businessId) {
    instance = axios.create({
      baseURL: environment.basePath,
    })
    return await instance.get(`business/${businessId}/preview-changed`)
      .then(res => {
        console.log(`The card ${res.data ? 'has' : 'hasn\'t'} been updated recently.`);
        return res.data;
      }).catch(err => {
        console.log(err.toString());
      })
  },

  async SetPreviewChanged(businessId) {
    instance = axios.create({
      baseURL: environment.basePath,
    })
    return await instance.post(`business/${businessId}/preview-changed`)
      .then(res => {
        return res.data;
      }).catch(err => {
        console.log(err.toString());
      })
  },

  async GetBusinessReviewsData(businessId) {
    instance = axios.create({
      baseURL: environment.basePath,
    });
    return await instance.get(`customer-analytics/${businessId}/reviews?limit=3&offset=0`)
      .then(res => {
        return res.data;
      }).catch(err => {
        console.log(err.toString());
      });
  }
}

export default ApiWorker;
