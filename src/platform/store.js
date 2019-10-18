import {observable, configure,action,runInAction,} from 'mobx';
import {notification} from 'antd';
import {baseUrl,get,del,kubeUrl} from '../util';


configure({ enforceActions: 'observed' });

export class SysStore{

    constructor(rootStore){
        this.rootStore=rootStore;
    }

    @observable
    allSystem=[];

    @observable
    sysFormVisible=false;

    @observable
    currentSys={};

    @observable
    sysRoleConfVisible=false;


    checkUnique=async(rule, value, callback)=>{
        if(this.currentSys){
            if(this.currentSys.code===value){
                callback();
            }
        }
        let json=await get(`${kubeUrl}/sys/platform/checkUnique/${value}`);
        //let json=await response.json();
        if(json.total===0){
            callback();
        }else{
            callback(new Error());
        }

    };

    @action
    initAllsystem=async ()=>{
        let json=await get(`${kubeUrl}/sys/platform`);
        runInAction(()=>{
            this.allSystem=json;
        })
    };

    delete=(id)=>(async()=>{
        const json=await del(`${kubeUrl}/sys/platform/${id}`);
        //const json=await response.json();
        if(json.success){
            notification.success({
                message:'删除成功',
            })
        }else{
            notification.error({
                message:'后台错误，请联系管理员',
            })
        }
        this.initAllsystem();
    });


    @action
    toggleSysFormVisible=()=>{
        this.sysFormVisible=!this.sysFormVisible
    };

    @action
    showForm=(record={})=>(()=>{
        runInAction(()=>{
            this.currentSys=record;
        });
        this.toggleSysFormVisible();
    });

    @action
    showSysRoleConf=(record={})=>(()=>{
        runInAction(()=>{
            this.currentSys=record;
        });
        this.toggleSysRoleConfVisible();
    });

    @action
    toggleSysRoleConfVisible=()=>{
        this.sysRoleConfVisible=!this.sysRoleConfVisible;
    };

}

export class SysOperationStore{

    constructor(rootStore){
        this.rootStore=rootStore;
    }

    @observable
    currentsysId=-1;

    @observable
    operationVisible=false;

    @action
    toggleOperationVisible = ()=>{
        this.operationVisible = !this.operationVisible;
    };

    showOperation = (record)=>action(()=>{
        this.currentsysId = record.id;
        this.currentSys = record;
        this.toggleOperationVisible();
    });

    @observable
    currentOperations=[];

    @observable
    currentSys={};

    @observable
    opFormVisible=false;

    @observable
    currentOperation={};

    @action
    loadCurrentSys=async(sysId)=>{
        let json=await get(`${kubeUrl}/sys/platform/${sysId}`);
        runInAction(()=>{
            this.currentSys=json;
        });
    };

    @action
    loadOperationById=async (id)=>{
        let json=await get(`${kubeUrl}/sys/platform/operation/${id}`);
        runInAction(()=>{
            this.currentOperations=json;
        });
    };

    @action
    toggleOpFormVisible=()=>{
        this.opFormVisible=!this.opFormVisible;
    };

    // @action
    // loadOperation=async ()=>{
    //     let json=await get(`${kubeUrl}/sys/platform/operations/${this.currentSys.id}`);
    //     runInAction(()=>{
    //         this.currentOperations=json;
    //     });
    // };




    @action
    treeSelect=(selectedKeys,e)=>{
        console.log(e.selectedNodes[0].props);
        this.currentSys=e.selectedNodes[0].props;
        this.loadOperation();

    };

    @action
    showOpForm=(record)=>(()=>{
        if(!this.currentSys.id){
            message.error('先选择对应系统平台');
            return;
        }
        runInAction(()=>{
            this.currentOperation=record;
        });
        this.toggleOpFormVisible();
    });

    deleteOp=(id)=>(async()=>{
        const json=await del(`${kubeUrl}/sys/platform/operation/${id}`);
        //const json=await response.json();
        if(json.success){
            notification.success({
                message:'删除成功',
            })
        }else{
            notification.error({
                message:'后台错误，请联系管理员',
            })
        }
        this.loadOperation();
    });


}