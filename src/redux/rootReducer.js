import { combineReducers } from 'redux'
import pagesReducer from './pages/pagesReducer';
import currentFileReducer from './currentFile/currentFileReducer';

const rootReducer = combineReducers({
    pages: pagesReducer,
    currentFile: currentFileReducer
})

export default rootReducer