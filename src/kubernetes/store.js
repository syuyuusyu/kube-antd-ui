import React from 'react';
import {observable, action, configure, runInAction, computed,reaction} from 'mobx';
import {
    Modal, Badge, Icon, Input, Table, Dropdown, Menu, Button, Divider, Popconfirm,notification
} from 'antd';

import {get,getPathById,kubeUrl,format,patch,del} from '../util';
import {NativeEventSource, EventSourcePolyfill} from 'event-source-polyfill';



configure({enforceActions: "observed"});


export  class KubeStore {

    constructor(rootStore){
        this.rootStore=rootStore;

        reaction(
            () => this.currentKind,
            async (currentKind, reaction) => {
                if(!currentKind){
                    return;
                }
                if(currentKind !== 'Pod'){
                    this.loadResources();
                }else {
                    rootStore.podStore.loadPods()
                }
            }
        );
    }

    @observable
    currentKind = '';

    currentName = '';

    @action
    currentKindChange = ( value) => {
        this.currentKind = value;
    };

    resourceKind = ['Pod','Service','Ingress','PersistentVolume','PersistentVolumeClaim','Deployment','ConfigMap'];

    @observable
    resources = [];

    ns='';

    @action
    loadResources =async ()=>{
        let json = await get(`${kubeUrl}/kube/${this.currentKind}/${this.ns}`);
        runInAction(()=>{
            this.resources = json
        });
    };


    //Service Ingress  PersistentVolume configMap deployment
    operation =  {
        title: '操作',
        align: 'center',
        width: 350,
        render: (text, record) => {
            return (
                <span key={Math.random()}>
                        <Dropdown   overlay={(
                            <Menu>
                                <Menu.Item>
                                    <Button onClick={this.rootStore.podStore.toggleEditVisible(record)} size={"small"}>编辑</Button>
                                </Menu.Item>
                                <Menu.Item>
                                    <Popconfirm onConfirm={this.rootStore.podStore.delete(record)} title="确认删除?">
                                        <Button onClick={null} size='small'>删除</Button>
                                    </Popconfirm>
                                </Menu.Item>
                            </Menu>
                        )}>
                            <Button icon="api" size={"small"}>操作</Button>
                        </Dropdown>
                    </span>
            )
        }
    };

    @computed
    get columns(){
        switch (this.currentKind) {
            case 'Service' :
                return [
                    {
                        dataIndex: 'name', title: '名称', width: 250,
                    }
                ].concat(this.operation);

            case 'Ingress' :
                return [
                    {
                        dataIndex: 'name', title: '名称', width: 250,
                    }
                ].concat(this.operation);
            case 'PersistentVolume' :
                return [
                    {
                        dataIndex: 'name', title: '名称', width: 250,
                    }
                ].concat(this.operation);
            case 'PersistentVolumeClaim' :
                return [
                    {
                        dataIndex: 'name', title: '名称', width: 250,
                    }
                ].concat(this.operation);
            case 'Deployment' :
                return [
                    {
                        dataIndex: 'name', title: '名称', width: 250,
                    }
                ].concat(this.operation);
            case 'ConfigMap' :
                return [
                    {
                        dataIndex: 'name', title: '名称', width: 250,
                    }
                ].concat(this.operation);
        }
    }

    logEventSource = null;

    loadMessage = () => {
        this.logEventSource = new EventSourcePolyfill(`${kubeUrl}/message`, {
            headers: {
                'access-token': sessionStorage.getItem('access-token') || ''
            }
        });
        this.logEventSource.onmessage = result => {
            //const data = JSON.parse(result.data);
            console.log('Data: ', result);
            if (result && result.data) {

            }


        };

        this.logEventSource.onerror = err => {
            console.log('EventSource error: ', err);
        };
    };
}