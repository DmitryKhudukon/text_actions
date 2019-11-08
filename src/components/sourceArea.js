import React from 'react';
import Icon from '../components/icons.js';
import { copyClipboard } from '../functions/copyClipboard.js';

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

    const rows = this.renderRows(this.props.rows);
    const scroll = this.props.scroll;
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


export default SourceArea;
