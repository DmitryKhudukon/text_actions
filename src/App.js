import React from 'react';
import { Helmet } from "react-helmet";
import { createStore } from 'redux'
import './App.css';
import Icon from './components/icons.js';
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
        <Helmet>
          <meta charSet="utf-8" />
          <title>Text Actions</title>
          <link rel="canonical" href="http://textactions.com" />
        </Helmet>
        <Icons onClick={() => this.aboutPageToggler()} />
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
      <React.Fragment>
      <div className='actions-container'>
        <div className='actions-container_header'>
          <h4>Actions:</h4>
          {/*
          <button
            onClick = {this.props.toggleAllActions}
          >
            {store.getState().actionsActive
              ? <Icon name='toggle-on' size="14" fill='#74B974' />
              : <Icon name='toggle-off' size="14" fill='#ADADAD' />
            }

          </button>
          <button
            onClick = {this.props.deleteAllActions}
          >
            <Icon name='times-circle-regular' size="14" fill='#ADADAD'/>
          </button>
          */}
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
          {/*
            <button className='button-icon'>
              <Icon name='times' size="16" fill='#ADADAD'/>
            </button>
          */}
        </div>

        <div style={{backgroundColor:'#D5D5D5', width:'calc(100%-28px)', height:'1px', zIndex:10, margin:'1px 14px 0 14px'}}></div>
        <textarea className='clipboard' />
      </div>

      </React.Fragment>
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
class Icons extends React.Component {
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

function Logo(){
  return(
    <svg xmlns="http://www.w3.org/2000/svg" width="169" height="25" viewBox="0 0 169 25">
      <defs>
        <clipPath id="clip-Logo">
          <rect width="169" height="25"/>
        </clipPath>
      </defs>
      <g id="Logo" clip-path="url(#clip-Logo)">
        <path id="Path_1" data-name="Path 1" d="M74.272-3.456a7.177,7.177,0,0,0,1.2-.112,2.924,2.924,0,0,0,.976-.3v-2.56l-2.3.192a3.541,3.541,0,0,0-1.472.384,1.034,1.034,0,0,0-.576.96,1.274,1.274,0,0,0,.5,1.04A2.715,2.715,0,0,0,74.272-3.456Zm-.256-12.576a13.138,13.138,0,0,1,3.152.352A7.05,7.05,0,0,1,79.6-14.608a4.837,4.837,0,0,1,1.552,1.824,5.839,5.839,0,0,1,.544,2.608v7.168a1.985,1.985,0,0,1-.464,1.36,4.622,4.622,0,0,1-1.1.912A11.434,11.434,0,0,1,74.272.512a13.376,13.376,0,0,1-3.056-.32,7.256,7.256,0,0,1-2.336-.96,4.406,4.406,0,0,1-1.5-1.632,4.832,4.832,0,0,1-.528-2.3A4.334,4.334,0,0,1,68.16-8.1a7.077,7.077,0,0,1,4.064-1.472l4.192-.448v-.224a1.372,1.372,0,0,0-.816-1.328,5.492,5.492,0,0,0-2.352-.4,10.883,10.883,0,0,0-2.368.256,12.584,12.584,0,0,0-2.08.64,2.217,2.217,0,0,1-.7-.88,2.783,2.783,0,0,1-.288-1.232,2.054,2.054,0,0,1,.4-1.328,3.1,3.1,0,0,1,1.232-.848,9.614,9.614,0,0,1,2.192-.512A19.029,19.029,0,0,1,74.016-16.032Zm19.776,4.288a4.5,4.5,0,0,0-1.52.256,3.522,3.522,0,0,0-1.248.752A3.674,3.674,0,0,0,90.176-9.5a4.307,4.307,0,0,0-.32,1.728A3.74,3.74,0,0,0,90.992-4.8a4.062,4.062,0,0,0,2.768.992,5.511,5.511,0,0,0,1.664-.224,10.223,10.223,0,0,0,1.248-.48,3.32,3.32,0,0,1,.96.976,2.393,2.393,0,0,1,.32,1.264A2.24,2.24,0,0,1,96.7-.24a6.947,6.947,0,0,1-3.456.72A10.639,10.639,0,0,1,89.6-.112a8.241,8.241,0,0,1-2.8-1.664,7.364,7.364,0,0,1-1.808-2.576,8.415,8.415,0,0,1-.64-3.328,9.214,9.214,0,0,1,.688-3.7,7.15,7.15,0,0,1,1.872-2.608,7.933,7.933,0,0,1,2.736-1.536,10.4,10.4,0,0,1,3.28-.512,6.383,6.383,0,0,1,3.552.832,2.492,2.492,0,0,1,1.248,2.144,2.335,2.335,0,0,1-.288,1.136,3.961,3.961,0,0,1-.672.912,10.4,10.4,0,0,0-1.312-.5A5.552,5.552,0,0,0,93.792-11.744Zm12.32,6.4a1.317,1.317,0,0,0,.528,1.184,2.669,2.669,0,0,0,1.488.352,6.425,6.425,0,0,0,.992-.08,5.577,5.577,0,0,0,.9-.208,3.912,3.912,0,0,1,.5.784,2.379,2.379,0,0,1,.208,1.04,2.474,2.474,0,0,1-.912,1.984,5.088,5.088,0,0,1-3.216.768A6.551,6.551,0,0,1,102.256-.8a5.154,5.154,0,0,1-1.52-4.16v-13.7q.352-.1,1.008-.208a8.269,8.269,0,0,1,1.392-.112,4.093,4.093,0,0,1,2.192.5,2.317,2.317,0,0,1,.784,2.1v2.048H110.3a5.477,5.477,0,0,1,.368.88,3.677,3.677,0,0,1,.176,1.168,2.22,2.22,0,0,1-.5,1.616,1.8,1.8,0,0,1-1.328.5h-2.912Zm7.232-14.528a2.812,2.812,0,0,1,.816-2.048,2.889,2.889,0,0,1,2.16-.832,2.889,2.889,0,0,1,2.16.832,2.812,2.812,0,0,1,.816,2.048,2.812,2.812,0,0,1-.816,2.048,2.889,2.889,0,0,1-2.16.832,2.889,2.889,0,0,1-2.16-.832A2.812,2.812,0,0,1,113.344-19.872Zm5.7,19.84q-.352.064-1.04.176a8.649,8.649,0,0,1-1.392.112,7.527,7.527,0,0,1-1.264-.1,2.153,2.153,0,0,1-.944-.384,1.847,1.847,0,0,1-.592-.784,3.4,3.4,0,0,1-.208-1.3V-15.328q.352-.064,1.04-.176a8.649,8.649,0,0,1,1.392-.112,7.527,7.527,0,0,1,1.264.1,2.153,2.153,0,0,1,.944.384,1.847,1.847,0,0,1,.592.784,3.4,3.4,0,0,1,.208,1.3Zm19.552-7.744a9.638,9.638,0,0,1-.608,3.536,7.167,7.167,0,0,1-1.712,2.608,7.281,7.281,0,0,1-2.64,1.6,10.2,10.2,0,0,1-3.424.544,9.689,9.689,0,0,1-3.424-.576,7.535,7.535,0,0,1-2.64-1.648,7.352,7.352,0,0,1-1.712-2.608,9.323,9.323,0,0,1-.608-3.456,9.231,9.231,0,0,1,.608-3.424,7.352,7.352,0,0,1,1.712-2.608,7.535,7.535,0,0,1,2.64-1.648,9.689,9.689,0,0,1,3.424-.576,9.453,9.453,0,0,1,3.424.592,7.728,7.728,0,0,1,2.64,1.664,7.352,7.352,0,0,1,1.712,2.608A9.14,9.14,0,0,1,138.592-7.776Zm-11.2,0a5.058,5.058,0,0,0,.752,2.992,2.44,2.44,0,0,0,2.1,1.04A2.348,2.348,0,0,0,132.3-4.8a5.244,5.244,0,0,0,.72-2.976,5.077,5.077,0,0,0-.736-2.96,2.4,2.4,0,0,0-2.08-1.04,2.4,2.4,0,0,0-2.08,1.04A5.077,5.077,0,0,0,127.392-7.776ZM151.1-9.856a1.784,1.784,0,0,0-.56-1.456,2.31,2.31,0,0,0-1.52-.464,5.07,5.07,0,0,0-1.264.16,3.187,3.187,0,0,0-1.072.48v11.1A7.418,7.418,0,0,1,145.68.16a10.3,10.3,0,0,1-1.424.1,7.527,7.527,0,0,1-1.264-.1,2.153,2.153,0,0,1-.944-.384,1.847,1.847,0,0,1-.592-.784,3.4,3.4,0,0,1-.208-1.3v-9.6a2.465,2.465,0,0,1,.368-1.408,3.883,3.883,0,0,1,1.008-.992,9.169,9.169,0,0,1,2.736-1.248,13.08,13.08,0,0,1,3.664-.48,8.634,8.634,0,0,1,5.568,1.584,5.353,5.353,0,0,1,1.952,4.4V-.032a7.418,7.418,0,0,1-1.008.192,10.3,10.3,0,0,1-1.424.1,7.527,7.527,0,0,1-1.264-.1,2.153,2.153,0,0,1-.944-.384,1.847,1.847,0,0,1-.592-.784,3.4,3.4,0,0,1-.208-1.3Zm21.92,5.216A4.5,4.5,0,0,1,171.2-.832,8.841,8.841,0,0,1,165.824.544a15.206,15.206,0,0,1-2.5-.192A7.143,7.143,0,0,1,161.36-.24a3.523,3.523,0,0,1-1.28-1.008,2.305,2.305,0,0,1-.464-1.44,2.458,2.458,0,0,1,.32-1.3,3.24,3.24,0,0,1,.768-.88,12.758,12.758,0,0,0,2.128.912,8.75,8.75,0,0,0,2.768.4,3.233,3.233,0,0,0,1.52-.288.863.863,0,0,0,.528-.768.8.8,0,0,0-.384-.7,3.558,3.558,0,0,0-1.28-.416l-.96-.192a8.986,8.986,0,0,1-4.144-1.712,4.167,4.167,0,0,1-1.36-3.344,4.483,4.483,0,0,1,.512-2.144,4.492,4.492,0,0,1,1.44-1.6,7.218,7.218,0,0,1,2.224-.992,10.914,10.914,0,0,1,2.864-.352,13.334,13.334,0,0,1,2.224.176,7.243,7.243,0,0,1,1.808.528,3.262,3.262,0,0,1,1.216.912,2.061,2.061,0,0,1,.448,1.328,2.729,2.729,0,0,1-.272,1.264,2.839,2.839,0,0,1-.688.88,3.924,3.924,0,0,0-.768-.336q-.512-.176-1.12-.32t-1.232-.24a7.527,7.527,0,0,0-1.136-.1,4.389,4.389,0,0,0-1.632.24.8.8,0,0,0-.576.752.677.677,0,0,0,.32.576,3.675,3.675,0,0,0,1.216.416l.992.224a9.443,9.443,0,0,1,4.368,1.936A4.2,4.2,0,0,1,173.024-4.64Z" transform="translate(-5.235 23.5)" fill="#e83039"/>
        <path id="Path_2" data-name="Path 2" d="M7.1-5.344A1.317,1.317,0,0,0,7.632-4.16a2.669,2.669,0,0,0,1.488.352,6.425,6.425,0,0,0,.992-.08,5.576,5.576,0,0,0,.9-.208,3.912,3.912,0,0,1,.5.784,2.379,2.379,0,0,1,.208,1.04A2.474,2.474,0,0,1,10.8-.288,5.088,5.088,0,0,1,7.584.48,6.551,6.551,0,0,1,3.248-.8a5.154,5.154,0,0,1-1.52-4.16v-13.7q.352-.1,1.008-.208a8.269,8.269,0,0,1,1.392-.112,4.093,4.093,0,0,1,2.192.5,2.317,2.317,0,0,1,.784,2.1v2.048H11.3a5.477,5.477,0,0,1,.368.88,3.677,3.677,0,0,1,.176,1.168,2.22,2.22,0,0,1-.5,1.616,1.8,1.8,0,0,1-1.328.5H7.1ZM22.5.512a11.221,11.221,0,0,1-3.5-.528A7.94,7.94,0,0,1,16.176-1.6a7.336,7.336,0,0,1-1.888-2.656A9.419,9.419,0,0,1,13.6-8a8.757,8.757,0,0,1,.688-3.632,7.177,7.177,0,0,1,1.808-2.5,7.227,7.227,0,0,1,2.56-1.44,9.542,9.542,0,0,1,2.944-.464,8.889,8.889,0,0,1,3.088.512,7.428,7.428,0,0,1,2.4,1.408,6.266,6.266,0,0,1,1.568,2.144,6.567,6.567,0,0,1,.56,2.72,2.183,2.183,0,0,1-.608,1.664,3.04,3.04,0,0,1-1.7.736l-7.9,1.184a2.658,2.658,0,0,0,1.44,1.584,5.648,5.648,0,0,0,2.5.528,8.93,8.93,0,0,0,2.48-.336,7.883,7.883,0,0,0,1.9-.784,2.679,2.679,0,0,1,.864.9,2.3,2.3,0,0,1,.352,1.216A2.284,2.284,0,0,1,27.2-.416,7.125,7.125,0,0,1,24.9.32,16.227,16.227,0,0,1,22.5.512Zm-.9-12.576a3.172,3.172,0,0,0-1.328.256,2.674,2.674,0,0,0-.912.656,2.724,2.724,0,0,0-.528.9,3.689,3.689,0,0,0-.208,1.008l5.472-.9a2.418,2.418,0,0,0-.7-1.28A2.357,2.357,0,0,0,21.6-12.064Zm9.216-.96a3.913,3.913,0,0,1,1.008-1.984,2.514,2.514,0,0,1,1.872-.768,2.376,2.376,0,0,1,1.632.512,10.185,10.185,0,0,1,1.28,1.44l2.048,2.688,3.424-4.64a5.33,5.33,0,0,1,2.784.624,1.9,1.9,0,0,1,1.024,1.68,2.37,2.37,0,0,1-.112.752,3.137,3.137,0,0,1-.336.688q-.224.352-.576.8l-.832,1.056L41.92-7.808l4.192,5.536a2.971,2.971,0,0,1-.96,1.92,2.807,2.807,0,0,1-1.92.7,2.839,2.839,0,0,1-1.936-.7A10.305,10.305,0,0,1,39.9-1.984L38.176-4.448,34.912.256q-.16,0-.352.016t-.32.016a3.927,3.927,0,0,1-2.48-.672,2.047,2.047,0,0,1-.848-1.664,2.522,2.522,0,0,1,.368-1.36,13.705,13.705,0,0,1,1.264-1.616L35.1-8Zm23.04,7.68a1.317,1.317,0,0,0,.528,1.184,2.669,2.669,0,0,0,1.488.352,6.425,6.425,0,0,0,.992-.08,5.576,5.576,0,0,0,.9-.208,3.912,3.912,0,0,1,.5.784,2.379,2.379,0,0,1,.208,1.04,2.474,2.474,0,0,1-.912,1.984A5.088,5.088,0,0,1,54.336.48,6.551,6.551,0,0,1,50-.8a5.154,5.154,0,0,1-1.52-4.16v-13.7q.352-.1,1.008-.208a8.269,8.269,0,0,1,1.392-.112,4.093,4.093,0,0,1,2.192.5,2.317,2.317,0,0,1,.784,2.1v2.048h4.192a5.477,5.477,0,0,1,.368.88,3.677,3.677,0,0,1,.176,1.168,2.22,2.22,0,0,1-.5,1.616,1.8,1.8,0,0,1-1.328.5H53.856Z" transform="translate(-1.235 23.5)" fill="#fff"/>
      </g>
    </svg>

  )
}

function IntroIllustration(){
  return(
    <svg xmlns="http://www.w3.org/2000/svg" width="500" height="300" viewBox="0 0 500 300">
  <defs>
    <clipPath id="clip-intro-illustration">
      <rect width="500" height="300"/>
    </clipPath>
  </defs>
  <g clip-path="url(#clip-intro-illustration)">
    <rect width="500" height="300" fill="#fff"/>
    <rect width="500" height="300" fill="#f4f4f4"/>
    <rect width="199" height="51" transform="translate(101)" fill="#ddc2c2"/>
    <rect width="200" height="51" transform="translate(300)" fill="#b7d9b7"/>
    <rect width="101" height="300" fill="#b5b5b5"/>
    <rect width="78" height="14" transform="translate(121 66)"/>
    <rect width="91" height="14" transform="translate(319 66)"/>
    <rect width="98" height="14" transform="translate(121 92)"/>
    <rect width="98" height="14" transform="translate(319 92)"/>
    <rect width="72" height="14" transform="translate(121 118)"/>
    <rect width="71" height="14" transform="translate(319 118)"/>
    <rect width="85" height="14" transform="translate(121 143)"/>
    <rect width="85" height="14" transform="translate(319 143)"/>
    <rect width="119" height="14" transform="translate(121 169)"/>
    <rect width="119" height="14" transform="translate(319 169)"/>
    <rect width="85" height="14" transform="translate(121 195)"/>
    <rect width="85" height="14" transform="translate(319 195)"/>
    <rect width="17" height="14" transform="translate(350 66)" fill="red"/>
    <rect width="17" height="14" transform="translate(333 143)" fill="red"/>
    <rect width="29" height="14" transform="translate(354 92)" fill="#00b200"/>
    <rect width="30" height="14" transform="translate(379 195)" fill="#00b200"/>
    <rect width="23" height="14" transform="translate(390 118)" fill="#003bff"/>
    <rect width="23" height="14" transform="translate(319 169)" fill="#003bff"/>
    <rect width="80" height="22" rx="3" transform="translate(11 10)" fill="#fff"/>
    <rect width="80" height="22" rx="3" transform="translate(11 93)" fill="#fff"/>
    <rect width="80" height="22" rx="3" transform="translate(11 176)" fill="#fff"/>
    <rect width="80" height="21" rx="3" transform="translate(11 41)" fill="#fff"/>
    <rect width="80" height="21" rx="3" transform="translate(11 124)" fill="#fff"/>
    <rect width="80" height="21" rx="3" transform="translate(11 207)" fill="#fff"/>
    <line x2="80.043" transform="translate(10.87 77.572)" fill="none" stroke="#707070" stroke-width="3"/>
    <line x2="80.043" transform="translate(10.87 160.58)" fill="none" stroke="#707070" stroke-width="3"/>
    <rect width="31" height="12" transform="translate(18 15)" fill="#b1b1b1"/>
    <rect width="31" height="12" transform="translate(18 98)" fill="#b1b1b1"/>
    <rect width="31" height="12" transform="translate(18 181)" fill="#b1b1b1"/>
    <rect width="31" height="12" transform="translate(18 45)" fill="#0c3afb"/>
    <rect width="31" height="12" transform="translate(18 128)" fill="#fd0d1b"/>
    <rect width="31" height="12" transform="translate(18 211)" fill="#19b21d"/>
    <path d="M12.612-5.669a2.113,2.113,0,0,0-.8-1.758,9.923,9.923,0,0,0-2.805-1.3,26.912,26.912,0,0,1-3.281-1.3q-4.146-2.036-4.146-5.6a5.018,5.018,0,0,1,1.033-3.127,6.68,6.68,0,0,1,2.922-2.109,11.372,11.372,0,0,1,4.248-.754,9.948,9.948,0,0,1,4.124.82,6.529,6.529,0,0,1,2.834,2.336A6.1,6.1,0,0,1,17.754-15H12.627a2.578,2.578,0,0,0-.8-2.021,3.112,3.112,0,0,0-2.161-.718,3.509,3.509,0,0,0-2.175.608,1.865,1.865,0,0,0-.8,1.545A1.878,1.878,0,0,0,7.573-14.1a11.084,11.084,0,0,0,3.091,1.377A18.934,18.934,0,0,1,14.3-11.191,6.1,6.1,0,0,1,17.754-5.7,5.208,5.208,0,0,1,15.645-1.3,9.382,9.382,0,0,1,9.858.293a11.48,11.48,0,0,1-4.695-.93A7.078,7.078,0,0,1,2-3.186,6.641,6.641,0,0,1,.938-6.914H6.094A3.271,3.271,0,0,0,6.98-4.387a4.189,4.189,0,0,0,2.878.813,3.309,3.309,0,0,0,2.014-.549A1.813,1.813,0,0,0,12.612-5.669Zm6.929-2.4a9.355,9.355,0,0,1,.923-4.226,6.6,6.6,0,0,1,2.651-2.849,7.985,7.985,0,0,1,4.058-1,7.288,7.288,0,0,1,5.61,2.2,8.46,8.46,0,0,1,2.051,6v.176a8.208,8.208,0,0,1-2.058,5.881A7.307,7.307,0,0,1,27.2.293a7.39,7.39,0,0,1-5.435-2.029,7.935,7.935,0,0,1-2.212-5.5Zm4.937.308a5.9,5.9,0,0,0,.688,3.223A2.294,2.294,0,0,0,27.2-3.516q2.637,0,2.7-4.058v-.5q0-4.263-2.725-4.263-2.476,0-2.681,3.677ZM46.45-1.714A5.09,5.09,0,0,1,42.217.293a4.992,4.992,0,0,1-3.948-1.516,6.376,6.376,0,0,1-1.34-4.358V-15.85h4.937v10.3a1.774,1.774,0,0,0,1.978,2.036A2.58,2.58,0,0,0,46.26-4.731V-15.85h4.966V0H46.6Zm17.065-9.668L61.89-11.5q-2.329,0-2.988,1.465V0H53.965V-15.85h4.629l.161,2.036a3.823,3.823,0,0,1,3.472-2.329,4.814,4.814,0,0,1,1.377.176ZM73.594-4.453a1.14,1.14,0,0,0-.659-1.011,10.027,10.027,0,0,0-2.5-.791,11.422,11.422,0,0,1-3.047-1.077A5.1,5.1,0,0,1,65.552-8.95a3.865,3.865,0,0,1-.63-2.183,4.381,4.381,0,0,1,1.8-3.6,7.422,7.422,0,0,1,4.717-1.414,8.223,8.223,0,0,1,5.039,1.421,4.443,4.443,0,0,1,1.9,3.735H73.433q0-1.9-2.007-1.9a1.989,1.989,0,0,0-1.3.432,1.338,1.338,0,0,0-.527,1.077,1.228,1.228,0,0,0,.645,1.069,6.09,6.09,0,0,0,2.058.674,17.785,17.785,0,0,1,2.483.63q3.574,1.23,3.574,4.409a4.151,4.151,0,0,1-1.926,3.53A8.447,8.447,0,0,1,71.44.293a8.62,8.62,0,0,1-3.633-.732,6.075,6.075,0,0,1-2.49-1.992,4.511,4.511,0,0,1-.894-2.651h4.614a1.908,1.908,0,0,0,.732,1.6,3.013,3.013,0,0,0,1.8.505,2.37,2.37,0,0,0,1.516-.41A1.312,1.312,0,0,0,73.594-4.453ZM88.33.293a8.148,8.148,0,0,1-5.9-2.175,7.512,7.512,0,0,1-2.256-5.662v-.41a9.734,9.734,0,0,1,.9-4.292A6.592,6.592,0,0,1,83.7-15.125a7.938,7.938,0,0,1,4.1-1.018,6.861,6.861,0,0,1,5.273,2.073A8.145,8.145,0,0,1,95.01-8.291v1.919H85.2a3.558,3.558,0,0,0,1.157,2.095,3.443,3.443,0,0,0,2.314.762,4.437,4.437,0,0,0,3.662-1.641L94.585-2.49A6.306,6.306,0,0,1,91.97-.461,8.836,8.836,0,0,1,88.33.293Zm-.557-12.627q-2.168,0-2.578,2.871h4.98v-.381a2.445,2.445,0,0,0-.6-1.838A2.39,2.39,0,0,0,87.773-12.334Z" transform="translate(120 39)" fill="#fff"/>
    <path d="M9.536-7.529H6.753V0H1.611V-21.328H10a9.361,9.361,0,0,1,5.933,1.685,5.71,5.71,0,0,1,2.139,4.761,6.938,6.938,0,0,1-.9,3.691,6.4,6.4,0,0,1-2.82,2.373l4.453,8.6V0H13.3ZM6.753-11.5H10a2.923,2.923,0,0,0,2.2-.769,2.968,2.968,0,0,0,.74-2.146,3,3,0,0,0-.747-2.161,2.9,2.9,0,0,0-2.2-.784H6.753ZM28.623.293a8.148,8.148,0,0,1-5.9-2.175,7.512,7.512,0,0,1-2.256-5.662v-.41a9.734,9.734,0,0,1,.9-4.292,6.592,6.592,0,0,1,2.629-2.878,7.938,7.938,0,0,1,4.1-1.018,6.861,6.861,0,0,1,5.273,2.073A8.145,8.145,0,0,1,35.3-8.291v1.919H25.488a3.558,3.558,0,0,0,1.157,2.095,3.443,3.443,0,0,0,2.314.762,4.437,4.437,0,0,0,3.662-1.641L34.878-2.49A6.306,6.306,0,0,1,32.263-.461,8.836,8.836,0,0,1,28.623.293Zm-.557-12.627q-2.168,0-2.578,2.871h4.98v-.381a2.445,2.445,0,0,0-.6-1.838A2.39,2.39,0,0,0,28.066-12.334Zm17.52,7.881a1.14,1.14,0,0,0-.659-1.011,10.027,10.027,0,0,0-2.5-.791,11.422,11.422,0,0,1-3.047-1.077A5.1,5.1,0,0,1,37.544-8.95a3.865,3.865,0,0,1-.63-2.183,4.381,4.381,0,0,1,1.8-3.6,7.422,7.422,0,0,1,4.717-1.414,8.223,8.223,0,0,1,5.039,1.421,4.443,4.443,0,0,1,1.9,3.735H45.425q0-1.9-2.007-1.9a1.989,1.989,0,0,0-1.3.432,1.338,1.338,0,0,0-.527,1.077,1.228,1.228,0,0,0,.645,1.069,6.09,6.09,0,0,0,2.058.674,17.785,17.785,0,0,1,2.483.63q3.574,1.23,3.574,4.409a4.151,4.151,0,0,1-1.926,3.53A8.447,8.447,0,0,1,43.433.293,8.62,8.62,0,0,1,39.8-.439a6.075,6.075,0,0,1-2.49-1.992,4.511,4.511,0,0,1-.894-2.651H41.03a1.908,1.908,0,0,0,.732,1.6,3.013,3.013,0,0,0,1.8.505,2.37,2.37,0,0,0,1.516-.41A1.312,1.312,0,0,0,45.586-4.453ZM62.095-1.714A5.09,5.09,0,0,1,57.861.293a4.992,4.992,0,0,1-3.948-1.516,6.376,6.376,0,0,1-1.34-4.358V-15.85H57.51v10.3a1.774,1.774,0,0,0,1.978,2.036A2.58,2.58,0,0,0,61.9-4.731V-15.85H66.87V0H62.241ZM74.78,0H69.829V-22.5H74.78Zm8.789-19.79v3.94h2.607v3.428H83.569v7.251a1.851,1.851,0,0,0,.322,1.245,1.729,1.729,0,0,0,1.274.352,7.242,7.242,0,0,0,1.23-.088v3.53a9.11,9.11,0,0,1-2.783.425,5.171,5.171,0,0,1-3.765-1.2,4.923,4.923,0,0,1-1.216-3.647v-7.866H76.611V-15.85h2.021v-3.94Z" transform="translate(319 39)" fill="#fff"/>
    <line y2="300.006" transform="translate(300.902 0.494)" fill="none" stroke="#fff" stroke-width="4"/>
    <line y2="294.03" transform="translate(101.289 2.47)" fill="none" stroke="#b5b5b5" stroke-width="2"/>
    <g fill="none" stroke="#b5b5b5" stroke-width="4">
      <rect width="500" height="300" stroke="none"/>
      <rect x="2" y="2" width="496" height="296" fill="none"/>
    </g>
    <path d="M0,26.825a51.413,51.413,0,0,0,6.772,8.554A49.485,49.485,0,0,0,42.619,50.024c30.3,0,49.246-25.725,49.36-50.024" transform="matrix(0.914, 0.407, -0.407, 0.914, 220.62, 208.479)" fill="none" stroke="#e83039" stroke-linecap="round" stroke-width="20"/>
    <path id="Polygon_2" data-name="Polygon 2" d="M29.374,3.536a5,5,0,0,1,7.071,0L57.284,24.374a5,5,0,0,1-3.536,8.536H12.071a5,5,0,0,1-3.536-8.536Z" transform="matrix(0.914, 0.407, -0.407, 0.914, 288.265, 202.237)" fill="#e83039"/>
  </g>
</svg>

  )
}
export default App;
