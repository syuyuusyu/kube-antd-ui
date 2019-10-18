import React, {Component} from 'react';
import {Form,Layout, Divider, Popconfirm, Table, Modal, Row, Col, Button, Drawer, Select, notification} from 'antd';
import {inject, observer} from 'mobx-react';
import {baseUrl, dateFtt, get} from '../util';
import CommonTree from './commonTree';
import CommonTable from './commonTable';
import QueryFrom from './queryForm';

const {Header, Footer, Sider, Content} = Layout;


const Option = Select.Option;

const EnhancedQueryFrom =  Form.create()(QueryFrom);

//import {SysOperationStore} from "./store";

//const TreeNode = Tree.TreeNode;
//const {Content, Sider} = Layout;

@inject('rootStore')
@observer
class CommonLayout extends Component {

    constructor(props) {
        super(props);
        //const store = this.props.rootStore.commonStore;

    }

    async componentWillMount(){
        console.log('componentWillMount',  this.props.match.path);

        const store = this.props.rootStore.commonStore;
        let entityId=this.props.entityId?
            this.props.entityId:
            this.props.match.path.replace(/\/\w+\/(\d+)\/?(?:\S)*/, (w, p1) => {
                return p1;
            });
        store.setEntityId(parseInt(entityId,10));

        try{
            let obj=JSON.parse(this.props.defaultQueryObj );
            store.setDefaultQueryObj(obj);
        }catch (e){
            let obj = Object.assign({}, this.props.defaultQueryObj);
            store.setDefaultQueryObj(obj);
        }
        console.log(store.defaultQueryObj);
        await store.loadAllEntitys();
        await store.loadAllDictionary();
        await store.loadAllColumns();
        await store.loadAllMonyToMony();
        await store.loadAllOperations();
        store.setshouldRender(true);


    }

    componentWillUnmount(){
        console.log('componentWillUnmount',  this.props.match.path);
        this.props.rootStore.commonStore.clean();

    }


    createQyeryForm = () => {
        const store = this.props.rootStore.commonStore;
        if (!store.currentEntity.queryField || /^\d/.test(store.currentEntity.queryField)) {
            return <EnhancedQueryFrom wrappedComponentRef={(form) => {store.refQueryForm(form ? form.wrappedInstance : null)}}/>
        } else {
            const op = {};
            if (store.currentEntity.queryField) {
                console.log(store.currentEntity.queryField);
                store.currentEntity.queryField.replace(/^((?:\/?\w+)+)\/(\w+)$/, (w, p1, p2) => {
                    op.pagePath = p1, op.pageClass = p2;
                });
            }
            console.log(op.pagePath,op.pageClass);
            return React.createElement(require('../'+op.pagePath)[op.pageClass]);
        }
    };

    state = {
        collapsed: false,
    };

    toggle = () => {
        this.setState({
            collapsed: !this.state.collapsed,
        });
    }

    render() {
        const store = this.props.rootStore.commonStore;
        if(!store.shouldRender){
            return <div></div>
        }


        return (
            <Layout style={{height: "100%"}}>
                {
                    store.hasParent ?
                        <Sider width={300}
                               style={{ background: '#fff',overflowY: 'auto', height: "100%" }}
                               trigger={null}
                               collapsible
                               collapsed={this.state.collapsed}
                        >
                            <CommonTree commonStore={store}/>
                        </Sider>
                        :
                        ''
                }
                <Content  style={{height: "100%"}} >
                    <Layout  style={{height: "100%"}}>
                        <Header style={{ background: '#fff', padding: 5,height:'auto'}}>
                            {
                                this.createQyeryForm()
                            }
                        </Header>
                        <Content >

                            <CommonTable  commonStore={store} canSelectRows={this.props.canSelectRows}/>
                        </Content>
                    </Layout>
                </Content>
            </Layout>
        );
    }

}

export default CommonLayout;