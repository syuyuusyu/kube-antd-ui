
import {observable, action, configure, runInAction, computed} from 'mobx';

import {get, getPathById, kubeUrl, format, patch, del, put,post} from '../../util';
import { notification,message} from 'antd';

import {NativeEventSource, EventSourcePolyfill} from 'event-source-polyfill';

import YAML from 'yaml'

configure({enforceActions: "observed"});
notification.config({
    placement: 'topRight',
});


export  class PodStore {

    constructor(rootStore){
        this.rootStore=rootStore;
    }

    wsUrl = `ws://127.0.0.1:7008/exec`;
    @observable
    hasConsole = true;

    @observable
    pods = [];

    @action
    loadPods = async () => {
        let json = await get(`${kubeUrl}/kube/Pod/${this.currentNs}`);
        runInAction(() => {
            this.pods = json.filter(d => d)
        })

    };



    @observable
    currentPod = null;

    @action
    setCurrentPod = (pod) => {
        this.currentPod = pod
    };


    @computed
    get containers() {
        if (!this.currentPod || !this.currentPod.containers) {
            return [];
        }
        return this.currentPod.containers;
    }

    currentNs = "";

    containerName = "";

    @observable
    consoleVisible = false;

    toggleConsoleVisible = (p,cname) => action(() => {
        this.currentPod = p;
        this.containerName = cname;
        this.consoleVisible = !this.consoleVisible;
    });


    @observable
    logVisible = false;

    toggleLogVisible = (p,cname) => action(() => {
        this.currentPod = p;
        this.containerName = cname;
        this.logVisible = !this.logVisible;
    });


    toggleEditVisible = (p) => action(() => {
        if(p && p!=='new'){
            this.currentPod = p;
            this.rootStore.kubeStore.currentName = p.name;
        }
        if(p === 'new'){
            this.isnew = true
        }
        if(this.editVisible){
            this.isnew = false
        }
        this.editVisible = !this.editVisible;
    });

    @observable
    logText = '';

    isnew = false;

    logEventSource = null;

    @action
    loadLogs = () => {
        this.logText = '';
        this.logEventSource = new EventSourcePolyfill(`${kubeUrl}/kube/Pod/log/${this.currentPod.ns}/${this.currentPod.name}/${this.containerName}`, {
            headers: {
                'access-token': sessionStorage.getItem('access-token') || ''
            }
        });
        this.logEventSource.onmessage = result => {
            //const data = JSON.parse(result.data);
            console.log('Data: ', result);
            if (result && result.data) {
                runInAction(() => {
                    this.logText += result.data + '\n';
                })
            }
            ;

        };

        this.logEventSource.onerror = err => {
            console.log('EventSource error: ', err);
        };
    };


    @observable
    editVisible = false;



    @action
    loadEditCode = async () => {
        let json = await get(`${kubeUrl}/kube/Pod/${this.currentPod.ns}/${this.currentPod.name}`);
        runInAction(() => {
            //this.jsonCode=format( JSON.stringify(json));
            this.jsonObject = json;
            this.yamlText = YAML.stringify(this.jsonObject);
            this.jsonText = format(JSON.stringify(this.jsonObject));
            this.jsonCurrent = this.jsonText;
            this.yamlCurrent = this.yamlText;
        });
    };

    @action
    read = async ()=>{
        let kind = this.rootStore.kubeStore.currentKind;
        let name = this.rootStore.kubeStore.currentName;
        let json = await  get(`${kubeUrl}/kube/${kind}/${this.currentNs}/${name}`);
        runInAction(()=>{
            this.jsonObject = json;
            this.yamlText = YAML.stringify(this.jsonObject);
            this.jsonText = format(JSON.stringify(this.jsonObject));
            this.jsonCurrent = this.jsonText;
            this.yamlCurrent = this.yamlText;
        })
    };

    @action
    newResource = async ()=>{
        runInAction(()=>{
            this.jsonObject = {
                apiVersion:"v1",
                kind:"SomeKind"
            };
            this.yamlText = YAML.stringify(this.jsonObject);
            this.jsonText = format(JSON.stringify(this.jsonObject));
            this.jsonCurrent = this.jsonText;
            this.yamlCurrent = this.yamlText;
        })
    };

    @observable
    codeIndex = '0';

    @action
    codeIndexChange = ( value) => {
        this.codeIndex = value;
        this.valideCode(value === '0' ? '1' : '0');
    };

    @action
    valideCode = (type) => {
        console.log( this.yamlCurrent);
        try {
            if (type === '1') {
                //json -> yaml
                this.jsonText = this.jsonCurrent;
                this.jsonObject = JSON.parse(this.jsonCurrent);
                this.yamlText = YAML.stringify(this.jsonObject);
            } else {
                this.yamlText = this.yamlCurrent;
                this.jsonObject = YAML.parse(this.yamlCurrent);
                this.jsonText = format(JSON.stringify(this.jsonObject));
            }
            return true;
        } catch (e) {
            notification.error({
                message: e.toLocaleString()
            });
            return false;
        }
    };

    jsonObject = {};

    setEditCode = (value) => {
        this.jsonObject = value;
    };


    @observable
    jsonText = '';

    @observable
    yamlText = '';

    @action
    setJsonText = (value) => {
        this.jsonText = value;
    };

    @action
    setYamlText = (value) => {
        this.yamlText = value;
    };
    jsonCurrent;
    yamlCurrent;

    create =async ()=>{
        if (this.valideCode(this.codeIndex)) {
            let kind = this.jsonObject.kind;
            if(!kind || this.rootStore.kubeStore.resourceKind.findIndex(n=>n===kind)===-1){
                notification.error({
                    message: '输入有效的资源类型'
                });
                return;
            }
            let json = await post(`${kubeUrl}/kube/${kind}/${this.currentNs}`, this.jsonObject);
            if(json.success){
                notification.info({
                    message: json.msg
                });
                this.toggleEditVisible()();
            }else{
                notification.error({
                    message: json.msg,
                    style: {
                        width: 600,
                        marginLeft: 335 - 600,
                    },
                });
            }
        }
    };

    update =async () => {
        if(this.isnew){
            this.create();
            return;
        }
        let kind = this.rootStore.kubeStore.currentKind;
        if (this.valideCode(this.codeIndex)) {
            let json = await put(`${kubeUrl}/kube/${kind}`, this.jsonObject);
            if(json.success){
                notification.info({
                    message: json.msg
                });
                this.toggleEditVisible()();
            }else{
                notification.error({
                    message: json.msg,
                    style: {
                        width: 600,
                        marginLeft: 335 - 600,
                    },
                });
            }
        }
    };


    delete = (record) => (async ()=>{
        let kind = this.rootStore.kubeStore.currentKind;
        let json = await del(`${kubeUrl}/kube/${kind}/${record.ns}/${record.name}`);

        if(json.success){
            notification.info({
                message: json.msg
            });
            this.loadPods()
        }else{
            notification.error({
                message: json.msg,
                style: {
                    width: 600,
                    marginLeft: 335 - 600,
                },
            });
        }
    });



}

