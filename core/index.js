//挂载组件
import { WatchEffect } from './reactivity/index.js'
import {MountEl,diff} from './renderer/index.js'
export const creatApp = (rootComponent)=>{
    return{
        mount(rootEl){
            const rootElemnet = document.querySelector(rootEl)
            const context = rootComponent.setup()
            let oldvnode = null
            let isMounted = false 
            WatchEffect(()=>{
                if(!isMounted){//第一次执行挂载操作
                    rootElemnet.innerHTML = ''
                    oldvnode = rootComponent.render(context)
                    MountEl(rootElemnet,oldvnode)
                    isMounted = true
                }else{//之后执行diff
                    const newvnode = rootComponent.render(context)
                    diff(oldvnode,newvnode)
                    //diff完之后新的vnode将作为老的vnode
                    oldvnode = newvnode
                }
            })
        }
    }
}

//创建虚拟DOM
export function h(tag,props,child,key=undefined){
    return {
        tag,
        props,
        child,
        key
    }
}