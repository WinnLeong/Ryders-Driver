import { JOB_STATUS } from '../actions/type';

const INITIAL_STATE = {
  job_status: 'Online'
};

export default (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case JOB_STATUS:
      return { ...state, job_status: action.payload };
    default:
      return state;
  }
};
