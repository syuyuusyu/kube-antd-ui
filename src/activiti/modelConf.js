import React from 'react';
import {Table,Button,Divider,Popconfirm,Modal,Icon,Spin,Row,Col,Progress} from 'antd';
import {inject, observer} from 'mobx-react';
import CreateModelForm from './createModelForm';
import '../style.css';
import {activitiUrl} from "../util";


const antIcon = <Icon type="loading" style={{ fontSize: 24 }} spin />;

@inject('rootStore')
@observer
class ModelConf extends React.Component {

    componentDidMount(){
        this.props.rootStore.activitiStore.loadModles();
    }


    columns=[
        {dataIndex: 'id', title: 'ID', width: 50},
        {dataIndex: 'name', title: '名称', width: 100},
        {dataIndex: 'key', title: '标识', width: 100},
        {dataIndex: 'version', title: '版本号', width: 50},
        {dataIndex: 'deploymentId', title: '部署ID', width: 50},
        {dataIndex: 'deploymentUrl', title: '部署URL', width: 150},
        {dataIndex: 'sourceUrl', title: '资源URL', width: 150},
        {
            title: '操作',
            width: 250,
            render: (text, record) => {
                return (
                    <span>
                        <Button icon="code-o" href={`${activitiUrl}/modelPage?modelId=${record.id}`} target='_blank' size='small'>编辑</Button>
                        <Divider type="vertical"/>
                        <Button icon="rocket" onClick={this.props.rootStore.activitiStore.modelDeploy(record.id)} size='small'>部署</Button>
                        <Divider type="vertical"/>
                        <Button icon="export" onClick={this.props.rootStore.activitiStore.modelExport(record)} size='small'>导出</Button>
                        <span>
                            <Divider type="vertical"/>
                            <Popconfirm onConfirm={this.props.rootStore.activitiStore.deleteMdel(record.id)} title="确认删除?">
                                <Button  icon="delete" onClick={null} size='small'>删除</Button>
                            </Popconfirm>
                        </span>
                    </span>
                );

            }
        }
    ];


    render() {
        const store = this.props.rootStore.activitiStore;
        console.log(1111);
        return (
            <div>
                <Row gutter={8} className="table-head-row">
                    <Col span={8} style={{ textAlign: 'right' }} className="col-button">
                        <Button icon="upload" onClick={store.toggleCreateModelFormVisible} size='default'>新建工作流模型</Button>
                    </Col>
                </Row>
                <Modal visible={store.createModelFormVisible}
                       width={400}
                       title={`新建工作流模型`}
                       footer={null}
                       onCancel={store.toggleCreateModelFormVisible}
                       maskClosable={false}
                       destroyOnClose={true}
                >
                    <CreateModelForm />
                </Modal>
                <Table columns={this.columns}
                       rowKey={record => record.id}
                       dataSource={store.modeles.filter(d => d)}
                       rowSelection={null}
                       size="small"
                       scroll={{y: 800}}
                />
            </div>
        );
    }
}

export default ModelConf;