import React from 'react';
import {Form, Row, Col, Input, Button, Select, Modal, Progress, InputNumber, notification} from 'antd';
import {inject, observer} from 'mobx-react';
import {kubeUrl, get, post,put} from "../../util";


import {UnControlled as CodeMirror} from 'react-codemirror2'
import 'codemirror/mode/yaml/yaml';
import 'codemirror/mode/javascript/javascript';
import 'codemirror/addon/hint/show-hint.css';
import 'codemirror/addon/hint/show-hint.js';

import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/material.css';
import 'codemirror/theme/ambiance.css';
import '../../style.css'

const FormItem = Form.Item;
const Option = Select.Option;


@inject('rootStore')
@observer
class ConfigMapContext extends React.Component {

    datavalue='';

    save = () => {
        const store = this.props.rootStore.entityStore;
        this.props.form.validateFields(async (err, values) => {
            if (err) return;
            values.context = this.datavalue;
            console.log(values);
            let json = await put(`${kubeUrl}/kube/addConfigMapData`,values);

        });

    };

    componentDidMount() {
        const store = this.props.rootStore.configMapStore;
        this.props.form.setFieldsValue({
            name:store.currentMap.name,
            ns : this.props.rootStore.kubeStore.ns,
            key:store.currentKey,
        });
        if (store.currentMap && store.currentMap.data && store.currentKey && store.currentMap.data[store.currentKey]){
             this.datavalue = store.currentMap.data[store.currentKey];

        }
    }
    render() {
        const store = this.props.rootStore.podStore;
        const {getFieldDecorator,} = this.props.form;
        return (
            <div>
                <Form>
                    <FormItem label="name">
                        {getFieldDecorator('name', {
                            rules: [{required: true, message: '不能为空',}],
                            validateTrigger: 'onBlur'
                        })(
                            <Input placeholder="name"/>
                        )}
                    </FormItem>
                    <FormItem label="ns">
                        {getFieldDecorator('ns', {
                            rules: [{required: true, message: '不能为空',}],
                            validateTrigger: 'onBlur'
                        })(
                            <Input placeholder="ns"/>
                        )}
                    </FormItem>
                    <FormItem label="key">
                        {getFieldDecorator('key', {
                            rules: [{required: true, message: '不能为空',}],
                            validateTrigger: 'onBlur'
                        })(
                            <Input placeholder="key"/>
                        )}
                    </FormItem>
                    <Row>
                        <Col span={24}>
                            <div>
                                <div style={{marginBottom: '5px', marginTop: '10px'}}>context</div>
                                <CodeMirror
                                    value={this.datavalue}
                                    options={
                                        {
                                            mode: 'javascript',
                                            theme: 'material',
                                            lineNumbers: true,
                                            extraKeys: {"Ctrl": "autocomplete"},
                                        }
                                    }
                                    onChange={(editor, data, value) => {
                                        this.datavalue = value;
                                    }}
                                />
                            </div>
                        </Col>
                    </Row>

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

export default Form.create()(ConfigMapContext);