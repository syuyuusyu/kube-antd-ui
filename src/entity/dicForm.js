import React from 'react';
import {Table,Modal, Row, Col, Divider, notification, Popconfirm, Input, Icon, Button,Form} from 'antd';
import {inject, observer} from 'mobx-react';
import {baseUrl, del, post, get} from '../util';

const FormItem = Form.Item;

@inject('rootStore')
@observer
class DicForm extends React.Component{

    componentDidMount(){
        const store=this.props.rootStore.entityStore;
        if (store.selectDic) {
            this.props.form.setFieldsValue(
                {groupName:store.selectDic.groupName}
            );
        }
    }

    save=()=>{
        const store = this.props.rootStore.entityStore;
        this.props.form.validateFields(async (err, values) => {
            if (err) return;
            let json = await post(`${baseUrl}/dictionary/saveDic`, {
                groupId:store.selectDic?store.selectDic.groupId:null,
                groupName:values.groupName
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
            if(store.selectDic){
                store.subTables[store.selectDic.groupId].setCurrentFields();
            }

            store.loadallDictionary();
            store.toggleAddDicVisible();
        });
    };

    render(){
        const store=this.props.rootStore.entityStore;
        const {getFieldDecorator,} = this.props.form;
        return (
            <div>
                <Form>
                    <Row gutter={24}>
                        <Col span={24}>
                            <FormItem label="字典名称">
                                {getFieldDecorator('groupName', {
                                    rules: [{required: true, message: '不能为空',}],
                                })(
                                    <Input placeholder="输入字典名称"/>
                                )}
                            </FormItem>
                        </Col>
                    </Row>
                    <Row>
                        <Col span={24} style={{textAlign: 'right'}}>
                            <Button icon="save" onClick={this.save}>保存</Button>
                            <Button type="reload" onClick={store.toggleAddDicVisible}>取消</Button>
                        </Col>
                    </Row>
                </Form>
            </div>
        );

    }
}

export default Form.create()(DicForm);