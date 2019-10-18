import React from 'react';
import {Button,Row,Col,Transfer,notification} from 'antd';
import {inject,observer} from 'mobx-react';
import {activitiUrl, get, post, del, baseUrl, evil} from '../util';

@inject('rootStore')
@observer
class CommonTransfer extends React.Component{

    state={
        targetKeys:[],
        selectedKeys:[],
        targetRecords:[]
    };

    componentDidMount(){
        const store=this.props.rootStore.commonStore;
        store.relevantEntity=this.props.relevantEntity;
        this.load();
    }

    load=async ()=>{
        const store=this.props.rootStore.commonStore;
        let body = store.relevantEntity.deleteFlagField?{[store.relevantEntity.deleteFlagField]:1}:{};
        let targetRecords=await post(`${baseUrl}/entity/query/${store.relevantEntity.id}`,
            {...body,...store.defaultQueryObj});
        let url=
            `${baseUrl}/entity/queryRelevant/${store.currentEntity.id}/${this.props.monyTomony.id}/${store.currentTableRow[store.currentEntity.idField]}`;
        let targetKeys= await get(url);

        this.setState({
            targetRecords:targetRecords.data,
            targetKeys:targetKeys.data.map(d=>d[store.relevantEntity.idField])
        });
    };

    handleChange = (nextTargetKeys, direction, moveKeys) => {
        console.log('handleChange');
        this.setState({targetKeys:nextTargetKeys});

    };

    handleSelectChange = (sourceSelectedKeys, targetSelectedKeys) => {
        console.log('handleSelectChange');
        this.setState({selectedKeys:[...sourceSelectedKeys, ...targetSelectedKeys]});
    };

    handleScroll = (direction, e) => {
        console.log('direction:', direction);
        console.log('target:', e.target);
    };

    handleReset = () => {
        this.setState({targetKeys:[]});
    };

    save=async ()=>{
        const store=this.props.rootStore.commonStore;
        let json=await post(`${baseUrl}/entity/saveRelevant/${store.currentEntity.id}/${this.props.monyTomony.id}`,{
            srcId:store.currentTableRow[store.currentEntity.idField],
            targetIds:this.state.targetKeys,
            });
        if (json.success) {
            notification.success({
                message: '保存成功',
            })
        } else {
            notification.error({
                message: '后台错误，请联系管理员',
            })
        }
        store.toggleOperationVisible(this.props.operationId)();
    };

    render(){
        const store=this.props.rootStore.commonStore;

        if(!store.relevantEntity){
            return <div></div>
        }
        return (
            <div>
                <Transfer
                    dataSource={this.state.targetRecords.map(d=>({key:d[store.relevantEntity.idField],title:d[store.relevantEntity.nameField]}))}
                    showSearch
                    listStyle={{width: 400, height: 310,}}
                    titles={[`所有${store.relevantEntity.entityName}`, `${store.currentEntity.entityName}关联${store.relevantEntity.entityName}`]}
                    targetKeys={this.state.targetKeys}
                    selectedKeys={this.state.selectedKeys}
                    onChange={this.handleChange}
                    onSelectChange={this.handleSelectChange}
                    onScroll={this.handleScroll}
                    render={item =>`${item.title}`}
                />
                <Row>
                    <Col span={24} style={{ textAlign: 'right' }}>
                        <Button icon="save" onClick={this.save}>保存</Button>
                        <Button icon="reload" onClick={this.handleReset}>重置</Button>

                    </Col>
                </Row>
            </div>
        );
    }
}

export default CommonTransfer;