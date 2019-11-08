import React from 'react';
import ActionUnit from './actionUnit.js';
import Icon from './icons.js';
class ActionsContainer extends React.Component {
  constructor(props){
    super(props);
    this.state = {};
  }

  render(){
    let actions = []
    console.log('zzzzzzz', this.props.actions)

    this.props.actions.forEach(action => {
      actions.push(
        <ActionUnit
          key = {action.id}
          action = {action}
          addAction = {this.props.addAction}
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
          <button
            onClick = {this.props.toggleAllActions}
          >
            {this.props.actionsActive
              ? <Icon name='toggle-on' size="14" fill='#74B974' />
              : <Icon name='toggle-off' size="14" fill='#ADADAD' />
            }

          </button>
          <button
            onClick = {this.props.deleteAllActions}
          >
            <Icon name='times-circle-regular' size="14" fill='#ADADAD'/>
          </button>
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

      </React.Fragment>
    )
  }
}

export default ActionsContainer;
