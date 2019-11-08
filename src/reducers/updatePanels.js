import {
  EDIT_SOURCE,
  EDIT_RESULT,
  UPDATE_LINE_COUNTERS
} from '../constants/panels.js';

let source  = localStorage.getItem('source')
  ? JSON.parse(localStorage.getItem('source')).replace(/\\n/gi, '\n').replace(/\\t/gi, '\t').replace(/\\r/gi, '\r').replace(/\\f/gi, '\f').replace(/\\0/gi, '\0')
  : "";

const initialSource = {source, sourceRows: 1}
const initialResult = {result: '', resultRows: 1}
const setLocalStorage = (source, actions) => {
  console.log('setLocalStorage', source, actions)
  if (source) localStorage.setItem('source', JSON.stringify(source));
  if (actions) localStorage.setItem('actions', JSON.stringify(actions));
};

export default function updatePanels (state = {...initialSource, ...initialResult}, regexAction){
//function updatePanels (state = {...initialSource, ...initialResult}, regexAction){
  console.log('updatePanels = state => ', state)
  console.log('updatePanels = regexAction => ', regexAction)
  const {source, result, sourceRows, resultRows} = state;
  const {type, ...data} = regexAction;
  let newState = Object.assign({}, state),
      newActions;

  switch (type) {
    case UPDATE_LINE_COUNTERS:
      newState = {
        source: newState.source,
        actions: newState.actions,
        actionsActive: newState.actionsActive,
        result: newState.result,
        ...data
      }
      setLocalStorage(newState.source, newState.actions);
      return newState;

    case EDIT_SOURCE:
      newState.source = data.source;
      setLocalStorage(newState.source, newState.actions);
      return newState;

    case EDIT_RESULT:
      newState.result = data.result;
      return newState;

    default:
      return state;
  }
}
