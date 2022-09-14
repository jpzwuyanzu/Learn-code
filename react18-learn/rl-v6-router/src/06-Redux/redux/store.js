// 引入redux
// 使用createStore(reducer)

import {combineReducers, createStore } from 'redux'
import CityReducer  from './reducers/cityReducer'
import TabBarReducer from './reducers/tabbarReducer'

const reducer = combineReducers({CityReducer, TabBarReducer})
const store = createStore(reducer);

/**
 * store.dispatch
 * store.subscribe
 * store.getState
 */

//下边是自己封装的redux
// function createTestStore (reducer) {
//     var list = [];
//     var state = reducer();
//     function subscribe(callback) {
//         list.push(callback)
//     }
//     function dispatch(action) {
//         state = reducer(state,action)
//         for(var i in list) {
//             list[i] && list[i]()
//         }
//     }
//     function getState() {
//         return state
//     }
//     return {
//         subscribe,
//         dispatch,
//         getState
//     }
// }

/**
 * 纯函数：
 * 1，对外界没有副作用
 * 2，同样的输入得到同样的输出
 */


export default store