import { combineReducers } from 'redux';
import loginReducer from './reducer_login';
import registerReducer from './reducer_register';
import settingsReducer from './reducer_settings';
import notificationReducer from './reducer_notifications';
import historyReducer from './reducer_history';
import profileReducer from './reducer_profile';
import coordinateReducer from './reducer_coordinates';
import jobStatusReducer from './reducer_job_status';

export default combineReducers({
  loginReducer,
  registerReducer,
  settingsReducer,
  notificationReducer,
  historyReducer,
  profileReducer,
  coordinateReducer,
  jobStatusReducer
});
