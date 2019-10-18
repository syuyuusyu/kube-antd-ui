import React from 'react';
import {Form, Row, Col, Input, Button, Select, notification,AutoComplete,Breadcrumb,DatePicker,Popconfirm, Divider,Cascader} from 'antd';
import {inject, observer} from 'mobx-react';
import {baseUrl, get, post} from "../util";
import moment from 'moment';
import 'moment/locale/zh-cn';
import '../style.css';


const RangePicker = DatePicker.RangePicker;
const FormItem = Form.Item;
const Option = AutoComplete.Option;
const formItemLayout = {
    labelCol: {
        xs: { span: 24},
        sm: { span: 8 },
    },
    wrapperCol: {
        xs: { span: 24 },
        sm: { span: 16 },
    },
};

const isArrsy=function(v){
    return toString.call(v)=="[object Array]";
};

@inject('rootStore')
@observer
class QueryForm extends React.Component {

    state={};



    componentWillMount() {
        //this.setState({});
        const store = this.props.rootStore.commonStore;
        const queryFieldIds=store.currentEntity.queryField?store.currentEntity.queryField.split(','):[];
        const mmQueryFieldIds=store.currentEntity.mmQueryField?store.currentEntity.mmQueryField.split(','):[];
        const fuzzyQueryFieldIds=store.currentEntity.fuzzyQueryField?store.currentEntity.fuzzyQueryField.split(','):[];
        this.queryColumn=queryFieldIds.map(id=>store.allColumns.find(_=>_.id===parseInt(id))).map(_=>({..._,type:'field'}));
        if(mmQueryFieldIds.length>0){
            this.queryColumn=this.queryColumn.concat(mmQueryFieldIds.map(id=>store.allEntitys.find(_=>_.id===parseInt(id))).map(
                e=>{
                    let mony;
                    store.allMonyToMony.forEach(m=>{
                        if(m.firstTable == e.tableName && m.secondTable == store.currentEntity.tableName){
                            mony=m;
                        }
                        if(m.firstTable == store.currentEntity.tableName && m.secondTable == e.tableName){
                            mony=m;
                        }
                    });
                    return {...e,type:'mm',mm:mony}
                }
            ));
        }
        if(fuzzyQueryFieldIds.length>0){
            this.queryColumn=this.queryColumn.concat(
                fuzzyQueryFieldIds.map(id=>store.allColumns.find(_=>_.id===parseInt(id))).map(_=>({..._,type:'fuzzy'}))
            );
        }
        this.setCandidate();

    }

    setCandidate=(colunmName)=>{
        const store = this.props.rootStore.commonStore;
        this.queryColumn.forEach(async col=>{
            if(colunmName==col.id){
                return;
            }
            if(col.type=='field'){
                console.log('-------',col,'----------');
                this.state[col.columnName]=[];
                if(col.foreignKeyId){
                    let fcol=store.allColumns.find(d=>d.id==col.foreignKeyId);
                    let entity=store.allEntitys.find(d=>d.id==fcol.entityId);
                    if( entity && entity.parentEntityId && entity.parentEntityId==entity.id){
                        await this.setTreeCandidate(entity);
                        return
                    }
                }
                this.state[`filter${col.columnName}`]=[];
                let candidateObj={};
                for(let key in this.state){
                    if(key.startsWith('candidate')){
                        let newk=key.replace(/^candidate(\S+)$/,(w,p)=>p);
                        candidateObj[newk]=this.state[key];
                    }
                }

                console.log(this.state);
                console.log('candidateObj',candidateObj);
                console.log('treeSelectedObj',store.treeSelectedObj);
                console.log('defaultQueryObj',store.defaultQueryObj);
                let json=await post(`${baseUrl}/entity/queryCandidate/${col.id}`,{...candidateObj,...store.treeSelectedObj,...store.defaultQueryObj});
                json.unshift({value:null,text:null});
                this.setState({[col.columnName]:json});
                this.setState({[`filter${col.columnName}`]:json});
            }else if(col.type=='mm'){
                this.state[col.tableName]=[];
                if(col.parentEntityId && col.parentEntityId==col.id){
                    let topParentRecord = await get(`${baseUrl}/entity/topParentRecord/${col.parentEntityId}`);
                    let json = await post(`${baseUrl}/entity/query/${col.id}`, {
                        [col.pidField]: topParentRecord[col.idField]
                    });
                    json=json.data.map(o=>({value:o[col.idField],label:o[col.nameField],isLeaf: false}));
                    this.setState({[col.tableName]:json});
                    return;
                }
                this.state[`filter${col.tableName}`]=[];
                let json=await post(`${baseUrl}/entity/query/${col.id}`);
                json=json.data;
                json=json.map(o=>({value:o[col.idField],text:o[col.nameField]}));
                json.unshift({value:null,text:null});
                this.setState({[col.tableName]:json});
                this.setState({[`filter${col.tableName}`]:json});
            }

        });
    };

    setTreeCandidate =async (entity)=>{
        let topParentRecord = await get(`${baseUrl}/entity/topParentRecord/${entity.parentEntityId}`);
        let json = await post(`${baseUrl}/entity/query/${entity.id}`, {
            [entity.pidField]: topParentRecord[entity.idField]
        });
        json=json.data.map(o=>({value:o[entity.idField],label:o[entity.nameField],isLeaf: false}));
        this.setState({[entity.tableName]:json});
    };

    onSelect=(colunmName)=>((value)=>{
        this.setState(
            {[`candidate${colunmName}`]:value},
            ()=>this.setCandidate(colunmName)
        );

    });



    handleSearch=(colunmName)=>((value)=>{
        let regExp = new RegExp('.*'+value.trim()+'.*','i');
        const filtered=this.state[colunmName].filter(o=> regExp.test(o.text));
        this.setState({[`filter${colunmName}`]:filtered});
    });

    query=()=>{
        const store = this.props.rootStore.commonStore;
        this.props.form.validateFields(async (err, values) => {
            if (err) return;
            for(let key in values){
                if(!values[key]) {
                    delete values[key];
                    continue;
                }
                if(isArrsy(values[key]) && values[key].length==0){
                    delete values[key];
                    continue;
                }
                if(key.startsWith('mm')){
                    if(isArrsy(values[key])){
                        values[key]=values[key][values[key].length-1];
                    }
                }
                if(key.startsWith('ftree_')){
                    if(isArrsy(values[key])){
                        let value=values[key][values[key].length-1];
                        let newkey='';
                        key.replace(/^ftree_(\S+)$/,(w,p)=>{newkey=p});
                        values[newkey]=value;
                        delete values[key];
                        continue;
                    }
                }
            }
            this.queryColumn.filter(d=>d.type=='field').forEach(c=>{
                if(c.columnType==='timestamp'){
                    if(values[c.columnName] &&values[c.columnName].length===2){
                        values[c.columnName]=[
                            values[c.columnName][0].format('YYYY-MM-DD HH:mm:ss'),
                            values[c.columnName][1].format('YYYY-MM-DD HH:mm:ss')
                        ];
                    }

                }
            });
            store.queryObj={...values,start:0,pageSize:store.pagination.pageSize,page:1};
            store.queryTable();
            for(let key in this.state){
                if(key.startsWith('candidate')){
                    delete this.state[key];
                }
            }
            this.setCandidate();

        });
    };

    loadData=(entity,colName)=>(async (selectedOptions,aaa)=>{
        const targetOption = selectedOptions[selectedOptions.length - 1];
        const value=targetOption.value;
        targetOption.loading = true;
        let json = await post(`${baseUrl}/entity/query/${entity.id}`, {
            [entity.pidField]:value
        });
        json=json.data.map(o=>({value:o[entity.idField],label:o[entity.nameField],isLeaf: false}));
        targetOption.loading = false;
        targetOption.children=json;
        this.setState({[colName]:[...this.state[colName]]});
    });


    createMMItem=(tarEntity)=>{
        const store = this.props.rootStore.commonStore;
        const {getFieldDecorator,} = this.props.form;
        if(tarEntity.parentEntityId && tarEntity.parentEntityId==tarEntity.id){
            //console.log(this.loadData(tarEntity,tarEntity.tableName));
            return (
                <FormItem style={{marginBottom: '5px'}} key={tarEntity.tableName}
                          label={'相关'+tarEntity.entityName} {...formItemLayout}>
                    {getFieldDecorator(`mm_${tarEntity.id}_${tarEntity.mm.id}`, {})(
                        <Cascader
                            options={this.state[tarEntity.tableName]}
                            loadData={this.loadData(tarEntity,tarEntity.tableName)}
                            changeOnSelect
                            placeholder=""
                        />
                    )}
                </FormItem>
            );
        }else{
            return (
                <FormItem style={{marginBottom: '5px'}} key={tarEntity.tableName}
                          label={'相关'+tarEntity.entityName} {...formItemLayout}>
                    {getFieldDecorator(`mm_${tarEntity.id}_${tarEntity.mm.id}`, {})(
                        <AutoComplete
                            onSearch={this.handleSearch(tarEntity.tableName)}
                            //onSelect={this.onSelect(tarEntity.tableName)}
                            dataSource={this.state[`filter${tarEntity.tableName}`].map(_ => {
                                if (_.value)
                                    return <Option style={{whiteSpace:'normal',wordWrap:'break-word',wordBreak:'break-all'}} key={_.value} value={_.value + ''}>{_.text}</Option>
                                else
                                    return <Option key={null} value={''} style={{color: 'white'}}>&nbsp;</Option>
                            })}
                        >
                            <Input/>
                        </AutoComplete>
                    )}
                </FormItem>
            );
        }
    };

    createfuzzyItem=(col)=>{
        const {getFieldDecorator,} = this.props.form;
        return (
            <FormItem style={{marginBottom: '5px'}} key={col.id}
                      label={col.text ? col.text : col.columnName} {...formItemLayout}>
                {getFieldDecorator('fuzzy_'+col.columnName, {})(
                    <Input placeholder="输入信息将模糊匹配" />
                )}
            </FormItem>
        );
    };

    createItem=(col)=>{
        const store = this.props.rootStore.commonStore;
        const {getFieldDecorator,} = this.props.form;
        if(col.dicGroupId){
            return (
                <FormItem style={{marginBottom: '5px'}} key={col.id}
                          label={col.text ? col.text : col.columnName}
                          {...formItemLayout}
                          >
                    {getFieldDecorator(col.columnName, {
                        rules: [{

                        }],
                    })(
                        <Select onSelect={this.onSelect(col.id)} >
                            <Option key={null} value={''} style={{color: 'white'}}>&nbsp;</Option>
                            {
                                store.allDictionary
                                    .filter(d=>d.groupId===col.dicGroupId)
                                    .filter(d=>{
                                        if(!store.defaultQueryObj[col.columnName]){
                                            return true;
                                        }else{
                                            if(Object.prototype.toString.call(store.defaultQueryObj[col.columnName])==="[object Array]"){
                                                return store.defaultQueryObj[col.columnName].find(_=>_==d.value);
                                            }else{
                                                return d.value==store.defaultQueryObj[col.columnName];
                                            }
                                        }
                                    })
                                    .map((_,index)=><Option key={_.value+index} value={_.value+''}>{_.text}</Option>)
                            }
                        </Select>
                    )}
                </FormItem>
            );
        }
        if(col.columnType==='timestamp'){
            return (
                <FormItem style={{marginBottom: '5px'}} key={col.id}
                          label={col.text ? col.text : col.columnName} {...formItemLayout}>
                    {getFieldDecorator(col.columnName, {})(
                        <RangePicker showTime format="YYYY-MM-DD HH:mm:ss" style={{width:'100%'}}/>
                    )}
                </FormItem>
            );
        }

        if(col.foreignKeyId){
            let fcol=store.allColumns.find(d=>d.id==col.foreignKeyId);
            let entity=store.allEntitys.find(d=>d.id==fcol.entityId);

            if( entity && entity.parentEntityId && entity.parentEntityId==entity.id){
                return (
                    <FormItem style={{marginBottom: '5px'}} key={entity.tableName}
                              label={entity.entityName} {...formItemLayout}>
                        {getFieldDecorator('ftree_'+col.columnName, {})(
                            <Cascader
                                options={this.state[entity.tableName]}
                                loadData={this.loadData(entity,entity.tableName)}
                                changeOnSelect
                                placeholder=""
                            />
                        )}
                    </FormItem>
                );
            }
        }
        return (
            <FormItem style={{marginBottom: '5px'}} key={col.id}
                      label={col.text ? col.text : col.columnName} {...formItemLayout}>
                {getFieldDecorator(col.columnName, {})(
                    <AutoComplete
                        onSearch={this.handleSearch(col.columnName)}
                        onSelect={this.onSelect(col.id)}
                        //allowClear={true}
                        // dataSource={this.state[`filter${col.columnName}`].map((_,index)=> {
                        //     if (_.value)
                        //         return <Option style={{whiteSpace:'normal',wordWrap:'break-word',wordBreak:'break-all'}} key={index} value={_.value + ''}>{_.text}</Option>
                        //     else{
                        //         return <Option key={index} value={''} style={{color: 'white'}}>&nbsp;</Option>
                        //     }
                        //
                        // })}
                        dataSource={[<Option key={-1} value={''} style={{color: 'white'}}>&nbsp;</Option>]
                            .concat(this.state[`filter${col.columnName}`].filter(_=>_.value).map((_,index)=>
                                <Option style={{whiteSpace:'normal',wordWrap:'break-word',wordBreak:'break-all'}} key={index} value={_.value + ''}>{_.text}</Option>

                        ))}
                    >
                        <Input/>
                    </AutoComplete>
                )}
            </FormItem>
        )


    };

    createItems=()=>{
        const store = this.props.rootStore.commonStore;
        if(!store.currentEntity.queryField){
            return '';
        }
        const idMatrix=[[],[],[]];
        this.queryColumn.forEach((col,index)=>{
            idMatrix[index%3].push(col);
        });
        return (
            <Row gutter={24}>
                {
                    idMatrix.map((row,index)=>{
                        return <Col span={8} key={index} style={{paddingLeft: '5px'}}>
                            {
                                row.map(col=>{
                                    if(col.type=='field'){
                                        return this.createItem(col);
                                    }else if(col.type=='mm'){
                                        return this.createMMItem(col);
                                    }else if(col.type=='fuzzy'){
                                        return this.createfuzzyItem(col);
                                    }

                                })
                            }
                        </Col>
                    })
                }
            </Row>
        );

    };


    render() {
        const store=this.props.rootStore.commonStore;
        return (
            <div>
                <Form layout='horizontal'>
                    {this.createItems()}
                    <Row>
                        <Col span={18} style={{textAlign: 'left'}}>
                            {
                                store.hasParent?
                                    <Breadcrumb style={{ margin: '10px 8px' }}>
                                        <Breadcrumb.Item>当前路径:</Breadcrumb.Item>
                                        {
                                            store.currentRoute
                                                .filter(d=>d).map(r=><Breadcrumb.Item key={r.id}>{r.text}</Breadcrumb.Item>)
                                        }
                                    </Breadcrumb>
                                    :
                                    ''
                            }

                        </Col>
                        <Col span={6} style={{textAlign: 'right'}}>
                            {
                                store.operations.filter(d => d && d.location=='1')
                                    .map((m,index) => {
                                        if (m.type === '3') {
                                            return (
                                                    <Popconfirm key={index} onConfirm={store.execFun(store, m.function)}
                                                                title={`确认${m.name}?`}>
                                                        <Button icon={m.icon} onClick={null}>{m.name}</Button>
                                                    </Popconfirm>

                                            );
                                        }
                                        return (
                                                <Button icon={m.icon} onClick={this.showOperationForm(record, m.id)}
                                                        >{m.name}</Button>

                                        );
                                    })
                            }
                            {
                                store.currentEntity.queryField?
                                    <Button icon="search" onClick={this.query}>查询</Button>
                                    :''
                            }
                            {
                                store.currentEntity.editAble=='1'?
                                    <Button icon="plus-circle-o" onClick={store.showCreateForm(null,false)}>新建</Button>
                                    :''
                            }

                        </Col>
                    </Row>
                </Form>
            </div>
        );

    }
}

export default QueryForm;
