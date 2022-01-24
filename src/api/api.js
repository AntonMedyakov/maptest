import axios from 'axios';

export default {
  get() {
    return axios.get('/NUTS_RG_03M_2021_4326.geojson');
  },
};
