import './util';
import React from 'react';
import ReactDOM from 'react-dom';
import { Router } from 'react-router-dom';
import { Provider } from 'mobx-react';
import createHistory from 'history/createBrowserHistory';
import { Main } from './main';
import registerServiceWorker from './registerServiceWorker';
import RootStore from './rootStore';
import './index.less';


const history = createHistory();
// const div = document.createElement('div');
// document.body.appendChild(div);


ReactDOM.render(
  <Provider rootStore={new RootStore()} >
    <Router history={history}>
      <Main />
    </Router>
   </Provider>,
    document.getElementById('root')
);
registerServiceWorker();


