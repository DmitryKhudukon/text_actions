import React from 'react';
import { Helmet } from "react-helmet";
import { createStore } from 'redux'
import './App.css';
import Icon from './components/icons.js';
import IconsPanel from './components/iconsPanel.js';
import ResultArea from './components/resultArea.js';
import SourceArea from './components/sourceArea.js';
import ActionsContainer from './components/actionsContainer.js'
import { copyClipboard } from './functions/copyClipboard.js';

import {
  EDIT_SOURCE,
  EDIT_RESULT,
  UPDATE_LINE_COUNTERS,

  ADD_ACTION,
  TOGGLE_ACTION,
  TOGGLE_ALL_ACTIONS,
  EDIT_ACTION,
  DELETE_ACTION,
  DELETE_ALL_ACTIONS
} from './constants';

import reducers from './reducers'

// ACTIONS START
const addAction = () => ({ type: ADD_ACTION })
const toggleAction = id => ({ type: TOGGLE_ACTION, id })
// ACTIONS END

const store = createStore(reducers)
const next = store.dispatch;
store.dispatch = function dispatchAndLog(action) {
  console.log('dispatching', action)
  let result = next(action)
  console.log('next state', store.getState())
  return result
};

let getResult = (state) => {
    console.log('getResult = state => ', state)
  let newState = state;
  let source = state.updatePanels.source;
  let newResult = source;
  let id = 0;
  if(state.updateActions.actionsActive){
    state.updateActions.actions.forEach(action => {
      let count = 0;
      if (action.find && action.active){
        let a = true;
        try { new RegExp(action.find) } catch(e) { a = false };
        if(a){
          newResult = newResult.replace(new RegExp(action.find, action.flags), action.replace.replace(/\\n/gi, '\n').replace(/\\t/gi, '\t').replace(/\\r/gi, '\r').replace(/\\f/gi, '\f').replace(/\\0/gi, '\0'));
          state.updatePanels.source.replace(new RegExp(action.find, action.flags), () => {count++});
        }
      }
      newState.updateActions.actions[id].count = count;
      id++;
    })
  }

  newState.updatePanels.result=newResult;
  return newState;
};

class App extends React.Component {
  constructor(props){
    super(props);
    this.state={};
    let state = getResult(store.getState());
    store.dispatch({ type: EDIT_RESULT, result: state.result})
  }
  componentDidMount(){
    setTimeout(() => this.renderCounters(), 0);
  }
  renderCounters(){
    let sourceArea = document.querySelector('.source-area');
    let resultArea = document.querySelector('.result-area');
    let sourceParent = sourceArea.parentNode.clientHeight;
    let resultParent = resultArea.parentNode.clientHeight;
    sourceArea.style.height='1px';
    resultArea.style.height='1px';

    let sourceRows = Math.round(sourceArea.scrollHeight/20);
    let resultRows = Math.round(resultArea.scrollHeight/20);
    sourceArea.style.height= Math.max(sourceArea.scrollHeight + 20, sourceParent) + 'px';
    resultArea.style.height= Math.max(resultArea.scrollHeight + 20, resultParent) + 'px';

    let sourceScroll = sourceArea.scrollHeight>sourceParent ? true : false;
    let resultScroll = resultArea.scrollHeight>resultParent ? true : false;

    store.dispatch({ type: UPDATE_LINE_COUNTERS, sourceRows, resultRows, sourceScroll, resultScroll })
    this.setState({});
  }
  onChange(data) {
    let {source, result} = data;
    if(source) {
      store.dispatch({ type: EDIT_SOURCE, source: source===true ? "" : source })
    }
    else if(result) {
      store.dispatch({ type: EDIT_RESULT, result: result===true ? "" : result })
    }
    else {
      store.dispatch({ type: EDIT_ACTION, ...data })
    }
    if(!result)this.updateResult();

// fake timeout to render textarea
    setTimeout(() =>this.renderCounters(), 0);
  }
  addAction(){
    store.dispatch({ type: ADD_ACTION });
    this.setState({})
  }
  deleteAction(id){
    store.dispatch({ type: DELETE_ACTION, id: id});
    this.updateResult();
  }
  deleteAllActions(){
    store.dispatch({ type: DELETE_ALL_ACTIONS});
    this.updateResult();
  }
  actionToggle(id){
    store.dispatch({ type: TOGGLE_ACTION, id: id});
    this.updateResult();
  }
  toggleAllActions(){
    store.dispatch({ type: TOGGLE_ALL_ACTIONS });
    this.updateResult();
  }
  updateResult(){
    let state = store.getState();
    let newState = getResult(state);
    let result = newState.updatePanels.result;
    store.dispatch({ type: EDIT_RESULT, result })
    this.setState({});
  }
  scrollAreas(e){
    let sourceArea = document.querySelector('.source-area_container');
    let resultArea = document.querySelector('.result-area_container');
    sourceArea.scrollTop = e.target.scrollTop;
    resultArea.scrollTop = e.target.scrollTop;
  }


  render(){
    let {updatePanels} = store.getState();
    let {source, result} = updatePanels;
    console.log('App source, result', source, result)
    return (
      <React.Fragment>
      <div className="App">
        <Helmet>
          <meta charSet="utf-8" />
          <title>Text Actions</title>
          <link rel="canonical" href="http://textactions.com" />
        </Helmet>
        <IconsPanel />
        <ActionsContainer
          actions = {store.getState().updateActions.actions}
          actionsActive = {store.getState().actionsActive}
          addAction = {() => this.addAction()}
          actionToggle = {e=> this.actionToggle(e)}
          deleteAction = {e=> this.deleteAction(e)}
          onChange={(...e) => {this.onChange(...e)}}
          deleteAllActions = {() => this.deleteAllActions()}
          toggleAllActions = {() =>this.toggleAllActions()}
        />
        <SourceArea
          key = 'SourceArea'
          value={source}
          rows = {store.getState().updatePanels.resultRows}
          scroll = {store.getState().updatePanels.sourceScroll}
          scrollAreas={e => this.scrollAreas(e)}
          onChange={(...e) => {this.onChange(...e)}}
        />
        <ResultArea
          key = 'ResultArea'
          value={result}
          rows = {store.getState().updatePanels.resultRows}
          scroll = {store.getState().updatePanels.resultScroll}

          scrollAreas={e => this.scrollAreas(e)}
          onChange={(...e) => {this.onChange(...e)}}
        />
      </div>
      </React.Fragment>
    );
  }
}

export default App;
