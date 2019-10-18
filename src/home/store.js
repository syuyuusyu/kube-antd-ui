import {observable,action,runInAction,configure} from 'mobx';
import {baseUrl, get, post} from '../util';
import {notification} from 'antd';

configure({enforceActions: "observed"});

export class HomeStore{
  constructor(rootStore){
    this.rootStore = rootStore;
  }

}
