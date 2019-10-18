import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import './index.less';



@inject('rootStore')
@observer
class Home extends Component {
  componentWillMount() {

  }

  render() {
    return (
      <div style={{height:'100%'}}>
          HOME PAGE
      </div>
    );
  }
}

export default Home;

