import React, {Component} from 'react';
import {
    Modal, Badge, Icon, Input, Table, Dropdown, Menu, Button, Divider, Popconfirm,notification
} from 'antd';
import {inject, observer} from 'mobx-react';
import {get,getPathById,kubeUrl,format,patch,del} from '../../util';
import UpdateEdit from "../pod/updateEdit";
import ConfigMapContext from './configMapContext';

const { SubMenu } = Menu;
const { confirm } = Modal;

function showDeleteConfirm(record,key) {
    return ()=>{
        confirm({
            title: `确定删除字段${key}?`,
            okText: 'Yes',
            okType: 'danger',
            cancelText: 'No',
            onOk: async()=> {
                let json = await del (`${kubeUrl}/kube/ConfigMap/${record.ns}/${record.name}/${key}`);
                if(json.success){
                    notification.info({
                        message: json.msg
                    });
                }else{
                    notification.error({
                        message: json.msg,
                        style: {
                            width: 600,
                            marginLeft: 335 - 600,
                        },
                    });
                }
            },
            onCancel() {

            },
        });
    }
}

@inject('rootStore')
@observer
class ConfigMapTable extends Component {

    state ={
        contextVisible :false,
        currentMap:{}
    };

    columns = [
        {
            dataIndex: 'name', title: '名称', width: 250,
        }, {
            title: '操作',
            align: 'center',
            width: 350,
            render: (text, record) => {
                return (
                    <span key={Math.random()}>
                        <Dropdown overlay={(
                            <Menu>
                                <Menu.Item onClick={this.props.rootStore.podStore.toggleEditVisible(record)}>
                                   编辑
                                </Menu.Item>
                                <SubMenu title="删除字段">
                                    {
                                        this.deleteItem(record)
                                    }
                                </SubMenu>
                                <SubMenu title="修改字段">
                                    {
                                        this.updateItem(record)
                                    }
                                </SubMenu>
                                <Menu.Item onClick = {this.props.rootStore.configMapStore.setMapAndKey(record,'')}>
                                    新增字段
                                </Menu.Item>
                                <Menu.Item>
                                    <Popconfirm onConfirm={this.props.rootStore.podStore.delete(record)} title="确认删除?">
                                        删除
                                    </Popconfirm>
                                </Menu.Item>
                            </Menu>
                        )}>
                            <Button icon="api" size={"small"}>操作</Button>
                        </Dropdown>
                    </span>
                )
            }
        }
    ];

    updateItem=(record)=>{
        const store = this.props.rootStore.configMapStore;
        let items=[];
        for( let key in record.data){
            items.push(
                <Menu.Item key={key} onClick = {store.setMapAndKey(record,key)}>
                    {key}
                </Menu.Item>
            )
        }
        return items;
    };


    deleteItem=(record)=>{
        let items=[];
        for( let key in record.data){
            items.push(
                <Menu.Item key={key} onClick={showDeleteConfirm(record,key)}>{key}</Menu.Item>

            )
        }
        return items;
    };

    componentDidMount() {
        const store = this.props.rootStore.kubeStore;
    }

    toggleContextVisible = ()=>{
        this.setState({contextVisible : !this.state.contextVisible});
    };

    render() {
        const store = this.props.rootStore.kubeStore;
        return (
            <div>
                <Modal visible={this.props.rootStore.configMapStore.contextVisible}
                       width={800}
                       title={`编辑`}
                       footer={null}
                       onCancel={this.props.rootStore.configMapStore.toggleContextVisible}
                       maskClosable={false}
                       destroyOnClose={true}
                       key="3"
                >
                    <ConfigMapContext />
                </Modal>
                <Table
                    columns={this.columns}
                    rowKey={record => record.uid}
                    dataSource={store.resources.filter(d => d)}
                    size="small"
                />
            </div>
        );

    }
}

export default ConfigMapTable;