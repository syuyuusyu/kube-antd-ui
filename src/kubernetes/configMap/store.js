import React from 'react';
import {observable, action, configure, runInAction, computed,reaction} from 'mobx';
import {
    Modal, Badge, Icon, Input, Table, Dropdown, Menu, Button, Divider, Popconfirm,notification
} from 'antd';

import {get,getPathById,kubeUrl,format,patch,del} from '../../util';



configure({enforceActions: "observed"});


export  class ConfigMapStore {

    constructor(rootStore) {
        this.rootStore = rootStore;

    }

    @observable
    contextVisible= false;

    @action
    toggleContextVisible = ()=>{
        this.contextVisible = !this.contextVisible;
    };

    @observable
    currentMap={};

    @observable
    currentKey = '';

    setMapAndKey = (map,key)=>{
        return action(()=>{
            this.currentMap=map;
            this.currentKey=key;
            this.toggleContextVisible();
        });

    };



}