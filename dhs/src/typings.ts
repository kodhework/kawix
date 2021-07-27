import IPC from './channel/ipc'
import { AddressInfo, Socket } from 'net';
import { IncomingMessage, ServerResponse } from 'http';
import Reply from '/virtual/@kawix/std/http/reply'
import { EventEmitter } from 'events';

export interface Config {
    _config?: any 
    readCached(): any 
    sites?: Array<any>
    hosts?: Array<any>

}



export interface StaticOptions{
    path?: string 
    options?: {
        maxAge?: number 
    }
}

export interface CronDefinition{
    file?: string 
    name?: string 
}

export interface RouteDefinition{
    path?: string 
    middleware?: string | RouteDefinition
    folder?: string 
    file?: string 
    static?: string | StaticOptions
    method?: string 
}

export interface Site{
    name: string 
    id: string 
    hostnames?: Array<string>
    globalprefixes?: Array<string>
    routes?: Array<RouteDefinition>
    preload?: Array<string>
    crons?: Array<CronDefinition>
    defaultroute?: RouteDefinition 
}

export interface Context{
	
    server: DhsServer 
    config?: Config 
    site?: Site 
    constants?: any 

}

export interface Request{
    server?: DhsServer,
    handled?: boolean,
    head?:any
    request?: IncomingMessage
    response?: ServerResponse
    reply?: Reply
    socket?:Socket
    params?: any 
}

export interface DhsChannel{
    client: DhsServerProxied
    plain(value:any): any
}


export interface DhsServerBase extends EventEmitter{

    ipcmodule?: string
    config?: Config
    workers?: any[]
    channel?: DhsChannel
    address?: AddressInfo
    http?: any
    started?: number

    connections: any 
    

   
}

export interface DhsServerMaster extends EventEmitter{

   
    connections: any 
    workerPIDs: string[]


    findWorkerPID(worker: {purpose?: string | string[], env?: string | string[]}): Promise<string> 
    attachToWorker(pid: string): Promise<DhsChannel>
    dynamicRun(code: string): Promise<any>
    dynamicImport(file: string): Promise<any>


    createIPC?(id?: string): IPC 
    parseAddress(address: string): string 
    getDataPath(): Promise<string>
    getConfig(): any 
    start(): Promise<void>
    closeAndExit(timeout: number): Promise<void>
    reloadCluster(): Promise<void>
    buildRoutes(): Promise<void>
    getContext(site: string): Context
}


export interface DhsServer extends DhsServerBase{

    connections(): Promise<any>
    
    findWorkerPID(worker: {purpose?: string | string[], env?: string | string[]}): Promise<string> 
    attachToWorker(pid: string): Promise<DhsChannel>
    dynamicRun(code: string): Promise<any>
    dynamicImport(file: string): Promise<any>
    
    getDataPath(): Promise<string>
    getConfig(): Promise<any> 
    
    closeAndExit(timeout: number): Promise<void>
    
    buildRoutes(): Promise<void>
    getContext(site: string): Promise<Context>

}

export interface DhsServerProxied extends DhsServer{

    workerPIDs(): Promise<string[]>

}


export interface Callable {
    (ctx: Context, env: Request)
}