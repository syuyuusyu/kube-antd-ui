import React from 'react';
import {
    Form,
    Row,
    Col,
    Input,
    Button,
    Select,
    notification,
    AutoComplete,
    Breadcrumb,
    InputNumber,
    DatePicker
} from 'antd';
import {inject, observer} from 'mobx-react';
import {baseUrl, get, post} from "../util";
import '../style.css';
import moment from 'moment';
import 'moment/locale/zh-cn';

const {TextArea} = Input;


const FormItem = Form.Item;
const Option = AutoComplete.Option;
const formItemLayout = {
    labelCol: {
        xs: {span: 24},
        sm: {span: 8},
    },
    wrapperCol: {
        xs: {span: 24},
        sm: {span: 16},
    },
};

@inject('rootStore')
@observer
class CreateForm extends React.Component {

    state = {};

    componentWillMount() {
        const store = this.props.rootStore.commonStore;
        this.columns = store.allColumns.filter(c => c.entityId === store.currentEntity.id && c.hidden !== '1');
        this.textColumns = this.columns.filter(c => c.columnType === 'text');
        this.setCandidate();
    }

    setCandidate=()=>{
        const store = this.props.rootStore.commonStore;
        this.columns.filter(c => c.foreignKeyId).forEach(async col => {
            this.state[col.columnName] = [];
            this.state[`filter${col.columnName}`] = [];
            let json = await post(`${baseUrl}/entity/queryCandidate/${col.id}`, {...store.treeSelectedObj,...store.defaultQueryObj});
            this.setState({[col.columnName]: json});
            this.setState({[`filter${col.columnName}`]: json});
        });
    };


    componentDidMount() {
        const store = this.props.rootStore.commonStore;
        if (store.isFormUpdate) {

            let allValue = {
                ...store.currentTableRow,
            };
            let valueObj = {};
            this.columns.forEach(_ => {
                if (_.foreignKeyId) {
                    valueObj[_.columnName] = allValue[_.columnName] + '';
                } else {
                    valueObj[_.columnName] = allValue[_.columnName];
                }
                if (_.columnType === 'timestamp') {
                    valueObj[_.columnName] = moment(allValue[_.columnName]);
                }
            });
            console.log(valueObj);
            this.props.form.setFieldsValue(valueObj);
        }
    }

    handleSearch = (colunmName) => ((value) => {
        let regExp = new RegExp('.*' + value.trim() + '.*', 'i');
        const filtered = this.state[colunmName].filter(o => regExp.test(o.text));
        this.setState({[`filter${colunmName}`]: filtered});
    });

    checkUnique = (key) => (async (rule, value, callback) => {
        const store = this.props.rootStore.commonStore;
        let json = await get(`${baseUrl}/entity/checkUnique/${store.currentEntity.id}/${key}/${value}`);
        if (json.total > 0 && !store.isFormUpdate) {
            callback(new Error());
        } else {
            callback();
        }
    });

    save = () => {
        const store = this.props.rootStore.commonStore;
        this.props.form.validateFields(async (err, values) => {
            if (err) return;
            if(store.hasParent){
                values={...values,...store.treeSelectedObj};
            }
            if (store.isFormUpdate) {
                values[store.currentEntity.idField] = store.currentTableRow[store.currentEntity.idField];
            }
            this.columns.forEach(c => {
                if (c.columnType === 'timestamp') {
                    values[c.columnName] = values[c.columnName].format('YYYY-MM-DD HH:mm:ss');
                }
            });
            console.log(store.treeSelectedObj);
            values={...store.defaultQueryObj, ...values};
            console.log(values);
            let json = await post(`${baseUrl}/entity/saveEntity/${store.currentEntity.id}`, values);
            if (json.success) {
                notification.info({
                    message: '保存成功'
                });
            } else {
                notification.error({
                    message: '保存失败'
                });
            }
            store.toggleCreateFormVisible();
            store.queryTable();
            if(store.hasParent && store.currentNode){
                store.onLoadTreeData(store.currentNode);
            }

        });
    };

    createItem = (col) => {

        const store = this.props.rootStore.commonStore;
        const {getFieldDecorator,} = this.props.form;
        console.log( col.text, col.required == '1' ? true : false)
        if (col.foreignKeyId) {
            return (
                    <FormItem key={col.id}
                              label={col.text ? col.text : col.columnName}>
                        {getFieldDecorator(col.columnName, {
                            rules: [{
                                message: '不能为空',
                                required: col.required == '1' ? true : false
                            }],
                        })(
                            <AutoComplete
                                onSearch={this.handleSearch(col.columnName)}
                                dataSource={this.state[`filter${col.columnName}`]
                                    .map(_ => <Option key={_.value} value={_.value + ''}>{_.text}</Option>)}
                            >
                                <Input/>
                            </AutoComplete>
                        )}
                    </FormItem>

            );
        }
        if (col.dicGroupId) {
            return (
                <FormItem key={col.id}
                          label={col.text ? col.text : col.columnName}>
                    {getFieldDecorator(col.columnName, {
                        rules: [{
                            //validator: col.isUnique==='1'?this.checkUnique(col.columnName):null,
                            message: '不能为空',
                            required: col.required == '1' ? true : false
                        }],
                    })(
                        <Select>
                            {
                                store.allDictionary
                                    .filter(d => d.groupId === col.dicGroupId)
                                    .filter(d => {
                                        if (!store.defaultQueryObj[col.columnName]) {
                                            return true;
                                        } else {
                                            if (Object.prototype.toString.call(store.defaultQueryObj[col.columnName]) === "[object Array]") {
                                                return store.defaultQueryObj[col.columnName].find(_ => _ == d.value);
                                            } else {
                                                return d.value == store.defaultQueryObj[col.columnName];
                                            }
                                        }
                                    })
                                    .map(_ => <Option key={_.value} value={_.value + ''}>{_.text}</Option>)
                            }
                        </Select>
                    )}
                </FormItem>
            );
        }
        return (
            <FormItem key={col.id}
                      label={col.text ? col.text : col.columnName}>
                {getFieldDecorator(col.columnName, {
                    rules: [{
                        validator: col.isUnique === '1' ? this.checkUnique(col.columnName) : null,
                        message: col.isUnique === '1' ? '不能和现有字段重复' : '不能为空',
                        required: col.required == '1' ? true : false,
                        type: (function (type) {
                            switch (type) {
                                case 'varchar':
                                    return 'string';
                                case 'int':
                                    return 'number';
                                case 'text':
                                    return 'string';
                                case 'timestamp':
                                    return 'object';
                                default :
                                    return 'string';
                            }
                        })(col.columnType)
                    }],
                })(
                    this.createInput(col.columnType)
                )}
            </FormItem>
        );

    };

    createInput = (columnType) => {
        switch (columnType) {
            case 'varchar':
                return <Input/>
            case 'int':
                return <InputNumber style={{width: '100%'}}/>;
            case 'text':
                return <TextArea autosize/>;
            case 'timestamp':
                return <DatePicker showTime format="YYYY-MM-DD HH:mm:ss" style={{width: '100%'}}/>;
            default :
                return <Input/>
        }
    };

    createItems = () => {
        const store = this.props.rootStore.commonStore;
        const idMatrix = [[], []];
        this.columns.filter(c => store.currentEntity.idField!=c.columnName && store.currentEntity.pidField!=c.columnName && c.columnType !== 'text').forEach((col, index) => {
            idMatrix[index % 2].push(col);
        });
        return (
            <Row gutter={24}>
                {
                    idMatrix.map((row, index) => {
                        return <Col span={12} key={index}>
                            {
                                row.map(col => {
                                    return this.createItem(col);
                                })
                            }
                        </Col>
                    })
                }
            </Row>
        );


    };


    render() {
        const store = this.props.rootStore.commonStore;
        const {getFieldDecorator,} = this.props.form;
        return (
            <div>
                {
                    store.hasParent ?

                            <Breadcrumb style={{margin: '10px 8px'}}>
                                <Breadcrumb.Item>当前路径:</Breadcrumb.Item>
                                {
                                    store.currentRoute
                                        .filter(d => d).map(r => <Breadcrumb.Item
                                        key={r.id}>{r.text}</Breadcrumb.Item>)
                                }
                            </Breadcrumb>

                        : ''

                }
                <Form>
                    {this.createItems()}
                    {
                        this.textColumns.map(col =>
                            <Row key={col.id}>
                                <Col>
                                    <FormItem key={col.id}
                                              label={col.text ? col.text : col.columnName}>
                                        {getFieldDecorator(col.columnName, {
                                            rules: [{
                                                message: '不能为空',
                                                required: col.required == '1' ? true : false,
                                            }],
                                        })(
                                            this.createInput(col.columnType)
                                        )}
                                    </FormItem>
                                </Col>
                            </Row>
                        )
                    }
                    <Row>
                        <Col span={18} style={{textAlign: 'left'}}></Col>
                        <Col span={6} style={{textAlign: 'right'}}>
                            <Button type="reload" onClick={null}>重置</Button>
                            <Button icon="save" onClick={this.save}>保存</Button>
                        </Col>
                    </Row>
                </Form>
            </div>
        );

    }
}

export default Form.create()(CreateForm);

