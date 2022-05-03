//挂载组件
import {MountEl} from './renderer/index.js'
export const creatApp = (rootComponent)=>{
    return{
        mount(rootEl){
            const rootElemnet = document.querySelector(rootEl)
            MountEl(rootElemnet,rootComponent)
        }
    }
}

//创建虚拟DOM
export function h(tag,props,child){
    return {
        tag,
        props,
        child
    }
}