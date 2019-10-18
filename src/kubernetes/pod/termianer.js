import React, {Component} from 'react';
import {inject, observer} from 'mobx-react';
import { Terminal } from 'xterm';
import "xterm/dist/xterm.css"


@inject('rootStore')
@observer
class TerminalConsole extends Component{

    ws;
    xterm = new Terminal({
        cols: 100,
        rows: 20,
        cursorBlink: 5,
        scrollback: 30,
        tabStopWidth: 4
    });

    componentWillMount() {

    }

    componentWillUnmount(){
        if(this.ws)
            this.ws.close();
    }

    componentDidMount(){
        const store = this.props.rootStore.podStore;
        if(store.hasConsole){
            let url=`${store.wsUrl}?ns=${store.currentNs}&name=${store.currentPod.name}`;
            if(store.containerName){
                url=`${url}&container=${store.containerName}`;
            }
            this.ws=new WebSocket(url);
            this.xterm.open(document.getElementById('terminal'));
            this.ws.onerror = function () {
                //showErrorMessage('connect error.')
            };
            this.ws.onmessage = (e) =>{
                if (e.data instanceof Blob) {
                    var f = new FileReader();
                    f.onload = () =>{
                        this.xterm.write(f.result);
                    };
                    f.readAsText(e.data);
                } else {
                    this.xterm.write(e.data);
                }
            };
            this.ws.onopen =  (event) =>{
                console.log('onopen');
                this.ws.send(String.fromCharCode(13));

            };

            this.xterm.textarea.onkeydown =  (e)=> {
                //console.log('User pressed key with keyCode: ', e.keyCode);

            };

            this.xterm.attachCustomKeyEventHandler( (e) =>{

            });
            this.xterm.on('data',(data)=>{
                console.log('ondata',data);
                this.ws.send(data)
            });

            this.xterm.on('output', arrayBuffer => {
                // console.log('output===',arrayBuffer);
                // this.xterm.write(arrayBuffer);
            });

            this.xterm.on('blur', arrayBuffer => {
                // console.log('blur===',arrayBuffer);
                // this.xterm.write(arrayBuffer);
            });

            this.xterm.on('focus', arrayBuffer => {
                // console.log('focus===',arrayBuffer);
                // this.xterm.write(arrayBuffer);
            });

            /*  xterm.on('key', arrayBuffer => {
                console.log('key===',arrayBuffer)
                xterm.write(arrayBuffer);
              });*/
            this.xterm.on('keydown', arrayBuffer => {
                //console.log('keydown===',arrayBuffer);
                //this.xterm.write(arrayBuffer.key);
                //this.ws.send(arrayBuffer.key);
            });


            this.xterm.on('lineFeed', arrayBuffer => {
                // console.log('lineFeed===',arrayBuffer);
                // this.xterm.write(arrayBuffer);
            });

            this.xterm.on('resize', size => {
                this.ws.send('resize', [size.cols, size.rows]);
                console.log('resize', [size.cols, size.rows]);
            })
        }
    }



    render() {
        const store = this.props.rootStore.podStore;
        return (
            <div>
                {
                    store.hasConsole?
                        <div id="terminal" ></div>
                        :
                        <span>当前容器不支持控制台操作</span>
                }
            </div>
        );
    }
}

export default TerminalConsole