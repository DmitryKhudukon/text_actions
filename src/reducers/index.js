import { combineReducers } from 'redux'
import updatePanels from './updatePanels'
import updateActions from './updateActions'

const reducers = combineReducers({
  updatePanels,
  updateActions
})

export default reducers
