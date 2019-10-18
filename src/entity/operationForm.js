import React from 'react';
import {Form, Row, Col, Input, Button, Select, Modal, Progress, InputNumber, notification,Icon} from 'antd';
import {inject, observer} from 'mobx-react';
import {baseUrl, get, post} from "../util";
import IconSelect from '../iconSelect';
import {UnControlled as CodeMirror} from 'react-codemirror2'
import 'codemirror/mode/javascript/javascript';
import 'codemirror/addon/hint/show-hint.css';
import 'codemirror/addon/hint/show-hint.js';
import 'codemirror/addon/hint/javascript-hint.js';
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/material.css';
import 'codemirror/theme/ambiance.css';
import '../style.css';

const FormItem = Form.Item;
const Option = Select.Option;

@inject('rootStore')
@observer
class OperationForm extends React.Component {

    state={
        type:'1'
    };

    funMirrValue;

    save =  () => {
        const store = this.props.rootStore.entityStore;
        this.props.form.validateFields(async (err, values) => {
            if (err) return;
            console.log(values);
            let json = await post(`${baseUrl}/entity/saveConfig/entity_operation/id`, {
                ...values,
                id: store.currentOperation ? store.currentOperation.id : null,
                entityId:store.currentEntity.id,
                function:this.funMirrValue
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
        store.toggleOperationFormVisible();
        store.loadEntityOperations.defer()(1000);

    };

    typeSelect=(value)=>{
        this.setState({type:value},()=>{
            const store = this.props.rootStore.entityStore;
            if(store.currentOperation){
                switch (value){
                    case '1':
                        this.props.form.setFieldsValue({monyToMonyId:store.currentOperation.monyToMonyId});
                        break;
                    case '2':
                        this.props.form.setFieldsValue({
                            pagePath:store.currentOperation.pagePath,
                            pageClass:store.currentOperation.pageClass
                        });
                        break;
                    case '3':
                        //this.funMirrValue=store.currentOperation.function;
                        //console.log(this.funMirrValue);
                        break;
                }
            }

        });
    };


    componentDidMount() {
        const store = this.props.rootStore.entityStore;

        if (store.currentOperation) {
            this.funMirrValue=store.currentOperation.function;
            this.props.form.setFieldsValue(
                {
                    name:store.currentOperation.name,
                    icon:store.currentOperation.icon,
                    type:store.currentOperation.type,
                    location:store.currentOperation.location
                }
            );
            this.typeSelect(store.currentOperation.type);
        }

    }


    render() {
        const store = this.props.rootStore.entityStore;
        const {getFieldDecorator,} = this.props.form;
        return (
            <div>
                <Form>
                    <FormItem label="操作名称">
                        {getFieldDecorator('name', {
                            rules: [{required: true, message: '不能为空',}],
                            validateTrigger: 'onBlur'
                        })(
                            <Input placeholder="关系名称"/>
                        )}
                    </FormItem>
                    <FormItem label="图标">
                        {getFieldDecorator('icon', {

                        })(<IconSelect nullAble/>)}
                    </FormItem>
                    <FormItem label="类型">
                        {getFieldDecorator('type', {
                            rules: [{required: true, message: '不能为空',}],
                            validateTrigger: 'onBlur'
                        })(
                            <Select onSelect={this.typeSelect}>
                                <Option value={'1'}>关联关系</Option>
                                <Option value={'2'}>自定义</Option>
                                <Option value={'3'}>执行方法</Option>
                            </Select>
                        )}
                    </FormItem>
                    <FormItem label="按钮位置">
                        {getFieldDecorator('location', {
                            rules: [{required: true, message: '不能为空',}],
                            validateTrigger: 'onBlur'
                        })(
                            <Select >
                                <Option value={'1'}>位于表头</Option>
                                <Option value={'2'}>位于每一行</Option>
                            </Select>
                        )}
                    </FormItem>
                    {
                        this.state.type==='1'?
                            <FormItem label="关系名称" >
                                {getFieldDecorator('monyToMonyId', {
                                    rules: [{required: this.state.type=='1'?true:false, message: '不能为空',}],
                                    validateTrigger: 'onBlur'
                                })(
                                    <Select>
                                        {
                                            store.monyToMonys
                                                .filter(m=>m.firstTable===store.currentEntity.tableName
                                                    || m.secondTable===store.currentEntity.tableName)
                                                .map(m=>(
                                                    <Option key={m.id} value={m.id}>{m.name}</Option>
                                                ))
                                        }
                                    </Select>
                                )}
                            </FormItem>
                            :''
                    }
                    {
                        this.state.type==='2'?
                            <div>
                                <FormItem label="类所在目录">
                                    {getFieldDecorator('pagePath', {
                                        rules: [{required: this.state.type=='2'?true:false, message: '不能为空',}],
                                        validateTrigger: 'onBlur'
                                    })(
                                        <Input placeholder="类所在目录"/>
                                    )}
                                </FormItem>
                                <FormItem label="页面类名">
                                    {getFieldDecorator('pageClass', {
                                        rules: [{required: this.state.type=='2'?true:false, message: '不能为空',}],
                                        validateTrigger: 'onBlur'
                                    })(
                                        <Input placeholder="页面类名"/>
                                    )}
                                </FormItem>
                            </div>
                            :''

                    }
                    {
                        this.state.type==='3'?
                            <Row>
                                <Col span={24}>
                                    <div>
                                        <div style={{marginBottom:'5px',marginTop:'10px'}}>执行函数</div>
                                        <CodeMirror
                                            value={this.funMirrValue}
                                            options={
                                                {
                                                    mode:'javascript',
                                                    theme: 'material',
                                                    lineNumbers: true,
                                                    extraKeys: {"Ctrl": "autocomplete"},
                                                }
                                            }
                                            onChange={(editor, data, value) => {
                                                this.funMirrValue=value;
                                            }}
                                        />
                                    </div>
                                </Col>
                            </Row>
                            :''
                    }
                    <Row>
                        <Col span={24} style={{textAlign: 'right'}}>
                            <Button icon="save" onClick={this.save}>保存</Button>
                            <Button type="reload" onClick={store.toggleOperationFormVisible}>取消</Button>
                        </Col>
                    </Row>
                </Form>
            </div>
        );

    }
}


export default Form.create()(OperationForm);