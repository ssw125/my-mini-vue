import {h} from './core/index.js'
import {reactive} from './core/reactivity/index.js'
export default{
    render(context){ //生成vnode
        const {num,tag} = context
        return h('ul',{id:"ssw"},[h('li',{class:"r"},"1"),h('li',{class:"r"},String(num.value)),h('li',{class:"r"},"3")])
    },
    setup(){ //创建相关数据
        const num = reactive(1)
        const tag = reactive('div')
        window.num = num
        window.tag = tag
        return{
            num,
            tag
        }
    }
}