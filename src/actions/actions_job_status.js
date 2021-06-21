import { JOB_STATUS } from './type';

export const setJobStatus = jobStatus => {
  return dispatch => {
    if (jobStatus === 'Online') {
      dispatch({
        type: JOB_STATUS,
        payload: 'Offline'
      });
    } else {
      dispatch({
        type: JOB_STATUS,
        payload: 'Online'
      });
    }
  };
};
