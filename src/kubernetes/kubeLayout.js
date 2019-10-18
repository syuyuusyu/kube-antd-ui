import React, {Component} from 'react';
import {
    Row, Col, Icon, Input, Table, Dropdown, Menu, Button, Divider, Popconfirm,Tabs
} from 'antd';
import {inject, observer} from 'mobx-react';
import {PodTable} from './pod'
import Resources from './resources'
import ConfigMapTable from './configMap/configMapTable'
const { TabPane } = Tabs;


@inject('rootStore')
@observer
class KubeLayout extends Component {

    componentDidMount() {
        console.log('layout');
        const ns= this.props.match.path.replace(/\/\w+\/(\S+)$/, (w, p1) => {
            return p1;
        });
        this.props.rootStore.kubeStore.ns = ns;
        this.props.rootStore.podStore.currentNs = ns;
        this.props.rootStore.kubeStore.currentKindChange('Pod');
    }

    componentWillMount() {
        this.props.rootStore.kubeStore.currentKindChange('');
    }



    getPane =(kind)=>{
        switch(kind){
            case 'Pod':
               return  <PodTable/>
            case 'ConfigMap':
                return <ConfigMapTable/>
            default:
                return <Resources/>
        }
    };

    resourceKind = ['Pod','Service','Ingress','PersistentVolume','PersistentVolumeClaim','Deployment','ConfigMap'];

    render() {
        const store = this.props.rootStore.kubeStore;
        return (
            <div>
                <Row gutter={2} className="table-head-row">
                    <Col span={4} style={{ textAlign: 'right' }} className="col-button">
                        <Button icon="plus-circle-o" onClick={store.rootStore.podStore.toggleEditVisible('new')}>新建</Button>
                    </Col>
                </Row>
                <Tabs activeKey={store.currentKind} onChange={store.currentKindChange} tabPosition="left" >
                    {
                        this.resourceKind.map(it=>
                            (
                                <TabPane tab={it} key={it} >
                                    {
                                       this.getPane(it)
                                    }

                                </TabPane>
                            )
                        )
                    }
                </Tabs>
            </div>
        );

    }
}

export default KubeLayout;