import {observable, configure, action,} from 'mobx';
//import {notification} from 'antd';
import {baseUrl, get} from '../util';

configure({ enforceActions: "observed" });

export default class AuthorityStore {

  constructor(rootStore){
    this.rootStore=rootStore;
  }
  @observable
  currentUser = {};

  @observable
  applyPlatformVisible = false;



  @observable
  loginVisible = !sessionStorage.getItem('access-token');

  @observable
  regFormVisible=false;


  logout = async () => {
    get(`${baseUrl}/logout`);
    sessionStorage.clear();
    this.taggreLogin();
  };


  @action
  taggreLogin = () => {
    this.loginVisible = !this.loginVisible;
  };


  @action
  toggleRegFormVisible=()=>{
    this.regFormVisible=!this.regFormVisible;
  };


}
