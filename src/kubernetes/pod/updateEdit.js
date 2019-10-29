import React, {Component} from 'react';
import {inject, observer} from 'mobx-react';


import {
    Col, Badge, Icon, Input,Table,Dropdown,Menu,Button,Divider,Popconfirm,Form,Tabs,Row,Select,Checkbox,Layout
} from 'antd';

const { TabPane } = Tabs;



import {UnControlled as CodeMirror} from 'react-codemirror2'
import 'codemirror/mode/yaml/yaml';
import 'codemirror/mode/javascript/javascript';
import 'codemirror/addon/hint/show-hint.css';
import 'codemirror/addon/hint/show-hint.js';

import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/material.css';
import 'codemirror/theme/ambiance.css';
import '../../style.css'




@inject('rootStore')
@observer
class UpdateEdit extends Component {

    componentDidMount() {
        const podStore = this.props.rootStore.podStore;
        const kubeStore = this.props.rootStore.kubeStore;
        if(podStore.isnew){
            podStore.newResource()
        }else if(kubeStore.currentKind==='Pod'){
            podStore.loadEditCode();
        }else {
            podStore.read();
        }

    }


    componentWillUnmount() {
        if(this.props.rootStore.kubeStore.logEventSource)
            this.props.rootStore.kubeStore.logEventSource.close();
    }

    render() {
        const store = this.props.rootStore.podStore;
        return (
            <div>
                <Tabs activeKey={store.codeIndex} onChange={store.codeIndexChange} tabPosition="top" style={{height:500}}>
                    <TabPane tab="YAML" key="0" >
                        <CodeMirror
                            value={store.yamlText}
                            options={
                                {
                                    mode: 'yaml',
                                    theme: 'material',
                                    lineNumbers: true
                                }
                            }
                            onChange={(editor, data, value) => {

                                store.yamlCurrent=value;
                            }}
                        />
                    </TabPane>
                    <TabPane tab="JSON" key="1" >
                        <CodeMirror
                            value={store.jsonText}
                            ref="json"
                            options={
                                {
                                    mode: 'javascript',
                                    theme: 'material',
                                    lineNumbers: true
                                }
                            }
                            onChange={(editor, data, value) => {
                                store.jsonCurrent=value;
                            }}
                        />
                    </TabPane>
                </Tabs>
                <Row>
                    <Col span={24} style={{textAlign: 'right'}}>
                        <Button type="reload" onClick={store.update}>更新</Button>

                    </Col>
                </Row>
            </div>
        );
    }

}

export default UpdateEdit
