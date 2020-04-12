import { combineReducers } from 'redux';
import gdrive from './gdrive/reducer';
import idb from './idb/reducer'

export default combineReducers({
  gdrive,
  idb,
});
