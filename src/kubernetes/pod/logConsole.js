import React, {Component} from 'react';
import {inject, observer} from 'mobx-react';

import {UnControlled as CodeMirror} from 'react-codemirror2'
import 'codemirror/mode/verilog/verilog';
//
import 'codemirror/addon/hint/show-hint.css';
import 'codemirror/addon/hint/show-hint.js';
// import 'codemirror/addon/hint/javascript-hint.js';
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/material.css';
import 'codemirror/theme/ambiance.css';


@inject('rootStore')
@observer
class LogConsole extends Component{

    componentDidMount() {
        this.props.rootStore.podStore.loadLogs()
    }


    componentWillUnmount(){
        if(this.props.rootStore.podStore.logEventSource)
            this.props.rootStore.podStore.logEventSource.close();
    }

    render() {
        const store=this.props.rootStore.podStore;
        return (
            <div>
                <CodeMirror
                    value={store.logText}
                    options={
                        {
                            mode:'verilog',
                            theme: 'material',
                            lineNumbers: true
                        }
                    }
                />
            </div>
        );
    }
}


export default LogConsole;