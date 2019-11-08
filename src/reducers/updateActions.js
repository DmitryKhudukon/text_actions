import {
  ADD_ACTION,
  TOGGLE_ACTION,
  TOGGLE_ALL_ACTIONS,
  EDIT_ACTION,
  DELETE_ACTION,
  DELETE_ALL_ACTIONS
} from '../constants/actions.js';

const blankAction = [
  {
    id: 0,
    functionName: 'replace',
    find: '',
    replace: '',
    active: true,
    flags: 'gi',
    count: 0
  }
];
const setLocalStorage = (source, actions) => {
  console.log('setLocalStorage', source, actions)
  if (source) localStorage.setItem('source', JSON.stringify(source));
  if (actions) localStorage.setItem('actions', JSON.stringify(actions));
};

const initialAction = {actions: JSON.parse(localStorage.getItem('actions')) || blankAction, actionsActive:true};

export default function updateActions(state = initialAction, regexAction){
  console.log("updateActions = state => ", state)
  console.log("updateActions = regexAction => ", regexAction)
  const { actions, actionsActive } = state;

  const { type, ...data } = regexAction;
  let newState = Object.assign({}, state),
      newActions;


  switch (type) {
    case ADD_ACTION:
      newState = {
        actionsActive,
        actions:[
          ...actions,
        {
          id: actions.reduce((maxId, action) => Math.max(action.id, maxId), -1) + 1,
          functionName: 'replace',
          find:"",
          replace: "",
          active: true,
          flags: 'gi',
          count: 0
        }
      ]};
      setLocalStorage(newState.actions);
      return newState;

      case TOGGLE_ACTION:
        newState.actions[regexAction.id].active = !newState.actions[regexAction.id].active;
        setLocalStorage(false, newState.actions);
        return newState;

      case TOGGLE_ALL_ACTIONS:
        newState.actionsActive = !newState.actionsActive;
        localStorage.setItem(false, newState.actions);
        return newState;

      case EDIT_ACTION:
        newActions = actions.map(action =>
          action.id === regexAction.id ?
            { ...action, ...data } :
            action
        );
        newState.actions = newActions;
        setLocalStorage(false, newState.actions);
        return newState;

      case DELETE_ACTION:
        let i=-1;
        newActions = actions.filter(action =>
          action.id !== regexAction.id
        ).map(r => {i++; let {id, ...q} = r; return {id: i, ...q}})
        newState.actions= newActions;
        setLocalStorage(newState.actions);
        return newState;

      case DELETE_ALL_ACTIONS:
        newState.actions = blankAction;
        setLocalStorage(newState.actions);
        return newState;

      default:
        return state;
  }
}
