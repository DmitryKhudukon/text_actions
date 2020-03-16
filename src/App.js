import React from 'react';
import { createStore } from 'redux'
import './App.css';
import Logo from './assets/logo.js'
import IntroIllustration from './assets/intro_illustration.js';
import Icon from './components/icon.js';

const initialSource = {source: JSON.parse(localStorage.getItem('source')).replace(/\\n/gi, '\n').replace(/\\t/gi, '\t').replace(/\\r/gi, '\r').replace(/\\f/gi, '\f').replace(/\\0/gi, '\0') || '', sourceRows: 1}
const initialResult = {result: '', resultRows: 1}
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
const UPDATE_LINE_COUNTERS = 'UPDATE_LINE_COUNTERS';
const ADD_ACTION = 'ADD_ACTION';
const TOGGLE_ACTION = 'TOGGLE_ACTION';
const TOGGLE_ALL_ACTIONS = 'TOGGLE_ALL_ACTIONS';
const EDIT_ACTION = 'EDIT_ACTION';
const EDIT_SOURCE = 'EDIT_SOURCE';
const DELETE_ACTION = 'DELETE_ACTION';
const DELETE_ALL_ACTIONS = 'DELETE_ALL_ACTIONS';
const EDIT_RESULT = 'EDIT_RESULT';

const initialAction = {actions: JSON.parse(localStorage.getItem('actions')) || blankAction, actionsActive:true};
let store = createStore(updateStates);
const next = store.dispatch;
store.dispatch = function dispatchAndLog(action) {
  let result = next(action)
  return result
};

let getResult = (state) => {
  let newState = state;
  let newResult = state.source;
  let id = 0;
  if(state.actionsActive){
    state.actions.forEach(action => {
      let count = 0;
      if (action.find && action.active){
        let a = true;
        try { new RegExp(action.find) } catch(e) { a = false };
        if(a){
          newResult = newResult.replace(new RegExp(action.find, action.flags), action.replace.replace(/\\n/gi, '\n').replace(/\\t/gi, '\t').replace(/\\r/gi, '\r').replace(/\\f/gi, '\f').replace(/\\0/gi, '\0'));
          state.source.replace(new RegExp(action.find, action.flags), () => {count++});
        }
      }
      newState.actions[id].count = count;
      id++;
    })
  }

  newState.result=newResult;
  return newState;
};
const setLocalStorage = (source, actions) => {
  localStorage.setItem('source', JSON.stringify(source));
  localStorage.setItem('actions', JSON.stringify(actions));
};

function updateStates (state = {...initialSource, ...initialAction, ...initialResult}, regexAction) {
const {source, actions, actionsActive, result, sourceRows, resultRows} = state;
const {type, ...data} = regexAction;
let newState = state,
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

    case ADD_ACTION:
      newState = {
        source, sourceRows, resultRows, actionsActive,
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
      ], result};
      setLocalStorage(newState.source, newState.actions);
      return newState;

    case TOGGLE_ACTION:
      newState.actions[regexAction.id].active = !newState.actions[regexAction.id].active;
      newState = getResult(newState);
      setLocalStorage(newState.source, newState.actions);
      return newState;

    case TOGGLE_ALL_ACTIONS:
      newState.actionsActive = !newState.actionsActive;
      newState = getResult(newState)
      setLocalStorage(newState.source, newState.actions);
      return newState;

    case EDIT_ACTION:
      newActions = actions.map(action =>
        action.id === regexAction.id ?
          { ...action, ...data } :
          action
      );
      newState.actions = newActions;
      newState = getResult(newState)
      setLocalStorage(newState.source, newState.actions);
      return newState;

    case EDIT_SOURCE:
      newState.source = data.source;
      newState = getResult(newState);
      setLocalStorage(newState.source, newState.actions);
      return newState;

    case DELETE_ACTION:
      let i=-1;
      newActions = actions.filter(action =>
        action.id !== regexAction.id
      ).map(r => {i++; let {id, ...q} = r; return {id: i, ...q}})
      newState.actions= newActions;
      newState = getResult(newState);
      setLocalStorage(newState.source, newState.actions);
      return newState;

    case DELETE_ALL_ACTIONS:
      newState.actions = blankAction;
      newState = getResult(newState);
      setLocalStorage(newState.source, newState.actions);
      return newState;

    case EDIT_RESULT:
      newState.result = data.result;
      return newState;

    default:
      return state;
  }
}

class App extends React.Component {
  constructor(props){
    super(props);
    this.state={};
    let state = getResult(store.getState());
    store.dispatch({ type: EDIT_RESULT, result: state.result})
    this.aboutVisible = localStorage.getItem('skip_intro') === 'true' ? false : true;
    this.about = localStorage.getItem('skip_intro') === 'true' ? '' :  <AboutIntro onClick={() => this.aboutPageToggler()} />
  }
  aboutPageToggler(){
    localStorage.setItem('skip_intro', true);
    this.aboutVisible =!this.aboutVisible;
    this.about = this.aboutVisible ? <AboutIntro onClick={() => this.aboutPageToggler()} /> : "";
    this.setState({})
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
      store.dispatch({ type: EDIT_RESULT, result: store.getState().result})
    }
    else if(result) {
      store.dispatch({ type: EDIT_RESULT, result: result===true ? "" : result })
    }
    else {
      store.dispatch({ type: EDIT_ACTION, ...data })
    }
    this.setState({});
// fake timeout to render textarea
    setTimeout(() =>this.renderCounters(), 0);
  }
  deleteAction(id){
    store.dispatch({ type: DELETE_ACTION, id: id});
    this.setState({})
  }
  deleteAllActions(){
    store.dispatch({ type: DELETE_ALL_ACTIONS});
    this.setState({})
  }
  actionToggle(id){
      store.dispatch({ type: TOGGLE_ACTION, id: id});
      this.setState({})
  }
  toggleAllActions(){
    store.dispatch({ type: TOGGLE_ALL_ACTIONS });
    this.setState({})
  }
  scrollAreas(e){
    let sourceArea = document.querySelector('.source-area_container');
    let resultArea = document.querySelector('.result-area_container');
    sourceArea.scrollTop = e.target.scrollTop;
    resultArea.scrollTop = e.target.scrollTop;
  }

  render(){
    let {source, result} = store.getState();
    return (
      <React.Fragment>
      <div className="App">
      {this.about}
        <LeftPanel onClick={() => this.aboutPageToggler()} />
        <ActionsContainer
          actionToggle = {e=> this.actionToggle(e)}
          deleteAction = {e=> this.deleteAction(e)}
          onChange={(...e) => {this.onChange(...e)}}
          deleteAllActions = {() => this.deleteAllActions()}
          toggleAllActions = {() =>this.toggleAllActions()}
        />
        <SourceArea
          key = 'SourceArea'
          value={source}
          scrollAreas={e => this.scrollAreas(e)}
          onChange={(...e) => {this.onChange(...e)}}
        />
        <ResultArea
          key = 'ResultArea'
          value={result}
          scrollAreas={e => this.scrollAreas(e)}
          onChange={(...e) => {this.onChange(...e)}}
        />
      </div>
      </React.Fragment>
    );
  }
}

class ActionsContainer extends React.Component {
  constructor(props){
    super(props);
    this.state = {};
  }
  addAction(){
    store.dispatch({ type: ADD_ACTION});
    this.setState({})
  }
  render(){
    let actions = []
    store.getState().actions.forEach(action => {
      actions.push(
        <ActionUnit
          key = {action.id}
          id = {action.id}
          count = {action.count}
          find = {action.find}
          replace = {action.replace}
          active = {action.active}
          flags = {action.flags}
          onChange={(...e) => {this.props.onChange(...e)}}
          delete = {this.props.deleteAction}
          actionToggle = {this.props.actionToggle}
        />
      )
    });
    return(
      <div className='actions-container'>
        <div className='actions-container_header'>
          <h4>Actions:</h4>
        </div>
        <div className="actions-units">
          {actions}
        </div>
        <div className='actions-buttons'>
          <button
            onClick={() => this.addAction()}
          >
            <Icon name='plus' size="16" fill='#ADADAD'/>
          </button>
        </div>
        <div style={{backgroundColor:'#D5D5D5', width:'calc(100%-28px)', height:'1px', zIndex:10, margin:'1px 14px 0 14px'}}></div>
        <textarea className='clipboard' />
      </div>
    )
  }
}
class ActionUnit extends React.Component {
  onChange(id, key, e){
    if(key !=='flags'){
      e.target.style.height='1px';
      e.target.style.height= e.target.scrollHeight + 'px';
    } else {
      if (e.target.value.match(/[^gmisuy]/) || e.target.value.match(/(g.*g|m.*m|i.*i|s.*s|u.*u|y.*y)/)) return
    }
    this.props.onChange({
      id: id,
      [key]: e.target.value
    })
  }

  render(){
    let action = store.getState().actions[this.props.id];
    let {id, count, find, replace, active, flags} = action;
    return(
      <div className='action-unit_replace'>
        <div className='action-unit_replace_header'>
          <h5>Replace</h5>
          <div className='action-unit_replace_header_counter'>{'(' + count + ')'}</div>
          <input
            type='text'
            value={flags}
            size={flags.length || 6 }
            placeholder = 'Flags…'
            onChange={e => this.onChange(id, 'flags', e)}
          />
          {
            flags!== ""
            ? <Icon name='flag-solid' size="10" fill='#ADADAD'/>
            : <Icon name='flag-regular' size="10" fill='#D0D0D0'/>
          }
          <button
            className='action-unit_toggle-button'
            onClick = {() => this.props.actionToggle(id)}
          >
            {
              active
              ? <Icon name='toggle-on' size="12" fill='#6FBB6E'/>
              : <Icon name='toggle-off' size="12" fill='#919191'/>
            }
          </button>
          <button
            className='action-unit_delete-button'
            onClick = {() => this.props.delete(id)}
          >
            <Icon name='times' size="12" fill='#ADADAD'/>
          </button>
        </div>
        <div className="find-textarea_wrapper">
          <textarea
            className='find-input'
            data-cy={"find-input-" + id}
            value = {find}
            placeholder = 'Find RegExp…'
            onChange={e => this.onChange(id, 'find', e)}
          />
        </div>
        <div className="find-textarea_wrapper">
          <textarea
            className='replace-input'
            data-cy={"replace-input-" + id}
            value = {replace}
            placeholder = 'Replace with…'
            onChange={e => this.onChange(id, 'replace', e)}
          />
        </div>
      </div>
    )
  }
}

const copyClipboard = (targetClass) => {
  const value = document.querySelector(targetClass).value;
  if (window.clipboardData && window.clipboardData.setData) {
// IE specific code path to prevent textarea being shown while dialog is visible.
    return window.clipboardData.setData("Text", value);
  }
  else if (document.queryCommandSupported && document.queryCommandSupported("copy")) {
    var textarea = document.createElement("textarea");
    textarea.textContent = value;
    textarea.style.position = "fixed";  // Prevent scrolling to bottom of page in MS Edge.
    document.body.appendChild(textarea);
    textarea.select();
    try {
        return document.execCommand("copy"); // Security exception may be thrown by some browsers.
    } catch (ex) {
        console.warn("Copy to clipboard failed.", ex);
        return false;
    } finally {
        document.body.removeChild(textarea);
    }
  }
}

class SourceArea extends React.Component {
  constructor(props){
    super(props);
    this.state={};
    this.rendered = false;
  }
  updateClearButtonPosition(scroll){
    const scrollAreaContainer = document.querySelector('.source-area_container');
    const right = scrollAreaContainer.getBoundingClientRect().right;
    this.clearButtonIndent = scroll ? right - 49 - 14 : right - 34 - 14;
    return (this.clearButtonIndent)
  }
  componentDidMount(){
    this.rendered=true;
  }
  renderRows(sourceRows){
    let rows=[];
    for (let i=1; i<Math.max(2, sourceRows); i++){
      rows.push(<div key={i}>{i}</div>)
    }
    rows = (
      <React.Fragment>
        <div key='source' style={{backgroundColor:'#DDC2C2', color:'#fff', padding: '1px 3px',fontSize:'9px', lineHeight:'14px', textAlign:'center',position:'sticky', top:'0'}}>
          <b>Source:</b>
        </div>
        <div
          key='rows'
          style={{backgroundColor:'#F2F2F2', borderBottom:'1px solid #ddd', padding: '0 9px'}}
        >
          {rows}
        </div>
      </React.Fragment>
    )
    return rows;
  }

  render(){
    const sourceRows = store.getState().sourceRows;
    const rows = this.renderRows(sourceRows);
    const scroll = store.getState().sourceScroll;
    let indent = this.rendered ? this.updateClearButtonPosition(scroll) : 0;
    return (
      <div
        className='source-area_container'
        onScroll = {(e) => {this.props.scrollAreas(e)}}
        key = 'source-area_container'
      >
        <div className = 'source-area_line-counter' key='source-area_line-counter'>
          {rows}
        </div>
        <div
          className = 'clear-source-button'
          style={{ left: indent}}
        >
          <div
            onClick={ () => { copyClipboard('.source-area') } }
          >
            <Icon
              name='copy-regular'
              size='14'
            />
          </div>
          <div
            onClick = {() => {this.props.onChange({source: true})}}
          >
            <Icon
              name='times-circle-regular'
              size='14'
            />
          </div>
        </div>
        <textarea
          wrap = 'off'
          className="source-area"
          key="source-area"
          value={this.props.value}
          onChange = {e => {this.props.onChange({source: e.target.value || true})}}
          data-cy="source-textfield"
        />
      </div>
    )
  }
}

class ResultArea extends React.Component {
  constructor(props){
    super(props);
    this.state={};
    this.rendered = false;
  }
  updateClearButtonPosition(scroll){
    const scrollAreaContainer = document.querySelector('.result-area_container');
    const right = scrollAreaContainer.getBoundingClientRect().right;
    this.clearButtonIndent = scroll ? right - 49 - 14 : right - 34 - 14;
    return this.clearButtonIndent;
  }
  componentDidMount(){
    this.rendered=true;
  }

  renderRows(resultRows){
    let rows = [];
    for (let i=1; i<Math.max(2, resultRows); i++){
      rows.push(<div key={i}>{i}</div>)
    }

    rows = (
      <React.Fragment>
        <div key='result' style={{backgroundColor:'#B7D9B7', color:'#fff', padding: '1px 3px', fontSize:'9px', lineHeight:'14px', textAlign:'center', position:'sticky', top:'0'}}>
          <b>Result:</b>
        </div>
        <div style={{backgroundColor:'#F2F2F2', borderBottom:'1px solid #ddd', padding: '0 9px'}}>{rows}</div>
      </React.Fragment>
    )
    return rows;
  }
  render(){
    const resultRows = store.getState().resultRows;
    let rows = this.renderRows(resultRows);
    const scroll = store.getState().resultScroll;
    let indent = this.rendered ? this.updateClearButtonPosition(scroll) : 0;
    return (
      <div
        className='result-area_container'
        onScroll = {(e) => {this.props.scrollAreas(e)}}
      >
        <div className = 'result-area_line-counter'>
          {rows}
        </div>
        <div
          className = 'clear-result-button'
          style={{ left: indent}}
        >
          <div
            onClick={
              () => { copyClipboard('.result-area') }
            }
          >
            <Icon
              name='copy-regular'
              size='14'
            />
          </div>
          <div
            onClick = {() => {this.props.onChange({result: true})}}
          >
          <Icon
            name='times-circle-regular'
            size='14'
          />
          </div>
        </div>
        <textarea
          wrap = 'off'
          className="result-area"
          value={this.props.value}
          data-cy="result-textfield"
          onChange = {e => {this.props.onChange({result: e.target.value || true})}}
        />
      </div>
    )
  }
}
function AboutIntro(props){
  return(
    <React.Fragment>
      <div
        id='about_intro_mask'
        onClick = {()=> props.onClick()}
      />
        <div id='about_intro_container'>
          <div id='about_intro_header'>
            <Logo />
            <span>(beta)</span>
            <button
              id='about_intro_close-button'
              onClick = {()=> props.onClick()}
            >
              <Icon
                name='times'
                size='18'
                fill='#fff'
              />
            </button>
          </div>
          <div id='about_intro_content'>
            <IntroIllustration />
            <h1>
              <b>Text Actions</b> — is open source experimental text editor, based on
              {' '}<a
                href='https://en.wikipedia.org/wiki/Regular_expression'
                target='_blank'
                rel='noopener noreferrer'
              >
                regular expressions
              </a>{' '}
               <b>text transformations</b> without text formatting.
            </h1>
            <div id='about_intro_footer'>
              <div>Author:
                <a
                  target='_blank'
                  rel='noopener noreferrer'
                  href = 'https://twitter.com/dmitrykhudukon'
                >
                  Dmitry Khudukon</a>
              </div>
              <div>Github:
                <a
                  href = 'https://github.com/DmitryKhudukon/ta'
                  target='_blank'
                  rel='noopener noreferrer'
                >
                  TextActions repository
                </a>
              </div>
            </div>
          </div>
        </div>
    </React.Fragment>
  )
}
class LeftPanel extends React.Component {
  constructor(props){
    super(props);
    this.state = {};
}
  render(){
    return (
      <div className='left-column'>
        {this.about}
        <header>
          <h1 className='logo'><Logo /></h1>
        </header>
        <div className='settings-icons'>
          <button
            id='about_button'
            onClick = {()=> this.props.onClick()}
          >
            <Icon name='question-circle' size="18" fill='#fff' style={{margin:'15px 10px 0 10px'}}/>
          </button>
          <a
            href = 'https://github.com/DmitryKhudukon/ta'
            target='_blank'
            rel='noopener noreferrer'
          >
            <Icon name='github' size="18" fill='#fff' style={{margin:'15px 10px 0 10px'}}/>
          </a>
          <a
            href = 'https://twitter.com/dmitrykhudukon'
            target='_blank'
            rel='noopener noreferrer'
          >
            <Icon name='twitter' size="18" fill='#fff' style={{margin:'15px 10px 15px 10px'}}/>
          </a>
        </div>
      </div>
    )
  }
}

export default App;
