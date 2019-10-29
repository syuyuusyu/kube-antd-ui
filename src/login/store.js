import {observable, configure, action, runInAction, computed, reaction} from 'mobx';
import {notification} from 'antd';
import axios from 'axios';
import {baseUrl, get, kubeUrl, post} from '../util';

configure({enforceActions: "observed"});

export default class AuthorityStore {

    constructor(rootStore) {
        this.rootStore = rootStore;
        reaction(
            () => this.token,
            async (token, act) => {
                if (!token) {
                    return;
                }
                this.loadCurrentUser();
                rootStore.treeStore.loadMenuTree();
                rootStore.kubeStore.loadMessage();
                rootStore.activitiStore.loadCurrentTask();
            }
        );

        runInAction(() => {
            this.token = sessionStorage.getItem('access-token');
        });
    }

    @observable
    currentUser = {};

    @computed
    get loginVisible() {
        return this.token ? false : true;
    }

    @observable
    regFormVisible = false;

    @observable
    token = '';


    @action
    logout = () => {
        //get(`${kubeUrl}/logout`);
        sessionStorage.clear();
        this.token = '';
        this.currentUser = {};
        if (this.rootStore.kubeStore.msgEventSource) {
            this.rootStore.kubeStore.msgEventSource.close();
        }
    };

    @action
    loadCurrentUser = async ()=>{
        let json = await get(`${kubeUrl}/sys/author/currentUser`);
        runInAction(() => {
            this.currentUser = json;
        });
    };

    @action
    login = async (data) => {
        let response = await axios({
                url: `${kubeUrl}/sys/author/login`,
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                data: data
            }
        );
        let json = response.data;
        if (json.success) {
            notification.success({
                message: '登录成功',
            });
            runInAction(() => {
                sessionStorage.setItem('access-token', json.token);
                this.token = json.token;
                this.currentUser = json.user;
            });

            sessionStorage.setItem('currentUserName', json.user.name);
            sessionStorage.setItem('user', JSON.stringify(json.user));
            sessionStorage.setItem('roles',JSON.stringify(json.user.roles));
        } else {
            notification.warning({
                message: '用户不存在或密码错误',
            });
        }
    };

    @action
    toggleRegFormVisible = () => {
        this.regFormVisible = !this.regFormVisible;
    };


}
