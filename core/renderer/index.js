//挂载DOM
export function MountEl(rootEl,vnode){
    const {tag,props,child} = vnode
    const Component = vnode.$el = document.createElement(tag)//创建根组件  $el保存创建出来DOM元素，在diff时候不需要提升性能
    rootEl.append(Component)//添加到根
    //添加属性
    if(props){
        for(let i in props){
            Component.setAttribute(i,props[i])
        }
    }
    //添加子元素，可能是文本，可能是数组
    if(typeof child ==='string'){
        const TextNode = document.createTextNode(child)
        Component.append(TextNode)
    }else if(Array.isArray(child)){
        child.forEach((item)=>{
            if(typeof item==='string'){
                const TextNode = document.createTextNode(item)
                Component.append(TextNode)
            }else if(typeof item==='object'){
                MountEl(Component,item)
            }
        })
    }
}
//n1是旧的虚拟DOM，n2是新的虚拟DOM
export function diff(n1,n2){
    const {tag:oldtag,props:oldprops,child:oldchild,key:oldkey} = n1
    const {tag:newtag,props:newprops,child:newchild,key:newkey} = n2
    //1.对比标签
    if(oldtag!==newtag | oldkey!==newkey){
        const newEl= n2.$el = document.createElement(newtag)
        n1.$el.replaceWith(newEl)//用新DOM替换原来位置的DOM

        //处理props
        if(newprops){
            for (let i in newprops){
                newEl.setAttribute(i,newprops[i])
            }
        }

        //处理child
        if(typeof newchild === 'string'){
            const TextNode = document.createTextNode(newchild)
            newEl.append(TextNode)
        }else if(Array.isArray(newchild)){
            newchild.forEach(item=>{
                if(typeof item === 'string'){
                    const TextNode = document.createTextNode(item)
                    newEl.append(TextNode)
                }else if(typeof item === "object"){
                    MountEl(newEl,item)
                }
            })
        }

    }else{
        //因标签一样，直接给新虚拟DOM的el属性赋值
        n2.$el = n1.$el
        //2.对比属性
        //当新vDOM无任何属性时，且旧节点存在属性,将DOM元素上的所有属性清空
        if(!newprops && oldprops){
            for(let i in oldprops){
                n2.$el.removeAttribute(i)
            }
        }else if(newprops){
            for(let i in newprops){
                n2.$el.setAttribute(i,newprops[i])
            }
            if(oldprops){ //将多余的旧属性移除
                for(let j in oldchild){
                    if(!(j in newprops)){
                        n2.$el.removeAttribute(j)
                    }   
                }
            }
        }
        //3.对比子元素
        if(typeof newchild==='string'){
            if(newchild!==oldchild){
                n2.$el.innerHTML = ''
                n2.$el.append(document.createTextNode(newchild))
                console.log("_____0")
            } 
        }else if(Array.isArray(newchild)){
            if(typeof oldchild === 'string'){//当旧节点为string直接创建新的节点
                console.log("_______1")
                n2.$el.innerHTML = ''
                newchild.forEach((child)=>{
                    MountEl(n2.$el,child)
                })
            }else if(Array.isArray(oldchild)){ //当新旧皆为数组，使用diff算法
                    //a,b,c,d
                    //a,v,b,c,d
                console.log("_____2")
                const MaxL = Math.min(oldchild.length,newchild.length)
                const MaxR = Math.max(oldchild.length,newchild.length)
                const minu = Math.abs(MaxL-MaxR) //新旧节点长度之差
                //从左往右遍历，遇到key不同则停止遍历
                let left = 0
                for(;left<MaxL;left++){
                    if(typeof newchild[left] === 'string'){
                        if(newchild[left]!==oldchild[left]){
                            n2.$el.childNodes[left].replaceWith(document.createTextNode(newchild[left]))
                        }
                    }else if(typeof newchild[left]==='object'){
                        if(typeof oldchild[left]==='string'){
                            MountEl(n2.$el,newchild[left])
                        }else if(typeof oldchild[left]==='object'){
                            if(oldchild[left].key !== newchild[left].key){
                                break
                            }else{
                                diff(oldchild[left],newchild[left])
                            }
                        }
                    }
                    if(left===MaxL-1){ //对比完最后一个
                        if(oldchild.length>newchild.length){
                            for(let i=MaxL;i<oldchild.length;i++){
                                n2.$el.removeChild(oldchild[i].$el)
                            }
                        }else if(oldchild.length<newchild.length){
                            newchild.slice(MaxL).forEach(item=>{
                                MountEl(n2.$el,item)
                            })
                        }
                        return
                    }
                }
                
                let right = MaxR-1
                //从右往左遍历,与到key不相等则退出
                if(newchild.length>=oldchild.length){
                    console.log("aaaa")
                    for(;right>left;right--){
                        if(typeof newchild[right] === 'string'){
                            if(newchild[right]!==oldchild[right-minu]){
                                n2.$el.childNodes[right].replaceWith(document.createTextNode(newchild[right]))
                            }
                        }else if(typeof newchild[right]==='object'){
                            if(typeof oldchild[right-minu]==='string'){
                                n2.$el.innerHTML = ''
                                MountEl(n2.$el,newchild[right])
                            }else if(typeof oldchild[right-minu]==='object'){
                                if(oldchild[right-minu].key !== newchild[right].key){
                                    break
                                }else{
                                    
                                    diff(oldchild[right-minu],newchild[right])
                                }
                            }
                        }
                        if(right-minu === left){ //当旧节点已经对比完
                            newchild.slice(left,right).forEach((item,index)=>{//将新节点的多余部分进行插入
                                const el = item.$el = document.createElement(item.tag)
                                n2.$el.insertBefore(el,n2.$el.childNodes[left+index])
                                if(item.props){
                                    for(let i in item.props){
                                        el.setAttribute(i,item.props[i])
                                    }
                                }
                                if(typeof item.child==='string'){ //目前暂时不考虑item.child为Array
                                    el.innerHTML = item.child
                                }
                            })
                            return
                        }
                    }
                }else{ //旧节点长度大于新节点长度
                    console.log("______3")
                    for(;right>left;right--){
                        if(typeof newchild[right-minu] === 'string'){
                            if(newchild[right-minu]!==oldchild[right]){
                                n2.$el.childNodes[right].replaceWith(document.createTextNode(newchild[right-minu]))
                            }
                        }else if(typeof newchild[right-minu]==='object'){
                            if(typeof oldchild[right]==='string'){
                                n2.$el.innerHTML = ''
                                MountEl(n2.$el,newchild[right-minu])
                            }else if(typeof oldchild[right]==='object'){
                                if(oldchild[right].key !== newchild[right-minu].key){
                                    break
                                }else{
                                    diff(oldchild[right],newchild[right-minu])
                                }
                            }
                        }
                        if(right-minu===left){ //当新节点对比完成，则删去多余的老旧节点
                            console.log(oldchild.slice(left,right))
                            oldchild.slice(left,right).forEach((item)=>{
                                n2.$el.removeChild(item.$el)
                            })
                            return
                        }
                    }
                }
                const oldiffChild = oldchild.slice(left,right+1)
                const oldkeys = [] //存储旧vnode的key，用于复用节点
                oldiffChild.forEach(item=>{
                    oldkeys.push(item.key)
                })
                const newdiffChild = newchild.slice(left,right+1)
                // 1 2 3
                // 1 3 2
                //left = 1
                newdiffChild.forEach((item,index)=>{
                    let i = oldkeys.indexOf(item.key)
                    if(i!==-1){ //当vnode中存在可复用的节点
                        const colEL= oldiffChild[i].$el.cloneNode(true)
                        n2.$el.childNodes[index+left].replaceWith(colEL)
                        item.$el = colEL
                    }else{ //当旧的节点中不存在复用的节点
                        const el = item.$el = document.createElement(item.tag)
                        n2.$el.insertBefore(el,n2.$el.childNodes[left+index])
                        if(item.props){
                            for(let i in item.props){
                                el.setAttribute(i,item.props[i])
                            }
                        }
                        if(typeof item.child === 'string'){//目前暂时不考虑item.child为Array
                            el.innerHTML = item.child
                        }
                    }
                })
            }
        }
    }
}
function insertEl(){

}
