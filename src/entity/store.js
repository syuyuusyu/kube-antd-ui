import {observable, configure, action, runInAction,} from 'mobx';
import {notification} from 'antd';
import {activitiUrl, get, post, del, baseUrl} from '../util';
import axios from 'axios';


configure({enforceActions: "observed"});

notification.config({
    placement: 'topLeft',
});

export class EntityStore {

    constructor(rootStore) {
        this.rootStore = rootStore;
    }

    isFormUpdate=false;

    originalColumns=[];

    //----------------------
    //entityTable
    @observable
    allDictionary=[];

    @observable
    entitys=[];

    @action
    loadEntitys=async ()=> {
        get(`${baseUrl}/entity/originalColumns`).then(json=>this.originalColumns=json);
        let json = await get(`${baseUrl}/entity/entitys`);
        runInAction(()=>{
            this.entitys=json;
        })
    };

    //----------------------
    //columnTable
    @observable
    columnTableVisible=false;

    @observable
    currentEntity={};


    @observable
    currentColumns=[];

    @action
    toggleColumnTableVisible=()=>{
      this.columnTableVisible=!this.columnTableVisible;
    };


    @action
    loadColumns=async ()=>{
        let json=await get(`${baseUrl}/entity/columns/${this.currentEntity.id}`);
        runInAction(()=>{
            this.currentColumns=json;
        });
    };

    checkColumn=(record)=>action(()=>{
        this.currentEntity=record;
        this.toggleColumnTableVisible();
    });

    //-----------------------------
    //columnForm
    @observable
    columnFormVisible=false;

    currentColumn;

    @observable
    foreignColumns=[];

    @action
    loadForeignColumns=async (entityId)=>{
        let json=await get(`${baseUrl}/entity/columns/${entityId}`);
        console.log('------');
        console.log(json);
        runInAction(()=>{
           this.foreignColumns=json;
        });
    };

    @action
    toggleColumnFormVisible=()=>{
        this.columnFormVisible=!this.columnFormVisible;
    };

    showColumnForm=(isUpdate,record)=>(()=>{
        this.currentColumn=record;
        this.isFormUpdate=isUpdate;
        this.toggleColumnFormVisible();
    });


    //entityForm
    //-------------------------
    @observable
    tableNames=[];

    @observable
    entityFormVisible=false;


    @action
    toggleEntityFormVisible=()=>{
        this.entityFormVisible=!this.entityFormVisible;
    };

    @action
    loadTableNames=async()=>{
        let json=await get(`${baseUrl}/entity/tableNames`);
        runInAction(()=>{
            this.tableNames=json;
        });
    };

    @action
    loadFilterTableNames=async()=>{
        let json=await get(`${baseUrl}/entity/tableNames`);
        runInAction(()=>{
            //this.tableNames=json.filter(_=>this.entitys.filter(o=>o.tableName===_.tableName).length===0);
            this.tableNames=json;
        });
    };

    showEntityForm=(isUpdate,record)=>action(()=>{
        this.currentEntity=record;
        this.isFormUpdate=isUpdate;
        this.toggleEntityFormVisible();
    });

    //dictionaryTable
    //-------------------------
    @observable
    addDicVisible=false;

    @observable
    addDicFieldVisible=false;

    selectDic={};

    selectDicField={};

    subTables={};

    @action
    toggleAddDicVisible=()=>{
        this.addDicVisible=!this.addDicVisible;
    };

    @action
    toggleAddDicFieldVisible=()=>{
        this.addDicFieldVisible=!this.addDicFieldVisible;
    };

    showAddDicForm=(record,isUpdate)=>(()=>{
        this.selectDic=record;
        this.isFormUpdate=isUpdate;
        this.toggleAddDicVisible();
    });

    showAddDicFieldForm=(record,isUpdate)=>(()=>{
        this.selectDicField=record;
        this.isFormUpdate=isUpdate;
        this.toggleAddDicFieldVisible();
    });


    @action
    loadallDictionary=async ()=>{
        this.subTables={};
        let json=await get(`${baseUrl}/dictionary/allDictionary`);
        runInAction(()=>{
            this.allDictionary=json;
        });
    };

    @observable
    dictionaryTableVisible=false;

    @action
    toggleDictionaryTableVisible=()=>{
        this.dictionaryTableVisible=!this.dictionaryTableVisible;
    };


    refDictionaryFieldTable=(groupId)=>((instance)=>{
        this.subTables[groupId]=instance;
    });

    deleteGroup=(groupId)=>(async()=>{
        let json = await get(`${baseUrl}/dictionary/deleteGroup/${groupId}`);
        if (json.success) {
            notification.info({
                message: '删除成功'
            });
        } else {
            notification.error({
                message: '删除失败'
            });
        }
        this.loadallDictionary();
    });

    deleteDictionary=(id,groupId)=>(async()=>{
        let json = await get(`${baseUrl}/dictionary/deleteDictionary/${id}`);
        if (json.success) {
            notification.info({
                message: '删除成功'
            });
        } else {
            notification.error({
                message: '删除失败'
            });
        }
        this.subTables[groupId].setCurrentFields();
        this.loadallDictionary();
    });

    //monyTomonyTable
    //------------------------------------
    @observable
    monyToMonyTableVisible=false;

    @observable
    monyToMonyFormVisible=false;

    @observable
    monyToMonys=[];

    currentMonyToMony;

    @action
    loadMonyToMonys=async ()=>{
        let json=await get(`${baseUrl}/entity/monyToMonys`);
        runInAction(()=>{
            this.monyToMonys=json;
        });
    };

    @action
    toggleMonyToMonyTableVisible=()=>{
        this.monyToMonyTableVisible=!this.monyToMonyTableVisible;
    };

    @action
    toggleMonyToMonyFormVisible=()=>{
        this.monyToMonyFormVisible=!this.monyToMonyFormVisible;
    };

    showMonyToMonyForm=(isFormUpdate,record)=>(()=>{
        this.isFormUpdate=isFormUpdate;
        this.currentMonyToMony=record;
        this.toggleMonyToMonyFormVisible();
    });

    //operationTable
    //--------------------
    @observable
    operationTableVisible=false;

    @observable
    entityOperations=[];

    @action
    loadEntityOperations=async ()=>{
        let json=await get(`${baseUrl}/entity/entityOperations/${this.currentEntity.id}`);
        runInAction(()=>{
            this.entityOperations=json;
        });
    };

    @action
    toggleOperationTableVisible=()=>{
        this.operationTableVisible=!this.operationTableVisible;
    };

    showOperationTable=(record)=>action(()=>{
        this.currentEntity=record;
        this.toggleOperationTableVisible();
    });

    //operationForm
    //------------------
    @observable
    operationFormVisible=false;

    currentOperation;


    @action
    toggleOperationFormVisible=()=>{
        this.operationFormVisible=!this.operationFormVisible;
    };

    showOperationForm=(isFormUpdate,record)=>(()=>{
        this.isFormUpdate=isFormUpdate;
        this.currentOperation=record;
        this.toggleOperationFormVisible();
    });



}