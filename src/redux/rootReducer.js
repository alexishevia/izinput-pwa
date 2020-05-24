import { combineReducers } from 'redux';
import gdrive from './gdrive/reducer';
import transactions from './transactions/reducer';
import errors from './errors/reducer';

export default combineReducers({
  gdrive,
  transactions,
  errors,
});
