import React from 'react';
import Icon from '../components/icons.js';
import { copyClipboard } from '../functions/copyClipboard.js';

class ResultArea extends React.Component {
  constructor(props){
    super(props);
    this.state={};
    this.rendered = false;
    this.store = this.props.store;
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
    let rows = this.renderRows(this.props.rows);
    const scroll = this.props.scroll;
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
          style={{ left: indent }}
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

export default ResultArea;
