import { createStore } from 'redux'
import { devToolsEnhancer } from 'redux-devtools-extension/developmentOnly'

import rootReducer from './rootReducer'

const store = createStore(
    rootReducer,
    devToolsEnhancer()
);

export default store