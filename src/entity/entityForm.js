import React from 'react';
import {Form, Row, Col, Input, Button, Select, Modal, Progress, InputNumber, notification} from 'antd';
import {inject, observer} from 'mobx-react';
import {baseUrl, get, post} from "../util";
import '../style.css';

const FormItem = Form.Item;
const Option = Select.Option;


@inject('rootStore')
@observer
class EntityForm extends React.Component {

    state = {
        queryType: '1',
        parentEntityIdSeleted: false,
        parentEntityIdSeletedMsg: '',
        pidFieldColumns: (function (_this) {
            const store = _this.props.rootStore.entityStore;
            if (store.isFormUpdate) {
                return store.originalColumns.filter(d => d.table_name === store.currentEntity.tableName);
            } else {
                return [];
            }
        })(this)
    };

    parentEntityIdSeleted = (value) => {
        const store = this.props.rootStore.entityStore;
        if (value) {
            this.setState({
                parentEntityIdSeleted: true,
                parentEntityIdSeletedMsg: '选中父实体ID时该字段必填',
            });
        } else {
            this.setState({
                parentEntityIdSeleted: false,
                parentEntityIdSeletedMsg: '',
            });
        }
    };

    selectTable = (value) => {
        const store = this.props.rootStore.entityStore;
        let columns = store.originalColumns
            .filter(d => d.table_name === value);
        if (columns.filter(d => d.column_key === 'PRI').length === 1) {
            this.props.form.setFieldsValue(
                {idField: columns[0]['column_name']}
            );
            this.setState({pidFieldColumns: columns});
        } else {
            this.props.form.setFieldsValue(
                {idField: null}
            );
            this.setState({pidFieldColumns: []});
            notification.error({
                message: '实体配置对应的表必须有唯一主键'
            });
        }
    };


    save = () => {
        const store = this.props.rootStore.entityStore;
        this.props.form.validateFields(async (err, values) => {
            if (err) return;
            let queryField;
            if (values.queryType == '1') {
                queryField = values.queryField.length > 0 ? values.queryField.join(',') : null;
            } else {
                queryField = values.queryField;
            }
            let orderField = values.orderField && values.orderField.length > 0 ? values.orderField.join(',') : null;
            let mmQueryField= values.mmQueryField && values.mmQueryField.length > 0 ? values.mmQueryField.join(',') : null;
            let fuzzyQueryField = values.fuzzyQueryField && values.fuzzyQueryField.length > 0 ? values.fuzzyQueryField.join(',') : null;
            delete values.queryType;
            let json = await post(`${baseUrl}/entity/saveConfig/entity/id`, {
                ...values,
                id: store.currentEntity ? store.currentEntity.id : null,
                queryField: queryField,
                orderField: orderField,
                mmQueryField:mmQueryField,
                fuzzyQueryField:fuzzyQueryField
            });
            if (json.success) {
                notification.info({
                    message: '保存成功'
                });
            } else {
                notification.error({
                    message: '保存失败'
                });
            }

        });
        store.toggleEntityFormVisible();
        store.loadEntitys.defer()(1000);
    };

    queryFieldChange = (value) => {
        console.log(value);
    };

    queryTypeChange = (value) => {
        console.log('queryTypeChange');
        this.setState({queryType: value});
        let queryField = value == '0' ? '' : [];
        this.props.form.setFieldsValue(
            {
                queryField: queryField
            }
        );
    };

    componentDidMount() {
        const store = this.props.rootStore.entityStore;
        store.loadFilterTableNames();
        if (store.isFormUpdate) {
            store.loadColumns();
        }
        let queryField;
        let queryType;
        if (store.currentEntity) {
            if (/^((?:\/?\w+)+)\/(\w+)$/.test(store.currentEntity.queryField)) {
                queryField = store.currentEntity.queryField;
                this.setState({queryType: '0'});
                queryType = '0';
            } else {
                queryField = store.currentEntity.queryField ? store.currentEntity.queryField.split(',').map(c => parseInt(c)) : [];
                queryType = '1';
            }
            this.props.form.setFieldsValue(
                {
                    ...store.currentEntity,
                    queryField: queryField,
                    queryType: queryType,
                    orderField: store.currentEntity.orderField ? store.currentEntity.orderField : [],
                    mmQueryField: store.currentEntity.mmQueryField ? store.currentEntity.mmQueryField : [],
                    fuzzyQueryField: store.currentEntity.fuzzyQueryField ? store.currentEntity.fuzzyQueryField.split(',').map(c => parseInt(c)) : [],
                }
            );
        } else {
            this.props.form.setFieldsValue(
                {
                    queryField: this.state.queryType == '1' ? [] : '',
                    queryType: this.state.queryType
                }
            );
        }

    }


    render() {
        const store = this.props.rootStore.entityStore;
        const {getFieldDecorator,} = this.props.form;
        return (
            <div>
                <Form>

                    <FormItem label="表名">
                        {getFieldDecorator('tableName', {
                            rules: [{required: true, message: '表名不能为空',}],
                            validateTrigger: 'onBlur'
                        })(
                            <Select onSelect={this.selectTable} disabled={store.isFormUpdate}>
                                {
                                    store.tableNames.filter(d => d).map(o =>
                                        <Option key={o.tableName} value={o.tableName}>{o.tableName}</Option>)
                                }
                            </Select>
                        )}
                    </FormItem>
                    <FormItem label="编码">
                        {getFieldDecorator('entityCode', {})(
                            <Input placeholder="编码"/>
                        )}
                    </FormItem>
                    <FormItem label="名称">
                        {getFieldDecorator('entityName')(
                            <Input placeholder="输入表名称"/>
                        )}
                    </FormItem>
                    <FormItem label="删除标示字段">
                        {getFieldDecorator('deleteFlagField')(
                            <Input placeholder="删除标示字段"/>
                        )}
                    </FormItem>
                    <FormItem label="是否可编辑">
                        {getFieldDecorator('editAble', {
                            rules: [{
                                required: true,
                                message: '不能为空',
                            }],
                        })(
                            <Select>
                                <Option value={'1'}>是</Option>
                                <Option value={'0'}>否</Option>
                            </Select>
                        )}
                    </FormItem>
                    <FormItem label="名称字段">
                        {getFieldDecorator('nameField', {
                            rules: [{
                                required: store.isFormUpdate ? true : false,
                                message: store.currentColumns.length === 0 ? '请先进行表字段配置' : '不能为空',
                            }],
                            validateTrigger: 'onBlur'
                        })(
                            store.isFormUpdate ?
                                <Select>
                                    {
                                        store.currentColumns.filter(d => d).map(o =>
                                            <Option key={o.id}
                                                    value={o.columnName}>{o.text ? o.columnName + '-' + o.text : o.columnName}</Option>)
                                    }
                                </Select>
                                :
                                <Input placeholder="保存当前实体后完成字段配置才能进行该项配置" disabled={true}/>
                        )}
                    </FormItem>
                    <FormItem label="查询方式">
                        {getFieldDecorator('queryType', {})(
                            <Select onSelect={this.queryTypeChange}>
                                <Option value={'1'}>按字段查询</Option>
                                <Option value={'0'}>自定义查询表单</Option>
                            </Select>
                        )}

                    </FormItem>
                    {
                        this.state.queryType == '1' ?
                            <div>
                                <FormItem label="查询字段">
                                    {getFieldDecorator('queryField')(
                                        store.isFormUpdate ?
                                            <Select mode="multiple" onChange={this.queryFieldChange}>
                                                {
                                                    store.currentColumns.filter(d => d).map(o =>
                                                        <Option key={o.id}
                                                                value={o.id}>{o.text ? o.columnName + '-' + o.text : o.columnName}</Option>)
                                                }
                                            </Select>
                                            :
                                            <Input placeholder="保存当前实体后完成字段配置才能进行该项配置" disabled={true}/>
                                    )}
                                </FormItem>
                                <FormItem label="模糊查询字段">
                                    {getFieldDecorator('fuzzyQueryField')(
                                        store.isFormUpdate ?
                                            <Select mode="multiple" onChange={this.queryFieldChange}>
                                                {
                                                    store.currentColumns.filter(d => d).map(o =>
                                                        <Option key={o.id}
                                                                value={o.id}>{o.text ? o.columnName + '-' + o.text : o.columnName}</Option>)
                                                }
                                            </Select>
                                            :
                                            <Input placeholder="保存当前实体后完成字段配置才能进行该项配置" disabled={true}/>
                                    )}
                                </FormItem>
                                <FormItem label="多对多关系查询">
                                    {getFieldDecorator('mmQueryField')(
                                        store.isFormUpdate ?
                                            <Select mode="multiple" >
                                                {
                                                    store.entitys.filter(d => d)
                                                        .filter(e=>{
                                                            let flag=false;
                                                            store.monyToMonys.filter(d=>d).forEach(m=>{
                                                                if(m.firstTable==e.tableName){
                                                                    if(m.secondTable==store.currentEntity.tableName){
                                                                        flag=true;
                                                                    }
                                                                }else if(m.firstTable==store.currentEntity.tableName){
                                                                    if(m.secondTable==e.tableName){
                                                                        flag=true;
                                                                    }

                                                                }
                                                            });
                                                          return flag;
                                                        }).map(o => <Option key={o.id} value={o.id}>{o.entityName}</Option>)
                                                }
                                            </Select>
                                            :
                                            <Input placeholder="保存当前实体后完成字段配置才能进行该项配置" disabled={true}/>
                                    )}
                                </FormItem>
                            </div>
                            :
                            <FormItem label="自定义表单路径">
                                {getFieldDecorator('queryField')(
                                    store.isFormUpdate ?
                                        <Input placeholder="输入自定义表单文件代码路径"/>
                                        :
                                        <Input placeholder="保存当前实体后完成字段配置才能进行该项配置" disabled={true}/>
                                )}
                            </FormItem>


                    }

                    <FormItem label="ID字段">
                        {getFieldDecorator('idField', {
                            rules: [{required: true, message: '不能为空',}],
                            validateTrigger: 'onBlur'
                        })(
                            <Input placeholder="输入ID字段" disabled={true}/>
                        )}
                    </FormItem>
                    <FormItem label="父实体表名">
                        {getFieldDecorator('parentEntityId', {})(
                            store.isFormUpdate ?
                                <Select onSelect={this.parentEntityIdSeleted}>
                                    <Option value={null}>&nbsp;</Option>
                                    {
                                        store.entitys
                                            .filter(d => store.currentEntity.id === d.id || d.id === d.parentEntityId).map(o =>
                                            <Option key={o.id} value={o.id}>{o.tableName}</Option>)
                                    }
                                </Select>
                                :
                                <Input placeholder="保存当前实体后才能配置父实体表名" disabled={true}/>
                        )}
                    </FormItem>
                    <FormItem label="父实体ID字段">
                        {getFieldDecorator('pidField', {
                            rules: [{
                                required: this.state.parentEntityIdSeleted,
                                message: this.state.parentEntityIdSeletedMsg,
                            }],
                            validateTrigger: 'onBlur'
                        })(
                            <Select disabled={!this.state.parentEntityIdSeleted}>
                                {
                                    this.state.pidFieldColumns.map(o =>
                                        <Option key={o.column_name} value={o.column_name}>{o.column_name}</Option>)
                                }
                            </Select>
                        )}
                    </FormItem>
                    <FormItem label="表单长度">
                        {getFieldDecorator('tableLength', {})(
                            <InputNumber style={{width: '100%'}}/>
                        )}
                    </FormItem>
                    <FormItem label="排序字段">
                        {getFieldDecorator('orderField')(
                            store.isFormUpdate ?
                                <Select mode="multiple">
                                    {
                                        store.currentColumns.filter(d => d).map(o =>
                                            <Option key={o.id}
                                                    value={o.columnName}>{o.text ? o.columnName + '-' + o.text : o.columnName}</Option>)
                                    }
                                </Select>
                                :
                                <Input placeholder="保存当前实体后完成字段配置才能进行该项配置" disabled={true}/>
                        )}
                    </FormItem>
                    <Row>
                        <Col span={24} style={{textAlign: 'right'}}>
                            <Button icon="save" onClick={this.save}>保存</Button>
                            <Button type="reload" onClick={store.toggleEntityFormVisible}>取消</Button>
                        </Col>
                    </Row>
                </Form>
            </div>
        );

    }
}

export default Form.create()(EntityForm);
