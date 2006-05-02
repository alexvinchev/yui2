/*                                                                                                                                                      Copyright (c) 2006, Yahoo! Inc. All rights reserved.                                                                                                    Code licensed under the BSD License:                                                                                                                    http://developer.yahoo.net/yui/license.txt                                                                                                              version: 0.10.0                                                                                                                                         */ YAHOO.util.CustomEvent=function(_1,_2){this.type=_1;this.scope=_2||window;this.subscribers=[];if(YAHOO.util.Event){YAHOO.util.Event.regCE(this);}};YAHOO.util.CustomEvent.prototype={subscribe:function(fn,_4,_5){this.subscribers.push(new YAHOO.util.Subscriber(fn,_4,_5));},unsubscribe:function(fn,_6){var _7=false;for(var i=0,len=this.subscribers.length;i<len;++i){var s=this.subscribers[i];if(s&&s.contains(fn,_6)){this._delete(i);_7=true;}}return _7;},fire:function(){for(var i=0,len=this.subscribers.length;i<len;++i){var s=this.subscribers[i];if(s){var _10=(s.override)?s.obj:this.scope;s.fn.call(_10,this.type,arguments,s.obj);}}},unsubscribeAll:function(){for(var i=0,len=this.subscribers.length;i<len;++i){this._delete(i);}},_delete:function(_11){var s=this.subscribers[_11];if(s){delete s.fn;delete s.obj;}delete this.subscribers[_11];}};YAHOO.util.Subscriber=function(fn,obj,_13){this.fn=fn;this.obj=obj||null;this.override=(_13);};YAHOO.util.Subscriber.prototype.contains=function(fn,obj){return (this.fn==fn&&this.obj==obj);};if(!YAHOO.util.Event){YAHOO.util.Event=function(){var _14=false;var _15=[];var _16=[];var _17=[];var _18=[];var _19=[];var _20=[];var _21=[];var _22=0;var _23=[];var _24=0;var _25={};return {POLL_RETRYS:200,POLL_INTERVAL:50,EL:0,TYPE:1,FN:2,WFN:3,SCOPE:3,ADJ_SCOPE:4,isSafari:(/Safari|Konqueror|KHTML/gi).test(navigator.userAgent),isIE:(!this.isSafari&&!navigator.userAgent.match(/opera/gi)&&navigator.userAgent.match(/msie/gi)),addDelayedListener:function(el,_27,fn,_28,_29){_16[_16.length]=[el,_27,fn,_28,_29];if(_14){_22=this.POLL_RETRYS;this.startTimeout(0);}},startTimeout:function(_30){var _31=this;var _32=function(){_31._tryPreloadAttach();};this.timeout=setTimeout(_32,_30);},onAvailable:function(_33,_34,_35,_36){_23.push({id:_33,fn:_34,obj:_35,override:_36});_22=this.POLL_RETRYS;this.startTimeout(0);},addListener:function(el,_37,fn,_38,_39){if(!fn||!fn.call){return false;}if(this._isValidCollection(el)){var ok=true;for(var i=0,len=el.length;i<len;++i){ok=(this.on(el[i],_37,fn,_38,_39)&&ok);}return ok;}else{if(typeof el=="string"){var oEl=this.getEl(el);if(_14&&oEl){el=oEl;}else{this.addDelayedListener(el,_37,fn,_38,_39);return true;}}}if(!el){return false;}if("unload"==_37&&_38!==this){_17[_17.length]=[el,_37,fn,_38,_39];return true;}var _42=(_39)?_38:el;var _43=function(e){return fn.call(_42,YAHOO.util.Event.getEvent(e),_38);};var li=[el,_37,fn,_43,_42];var _46=_15.length;_15[_46]=li;this.mapListener(el,_37,fn,_46);if(this.useLegacyEvent(el,_37)){var _47=this.getLegacyIndex(el,_37);if(_47==-1){_47=_19.length;_21[el.id+_37]=_47;_19[_47]=[el,_37,el["on"+_37]];_20[_47]=[];el["on"+_37]=function(e){return YAHOO.util.Event.fireLegacyEvent(YAHOO.util.Event.getEvent(e),_47);};}_20[_47].push(_46);}else{if(el.addEventListener){el.addEventListener(_37,_43,false);}else{if(el.attachEvent){el.attachEvent("on"+_37,_43);}}}return true;},fireLegacyEvent:function(e,_48){var ok=true;var le=_20[_48];for(var i=0,len=le.length;i<len;++i){var _50=le[i];if(_50){var li=_15[_50];if(li&&li[this.WFN]){var _51=li[this.ADJ_SCOPE];var ret=li[this.WFN].call(_51,e);ok=(ok&&ret);}else{delete le[i];}}}return ok;},getLegacyIndex:function(el,_53){var key=this.generateId(el)+_53;if(typeof _21[key]=="undefined"){return -1;}else{return _21[key];}},useLegacyEvent:function(el,_55){if(!el.addEventListener&&!el.attachEvent){return true;}else{if(this.isSafari){if("click"==_55||"dblclick"==_55){return true;}}}return false;},removeListener:function(el,_56,fn,_57){if(!fn||!fn.call){return false;}if(typeof el=="string"){el=this.getEl(el);}else{if(this._isValidCollection(el)){var ok=true;for(var i=0,len=el.length;i<len;++i){ok=(this.removeListener(el[i],_56,fn)&&ok);}return ok;}}if("unload"==_56){for(i=0,len=_17.length;i<len;i++){var li=_17[i];if(li&&li[0]==el&&li[1]==_56&&li[2]==fn){delete _17[i];return true;}}return false;}var _58=null;if("undefined"==typeof _57){_57=this._getCacheIndex(el,_56,fn);}if(_57>=0){_58=_15[_57];}if(!el||!_58){return false;}if(el.removeEventListener){el.removeEventListener(_56,_58[this.WFN],false);}else{if(el.detachEvent){el.detachEvent("on"+_56,_58[this.WFN]);}}delete _15[_57][this.WFN];delete _15[_57][this.FN];delete _15[_57];if(!el){return true;}var key=el.id+_56;if(!_25[key]){return true;}for(i=0,len=_25[key].length;i<len;++i){var _59=_25[key][i];if(_59&&_59.fn==fn){delete _25[key][i];break;}}return true;},getTarget:function(ev,_61){var t=ev.target||ev.srcElement;if(_61&&t&&"#text"==t.nodeName){return t.parentNode;}else{return t;}},getPageX:function(ev){var x=ev.pageX;if(!x&&0!==x){x=ev.clientX||0;if(this.isIE){x+=this._getScrollLeft();}}return x;},getPageY:function(ev){var y=ev.pageY;if(!y&&0!==y){y=ev.clientY||0;if(this.isIE){y+=this._getScrollTop();}}return y;},getXY:function(ev){return [this.getPageX(ev),this.getPageY(ev)];},getRelatedTarget:function(ev){var t=ev.relatedTarget;if(!t){if(ev.type=="mouseout"){t=ev.toElement;}else{if(ev.type=="mouseover"){t=ev.fromElement;}}}return t;},getTime:function(ev){if(!ev.time){var t=new Date().getTime();try{ev.time=t;}catch(e){return t;}}return ev.time;},stopEvent:function(ev){this.stopPropagation(ev);this.preventDefault(ev);},stopPropagation:function(ev){if(ev.stopPropagation){ev.stopPropagation();}else{ev.cancelBubble=true;}},preventDefault:function(ev){if(ev.preventDefault){ev.preventDefault();}else{ev.returnValue=false;}},getEvent:function(e){var ev=e||window.event;if(!ev){var c=this.getEvent.caller;while(c){ev=c.arguments[0];if(ev&&Event==ev.constructor){break;}c=c.caller;}}return ev;},getCharCode:function(ev){return ev.charCode||((ev.type=="keypress")?ev.keyCode:0);},_getCacheIndex:function(el,_66,fn){if(!el){return -1;}var key=el.id+_66;if(!_25[key]){return -1;}else{for(var i=0,len=_25[key].length;i<len;++i){var _67=_25[key][i];if(_67&&_67.fn==fn){return _67.index;}}}return -1;},generateId:function(el){var id=el.id;if(!id){id="yui-event-auto-id-"+(_24++);el.id=id;}return id;},mapListener:function(_69,_70,_71,_72){var key=this.generateId(_69)+_70;if(!_25[key]){_25[key]=[];}_25[key].push({fn:_71,index:_72});},_isValidCollection:function(o){return (o&&o.length&&typeof o!="string"&&!o.tagName&&!o.alert&&typeof o[0]!="undefined");},getEl:function(id){return document.getElementById(id);},clearCache:function(){},regCE:function(ce){_18.push(ce);},_load:function(e){_14=true;},_tryPreloadAttach:function(){if(this.locked){return false;}this.locked=true;var _75=!_14;if(!_75){_75=(_22>0);}var _76=[];for(var i=0,len=_16.length;i<len;++i){var d=_16[i];if(d){var el=this.getEl(d[this.EL]);if(el){this.on(el,d[this.TYPE],d[this.FN],d[this.SCOPE],d[this.ADJ_SCOPE]);delete _16[i];}else{_76.push(d);}}}_16=_76;notAvail=[];for(i=0,len=_23.length;i<len;++i){var _78=_23[i];if(_78){el=this.getEl(_78.id);if(el){var _79=(_78.override)?_78.obj:el;_78.fn.call(_79,_78.obj);delete _23[i];}else{notAvail.push(_78);}}}_22=(_76.length===0&&notAvail.length===0)?0:_22-1;if(_75){this.startTimeout(this.POLL_INTERVAL);}this.locked=false;},_unload:function(e,me,_81){for(var i=0,len=_17.length;i<len;++i){var l=_17[i];if(l){var _83=(l[this.ADJ_SCOPE])?l[this.SCOPE]:window;l[this.FN].call(_83,this.getEvent(e),l[this.SCOPE]);}}len=_15.length;if(len){for(i=0;i<len;++i){l=_15[i];if(l){this.removeListener(l[this.EL],l[this.TYPE],l[this.FN],i);}}this.clearCache();}for(i=0,len=_18.length;i<len;++i){_18[i].unsubscribeAll();delete _18[i];}for(i=0,len=_19.length;i<len;++i){delete _19[i];}},_getScrollLeft:function(){return this._getScroll()[1];},_getScrollTop:function(){return this._getScroll()[0];},_getScroll:function(){var dd=document.documentElement;db=document.body;if(dd&&dd.scrollTop){return [dd.scrollTop,dd.scrollLeft];}else{if(db){return [db.scrollTop,db.scrollLeft];}else{return [0,0];}}}};}();YAHOO.util.Event.on=YAHOO.util.Event.addListener;if(document&&document.body){YAHOO.util.Event._load();}else{YAHOO.util.Event.on(window,"load",YAHOO.util.Event._load,YAHOO.util.Event,true);}YAHOO.util.Event.on(window,"unload",YAHOO.util.Event._unload,YAHOO.util.Event,true);YAHOO.util.Event._tryPreloadAttach();}