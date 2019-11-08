import React from 'react';
import Icon from '../components/icons.js';

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
    
    let {id, count, find, replace, active, flags} = this.props.action;
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

export default ActionUnit;
