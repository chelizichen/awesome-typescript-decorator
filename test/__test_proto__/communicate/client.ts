import { EventEmitter } from "events";
import * as net from 'net'
import { $WriteHead, CommunicateBase, TimesCall } from "./utils";
import { T_RStream, T_WStream } from "../stream";
import { T_Container, T_String, T_Vector } from "../category";
import { uid } from "uid";
import Ample, { LoadAmpleProxy } from "../bin/ample";


class LemonClient extends CommunicateBase{

    public localData : Buffer | undefined; // 本地缓冲区
    public Position:number;
    public BufferLength:number;
    public Servant;
    public Connection;
    public Socket   :   net.Socket;
    public Events   :   EventEmitter;
    constructor(Servant:net.SocketConnectOpts){
        super()
        this.Events = new EventEmitter();
        this.Reset();
        this.Socket = new net.Socket();
        this.Socket.connect(Servant)
        this.Registration(this.Socket)
    }

    // 拿到包以后需要先判断包是否完整
    // 如果不完整，则存入localData中
    $OnData(buf:Buffer){
        const View = new DataView(buf.buffer)
        const NonExistent = this.Position === 0;
        // 当前缓冲区是正常的
        if(NonExistent){
            const BufferLength = View.getInt32(0) + 4;
            console.log('BufferLength',BufferLength);
            console.log('buf.byteLength',buf.byteLength);
            
            // 完整包
            if(View.byteLength == BufferLength){
                this.$ResponseToGateWay(buf)
                this.Reset()
                return;
            }
            // 不完整包 包大小 < 给定的大小
            if(View.byteLength < BufferLength){
                this.BufferLength = BufferLength;
                this.Position += View.byteLength;
                this.localData = Buffer.concat([this.localData!,buf])
                return;
            }
            // 一次发了多个包过来
            if(View.byteLength > BufferLength){
                const spliceBuf = buf.subarray(0,BufferLength);
                this.$ResponseToGateWay(spliceBuf)
                const otherBuf = buf.subarray(BufferLength)
                if(otherBuf.byteLength != 0){
                    this.$OnData(otherBuf);
                }
                return;
            }

        }

        if(!NonExistent){
            const BufferLength = buf.byteLength;
            const canWrite = this.Position + BufferLength === this.BufferLength;
            if(canWrite){
                const _buf = Buffer.concat([this.localData!,buf])
                this.$ResponseToGateWay(_buf)
                this.Reset()
            }
            if(!canWrite){
                this.Position += View.byteLength;
                this.localData = Buffer.concat([this.localData!,Buffer.from(View.buffer)])
            }
        }
    }

    $ResponseToGateWay(buf:Buffer){
        const rs = new T_RStream(buf)
        rs.ReadInt32(0); // length
        rs.ReadString(1); // moudleName
        rs.ReadString(2); // method
        const invokeResponse        = rs.ReadString(3); // resp
        const traceId               = rs.ReadVector(4,T_String); // traceId
        const invokeResponseBody    = rs.ReadStruct(5,this.$ReflectGetClass(invokeResponse).Read);
        this.Events.emit(traceId[0],invokeResponseBody)
    }

    $OnConncet(){
    //   this.Test()
      console.log("已连接至24001");
    }

    $WriteToServer(data:Buffer){
        const _buf = $WriteHead(data)
        console.log('$WriteToServer',_buf.byteLength);
        this.Socket.write(_buf)
    }

    Registration(Socket:net.Socket){
        Socket.on('data',this.$OnData.bind(this));
        Socket.on('connect',this.$OnConncet.bind(this))
    }
    
    Reset(){
        this.localData = undefined;
        this.localData = Buffer.alloc(0);
        this.Position = 0;
        this.BufferLength = 0;
    }

    $InvokeRpc(module:string,method:string,request:string,body){
        return new Promise((resolve)=>{
            const ws = new T_WStream();
            const traceIds = new T_Vector(T_String)
            const traceReqId =  uid();
            traceIds.push(traceReqId)
            ws.WriteString(0,module);
            ws.WriteString(1,method);
            ws.WriteString(2,request);
            ws.WriteVector(3,traceIds,T_String);
            ws.WriteStruct(4,body,this.$ReflectGetClass(request).Write)
            this.$WriteToServer(ws.toBuf())
            this.Events.on(traceReqId,resp=>resolve(resp));
        })
    }

}


const client = new LemonClient({
    'port':24001
})

T_Container.Set(Ample.getUserListReq)
T_Container.Set(Ample.getUserListRes)


const ClientProxy = new LoadAmpleProxy(client);

TimesCall(()=>
    ClientProxy.getUserList({
        basicInfo:{
            token:"qwe123asd123",
            detail:{
                a:"1",
                b:"2"
            }
        },
        page:{
            offset:0,
            size:10,
            keyword:"hello world"
        }
    }).then(res=>{
        console.log('getUserList',res);
    })
,5)

TimesCall(()=>
    ClientProxy.getUser({
        id:1,
        basicInfo:{
            token:"qwe123asd123",
            detail:{
                a:"1",
                b:"2"
            }
        },
    }).then(res=>{
        console.log('getUser',res);
    })
,5)

