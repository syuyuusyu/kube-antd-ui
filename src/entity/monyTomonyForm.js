import React from 'react';
import {Form, Row, Col, Input, Button, Select, Modal, Progress, InputNumber, notification} from 'antd';
import {inject, observer} from 'mobx-react';
import {baseUrl, get, post} from "../util";
import '../style.css';

const FormItem = Form.Item;
const Option = Select.Option;


@inject('rootStore')
@observer
class MonyToMonyForm extends React.Component {

    state={
        idFileds:[]
    };


    save = () => {
        const store = this.props.rootStore.entityStore;
        this.props.form.validateFields(async (err, values) => {
            if (err) return;
            let json = await post(`${baseUrl}/entity/saveConfig/entity_mony_to_mony/id`, {
                ...values,
                id: store.currentMonyToMony ? store.currentMonyToMony.id : null,
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
        store.toggleMonyToMonyFormVisible();
        store.loadMonyToMonys();
    };

    selectelationTable=(value)=>{
        const store = this.props.rootStore.entityStore;
        let columns=store.originalColumns
            .filter(d=>d.table_name===value && d.column_key!=='PRI');
        this.setState({idFileds:columns});

    };

    componentDidMount() {
        const store = this.props.rootStore.entityStore;
        store.loadTableNames();
        if (store.currentMonyToMony) {
            this.selectelationTable(store.currentMonyToMony.relationTable);
            this.props.form.setFieldsValue(
                {
                    ...store.currentMonyToMony,
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
                    <FormItem label="关系名称">
                        {getFieldDecorator('name', {
                            rules: [{required: true, message: '不能为空',}],
                            validateTrigger: 'onBlur'
                        })(
                            <Input placeholder="关系名称"/>
                        )}
                    </FormItem>
                    <FormItem label="表一名称">
                        {getFieldDecorator('firstTable', {
                            rules: [{required: true, message: '不能为空',}],
                            validateTrigger: 'onBlur'
                        })(
                            <Select >
                                {
                                    store.tableNames.filter(d => d).map(o =>
                                        <Option key={o.tableName} value={o.tableName}>{o.tableName}</Option>)
                                }
                            </Select>
                        )}
                    </FormItem>
                    <FormItem label="表二名称">
                        {getFieldDecorator('secondTable', {
                            rules: [{required: true, message: '不能为空',}],
                            validateTrigger: 'onBlur'
                        })(
                            <Select >
                                {
                                    store.tableNames.filter(d => d).map(o =>
                                        <Option key={o.tableName} value={o.tableName}>{o.tableName}</Option>)
                                }
                            </Select>
                        )}
                    </FormItem>
                    <FormItem label="关联表名称">
                        {getFieldDecorator('relationTable', {
                            rules: [{required: true, message: '不能为空',}],
                            validateTrigger: 'onBlur'
                        })(
                            <Select onChange={this.selectelationTable}>
                                {
                                    store.tableNames.filter(d => d).map(o =>
                                        <Option key={o.tableName} value={o.tableName}>{o.tableName}</Option>)
                                }
                            </Select>
                        )}
                    </FormItem>
                    <FormItem label="表一ID字段">
                        {getFieldDecorator('firstIdField', {
                            rules: [{required: true, message: '不能为空',}],
                            validateTrigger: 'onBlur'
                        })(
                            <Select>
                                {
                                    this.state.idFileds.map(o =>
                                        <Option key={o.column_name} value={o.column_name}>{o.column_name}</Option>)
                                }
                            </Select>
                        )}
                    </FormItem>
                    <FormItem label="表二ID字段">
                        {getFieldDecorator('secondIdField', {
                            rules: [{required: true, message: '不能为空',}],
                            validateTrigger: 'onBlur'
                        })(
                            <Select>
                                {
                                    this.state.idFileds.map(o =>
                                        <Option key={o.column_name} value={o.column_name}>{o.column_name}</Option>)
                                }
                            </Select>
                        )}
                    </FormItem>

                    <Row>
                        <Col span={24} style={{textAlign: 'right'}}>
                            <Button icon="save" onClick={this.save}>保存</Button>
                            <Button type="reload" onClick={store.toggleMonyToMonyFormVisible}>取消</Button>
                        </Col>
                    </Row>
                </Form>
            </div>
        );

    }
}

export default Form.create()(MonyToMonyForm);