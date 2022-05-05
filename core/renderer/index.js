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
        child.forEach((item,index)=>{
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
            console.log("aaa")
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
            } 
        }else if(Array.isArray(newchild)){
            if(typeof oldchild === 'string'){//当旧节点为string直接创建新的节点
                n2.$el.innerHTML = ''
                newchild.forEach((child)=>{
                    MountEl(n2.$el,child)
                })
            }else if(Array.isArray(oldchild)){ //当新旧皆为数组，使用diff算法
                    //a,b,c,d
                    //a,v,b,c,d
                const MaxL = Math.min(oldchild.length,newchild.length)
                //从左往右遍历
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
                }

                let right = MaxL-1
                //从右往左遍历
                for(;right>left;right--){
                    if(typeof newchild[right] === 'string'){
                        if(newchild[right]!==oldchild[right]){
                            n2.$el.append(document.createTextNode(newchild[right]))
                        }
                    }else if(typeof newchild[right]==='object'){
                        if(typeof oldchild[right]==='string'){
                            MountEl(n2.$el,newchild[right])
                        }else if(typeof oldchild[right]==='object'){
                            if(oldchild[right].key !== newchild[right].key){
                                break
                            }else{
                                diff(oldchild[right],newchild[right])
                            }
                        }
                    }
                }

                // const diffchild = 
            }
        }
    }
}
