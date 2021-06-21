import axios from 'axios';
import qs from 'qs';
import { ROOT_URL } from '../Credentials';

export const getOrder = () => {
  return dispatch => {
    axios
      .get(`${ROOT_URL}getOrder`)
      .then(response => {
        console.log('getOrder: ' + JSON.stringify(response.data));
      })
      .catch(error => {
        console.log('getOrder error: ' + error);
      });
  };
};

export const driverAcccept = OrderID => {
  return dispatch => {
    let data = {
      OrderID
    };

    let params = qs.stringify(data);

    console.log('driverAcceptParams: ' + JSON.stringify(params));

    axios
      .get(`${ROOT_URL}`)
      .then(response => {
        console.log('driverAccept: ' + JSON.stringify(response.data));
      })
      .catch(error => {
        console.log('driverAccept error: ' + error);
      });
  };
};
