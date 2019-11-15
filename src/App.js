import React from 'react';
import { Helmet } from "react-helmet";
import { createStore } from 'redux'
import { connect, Provider } from 'react-redux';
import './App.css';
import Icon from './components/icons.js';
import IconsPanel from './components/iconsPanel.js';
import ResultArea from './components/resultArea.js';
import SourceArea from './components/sourceArea.js';
import ActionsContainer from './components/actionsContainer.js'
import { copyClipboard } from './functions/copyClipboard.js';

import {
  editSource,
  editResult,
  updateLineCounters,

  addAction,
  toggleAction,
  toggleAllActions,
  editAction,
  deleteAction,
  deleteAllActions
} from './actions';

import reducers from './reducers'

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

  let newState = Object.assign({}, state);
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

    let state = getResult(this.props);
    this.dispatch = this.props.dispatch;
    this.dispatch(editResult(state.result))
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

    this.dispatch(updateLineCounters(sourceRows, resultRows, sourceScroll, resultScroll))
  }

  onChange(data) {
    let {source, result} = data;
    if(source) {
      this.dispatch(editSource(source===true ? "" : source))
    }
    else if(result) {
      this.dispatch(editResult(result===true ? "" : result))
    }
    else {
      this.dispatch(editAction(data))
    }
    if(!result)this.updateResult();

// fake timeout to render textarea
    setTimeout(() =>this.renderCounters(), 0);
  }
  addAction(){
    this.dispatch(addAction());

  }
  deleteAction(id){
    this.dispatch(deleteAction(id));
    this.updateResult();
  }
  deleteAllActions(){
    this.dispatch(deleteAllActions());
    this.updateResult();
  }
  actionToggle(id){
    this.dispatch(toggleAction(id));
    this.updateResult();
  }
  toggleAllActions(){
    this.dispatch(toggleAllActions());
    this.updateResult();
  }
  updateResult(){
    let newState = getResult(this.props);
    this.dispatch(editResult(newState.updatePanels.result))
  }
  scrollAreas(e){
    let sourceArea = document.querySelector('.source-area_container');
    let resultArea = document.querySelector('.result-area_container');
    sourceArea.scrollTop = e.target.scrollTop;
    resultArea.scrollTop = e.target.scrollTop;
  }


  render(){
    let {actionsActive, updateActions, updatePanels} = this.props;
    let {source, result} = updatePanels;
    console.log('App source, result', source, result)
    console.log('App render props:', this.props)
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
          actions = {updateActions.actions}
          actionsActive = {actionsActive}
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
          rows = {updatePanels.resultRows}
          scroll = {updatePanels.sourceScroll}
          scrollAreas={e => this.scrollAreas(e)}
          onChange={(...e) => {this.onChange(...e)}}
        />
        <ResultArea
          key = 'ResultArea'
          value={result}
          rows = {updatePanels.resultRows}
          scroll = {updatePanels.resultScroll}

          scrollAreas={e => this.scrollAreas(e)}
          onChange={(...e) => {this.onChange(...e)}}
        />
      </div>
      </React.Fragment>
    );
  }
}
const mapStateToProps = (state) => {
  return {
    updatePanels: state.updatePanels,
    updateActions: state.updateActions,
    actionsActive: state.actionsActive
  }
}
const Wrapp = connect(mapStateToProps)(App);

function WrappedApp(){
  return(
    <Provider store={store}>
      <Wrapp />
    </Provider>
  )

};

export default WrappedApp;
