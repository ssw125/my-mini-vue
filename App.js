import {h} from './core/index.js'
import {reactive,WatchEffect} from './core/reactivity/index.js'
export default{
    render(context){ //生成vnode
        const {num,child} = context
        return h('ul',{id:"ssw"},child.value)
    },
    setup(){ //创建相关数据
        const num = reactive(2)
        const child = reactive([h('li',{class:"r"},"1",1),h('li',{class:"r"},String(num.value),2),h('li',{class:"r"},"3",3)])
        window.num = num
        window.child = child
        return{
            num,
            child
        }
    }
}