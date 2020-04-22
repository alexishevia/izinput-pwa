import { combineReducers } from 'redux';
import gdrive from './gdrive/reducer';
import errors from './errors/reducer';

export default combineReducers({
  gdrive,
  errors,
});
