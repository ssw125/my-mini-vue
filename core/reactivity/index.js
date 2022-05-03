let currentFn = null //用于记录当前正在执行的依赖，使得在数据劫持时候能够拿到当前需要收集的依赖。（小技巧）
const DepMap = new WeakMap() //用于保存所有变量和对象的依赖，即是整个项目的依赖图
class Dep { //依赖容器类 只针对于响应式对象的一个属性 
    constructor(){
        this.deps = new Set()
    }
    addDep(fn){ //增加依赖
        if(fn !== null){
            this.deps.add(fn)
        }
    }
    notify(){ //当被修改时，执行所有依赖
        this.deps.forEach(fn=>{
            fn()
        })
    }
}
export const reactive=(obj)=>{
    if(Object.prototype.toString.call(obj) !== "[object Object]"){ //当传入obj不是对象时候
        obj = {
            value:obj
        }
    }
    return new Proxy(obj,{
        get(target,key){
            if(currentFn===null){ //当响应式对象不是在依赖执行时获取
                return Reflect.get(target,key)
            }
            if(!DepMap.get(target)){ //判断当前对象有没有记录到整个项目的依赖图中,如果没有就创建一个
                DepMap.set(target,new Map()) // new Map用于存储每个属性的依赖
            }
            const tagMap = DepMap.get(target)
            if(!tagMap.get(key)){ //如果该属性没有创建一个依赖容器
                tagMap.set(key,new Dep())
            }
            
            tagMap.get(key).addDep(currentFn) //将当前依赖进行收集
            return Reflect.get(target,key)
        },
        set(target,key,newValue){
            Reflect.set(target,key,newValue) //将赋新值
            const tagMap = DepMap.get(target) //如果对象
            if(!tagMap){  //当对象中不存在依赖
                return
            }
            tagMap.get(key).notify()
            return true
        }
    })
}
export const WatchEffect = (fn)=>{ //收集依赖
    currentFn = fn
    fn()
    currentFn = null
}