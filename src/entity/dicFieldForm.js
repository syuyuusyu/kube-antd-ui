import React from 'react';
import {Table,Modal, Row, Col, Divider, notification, Popconfirm, Input, Icon, Button,Form} from 'antd';
import {inject, observer} from 'mobx-react';
import {baseUrl, del, post, get} from '../util';

const FormItem = Form.Item;


@inject('rootStore')
@observer
class DicFieldForm extends React.Component{

    componentDidMount(){
        const store=this.props.rootStore.entityStore;
        if (store.selectDicField) {
            this.props.form.setFieldsValue(
                {
                    text:store.selectDicField.text,
                    value:store.selectDicField.value,
                }
            );
        }
    }

    save=()=>{
        const store = this.props.rootStore.entityStore;
        this.props.form.validateFields(async (err, values) => {
            if (err) return;
            let json = await post(`${baseUrl}/dictionary/saveDicField`, {
                id:store.selectDicField.id,
                groupId:store.selectDicField.groupId,
                groupName:store.selectDicField.groupName,
                text:values.text,
                value:values.value
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
            if(store.subTables[store.selectDicField.groupId])
                store.subTables[store.selectDicField.groupId].setCurrentFields();
            store.loadallDictionary();
            store.toggleAddDicFieldVisible();
        });
    };

    render(){
        const store=this.props.rootStore.entityStore;
        const {getFieldDecorator,} = this.props.form;
        return (
            <div>
                <Form>
                    <Row gutter={24}>
                        <Col span={12}>
                            <FormItem label="字典字段">
                                {getFieldDecorator('text', {
                                    rules: [{required: true, message: '不能为空',}],
                                })(
                                    <Input placeholder="输入字段"/>
                                )}
                            </FormItem>
                        </Col>
                        <Col span={12}>
                            <FormItem label="字典值">
                                {getFieldDecorator('value', {
                                    rules: [{required: true, message: '不能为空',}],
                                })(
                                    <Input placeholder="输入值"/>
                                )}
                            </FormItem>
                        </Col>
                    </Row>
                    <Row>
                        <Col span={24} style={{textAlign: 'right'}}>
                            <Button icon="save" onClick={this.save}>保存</Button>
                            <Button type="reload" onClick={store.toggleAddDicFieldVisible}>取消</Button>
                        </Col>
                    </Row>
                </Form>
            </div>
        );

    }
}

export default Form.create()(DicFieldForm);