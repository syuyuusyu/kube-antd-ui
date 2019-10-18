import React from 'react';
import {Table,Button,Divider,Popconfirm,Modal,Icon,Spin,Row,Col,Progress} from 'antd';
import {inject, observer} from 'mobx-react';
import CreateModelForm from './createModelForm';
import '../style.css';
import FileFrom from './fileFrom';
import {activitiUrl} from "../util";


const antIcon = <Icon type="loading" style={{ fontSize: 24 }} spin />;

@inject('rootStore')
@observer
class ProcessConf extends React.Component {

    componentDidMount(){
        this.props.rootStore.activitiStore.loadProcess();
    }


    columns=[
        {dataIndex: 'id', title: 'ID',align:'center', width: 120},
        {dataIndex: 'name', title: '名称',align:'center',  width: 100},
        {dataIndex: 'key', title: '标识',align:'center',  width: 80},
        {dataIndex: 'deploymentId',title:'部署ID',align:'center', width:50},
        {dataIndex: 'version', title: '版本号',align:'center',  width: 50},
        {dataIndex: 'deploymentUrl', title: '部署URL',align:'center',  width: 150},
        // {dataIndex: 'resource', title: '流程XML', width: 150},
        // {dataIndex: 'diagramResource', title: '流程图片', width: 150},
        {dataIndex: 'suspended', title: '状态',align:'center',  width: 50,
            render:(text)=>{
                return text?'暂停':'激活';
            }
        },//deploymentId

        {
            title: '操作',
            width: 400,
            align:'center',
            render: (text, record) => {
                return (
                    <span>
                        <Button icon={record.suspended?'play-circle-o':'pause'} onClick={this.props.rootStore.activitiStore.changeState(record.id,record.suspended)} size='small'>
                            {
                                record.suspended?'激活':'挂起'
                            }
                            </Button>
                        <Divider type="vertical"/>
                        <Button icon="upload" onClick={this.props.rootStore.activitiStore.toModel(record)} size='small'>转化为模型</Button>
                         <Divider type="vertical"/>
                        <Button icon="file-excel" href={`${activitiUrl}/process/resource/read?procDefId=${record.id}&resType=xml`} target='_blank' size='small'>查看流程XML</Button>
                         <Divider type="vertical"/>
                        <Button icon="picture" href={`${activitiUrl}/process/resource/read?procDefId=${record.id}&resType=image`} target='_blank' size='small'>查看流程图片</Button>
                        <span>
                            <Divider type="vertical"/>
                            <Popconfirm onConfirm={this.props.rootStore.activitiStore.deleteProcess(record.deploymentId)} title="确认删除?">
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
        return (
            <div>
                <Row gutter={8} className="table-head-row">
                    <Col span={8} style={{ textAlign: 'right' }} className="col-button">
                        <Button icon="upload" onClick={store.togglerFileFormVisible} size='default'>上传模型</Button>
                    </Col>
                </Row>
                <Modal visible={store.fileFormVisible}
                       width={400}
                       title={`上传模型`}
                       footer={null}
                       onCancel={store.togglerFileFormVisible}
                       maskClosable={false}
                       destroyOnClose={true}
                >
                    <FileFrom />
                </Modal>
                <Table columns={this.columns}
                       rowKey={record => record.id}
                       dataSource={store.process.filter(d => d)}
                       rowSelection={null}
                       size="small"
                       scroll={{y: 800}}
                />
            </div>
        );
    }
}

export default ProcessConf;