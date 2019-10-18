import {TreeStore} from "./main";

import {AuthorityStore} from './login';

import {EntityStore} from './entity';
import {CommonStore} from "./components";
import {PodStore} from "./kubernetes/pod"
import {KubeStore} from "./kubernetes";
import {ConfigMapStore} from "./kubernetes/configMap";
import {ActivitiStore} from "./activiti";
import {SysStore,SysOperationStore} from './platform'



export default class RootStore {

    constructor() {
        this.treeStore = new TreeStore(this);
        this.authorityStore = new AuthorityStore(this);
        this.entityStore=new EntityStore(this);
        this.commonStore=new CommonStore(this);
        this.podStore = new PodStore(this);
        this.kubeStore = new KubeStore(this);
        this.configMapStore = new ConfigMapStore(this);
        this.activitiStore = new ActivitiStore(this);
        this.sysStore = new SysStore(this);
        this.sysOperationStore = new SysOperationStore(this);
    }
}

