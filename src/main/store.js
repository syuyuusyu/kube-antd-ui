import {observable, configure,action,runInAction,computed} from 'mobx';
import {baseUrl,get,getPathById,kubeUrl} from '../util';

configure({ enforceActions: "observed" });

export class TreeStore{

    constructor(rootStore){
        this.rootStore=rootStore;
    }



    @observable
    menuTreeData=[];


    @observable
    winWidth=0;

    @observable
    winHeight=0;

    @observable
    headerHeight = 60;

    @observable
    menuHeight = 60;

    @observable
    footerHeight = 40;

    @observable
    currentRoleMenu=[];

    @action
    loadMenuTree=async()=>{
        //let json=await get(`${baseUrl}/menu/menuTree`);
        let json=await get(`${kubeUrl}/sys/menu`);
        json = json.children;
        //console.log(JSON.stringify(json))
        runInAction(()=>{
            this.menuTreeData=json;
            this.currentRoleMenu=[];
        });
        this.initMenuTreeData(json);
    };

    initMenuTreeData=(data)=>{
        data.forEach(item=>{
            this.pushMenuTreeData(item);
            if(item.children){
                this.initMenuTreeData(item.children);
            }
        })
    };

    @action
    pushMenuTreeData=(item)=>{
        if(item.path){
            this.currentRoleMenu.push(item);
        }
    };


    @observable
    currentRoute=[];


    @action
    onMenuClick=(e)=>{
        let clone=this.menuTreeData.filter(d=>d);
        clone.forEach(data=>{
          getPathById(e.key,data,(result)=>{
            runInAction(()=>{
                //console.log(result);
              this.currentRoute=result;
            });
          })
        });

    };


    @action
    updateWinSize = ({ width, height }) => {
      if (width !== undefined) {
        this.winWidth = width
      }
      if (height !== undefined) {
        this.winHeight = height
      }
    };



}

