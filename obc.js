/*
@author ccina@outlook.com
(c) 2014-2015 cc
Licensed BSD
*/

function obContainer(o){
		return convert(o);

	function convert(o){
		if(o.obContainer==="obContainer"){
			return o;
		}else{
			var prevObContainer='';
			var obsProxy=null;
			Object.defineProperty(o, "obsProxy", {
				get:function(){
					return obsProxy;
				},
				set:function(e){
					obsProxy=e;
				}
			});
			Object.defineProperty(o, "obContainer", {value:"obContainer"});
			Object.defineProperty(o, "prevObContainer", {get:function(){return prevObContainer;},
				set:function(e){prevObContainer=e;}});
			var curO=o;
			Object.defineProperty(o, "curO", {
				get:function(){
					return curO;
				},
				set:function(e){
					curO=e;
				}});
			var changeList=[];
			var changeStack={};
			var commiting=false;
			var commitFlag="init";
			Object.defineProperty(o, "changeStack", {
				get:function(){
					return changeStack;
				}
			});
			Object.defineProperty(o, "commitFlag", {
				get:function(){
					return commitFlag;
				},
				set:function(e){
					commitFlag=e;
				}
			});
			Object.defineProperty(o, "changeList", {
				get:function(){
					return changeList;
				}
			});
			o.isInChangeStack=function(cts){
				if(cts===commitFlag||cts in changeStack){
					return true;
				}else{
					return false;
				}
			};
			o.setChangeList=function(ind, cts){
				if(this.getRoot.curO.commitFlag===cts&&(!changeList.some(function(e){return ind===e;}))){
					changeList.push(ind);
				}else if(cts in changeStack&&!changeStack[cts].some(function(e){return ind===e;})){
					changeStack[cts].push(ind);
				}else{
					changeStack[this.getRoot.curO.commitFlag]=changeList;
					this.getRoot.curO.commitFlag=cts;
					changeList=[];
					changeList.push(ind);
				}
			};
			Object.defineProperty(o, "getRoot", {get: function(){return o;}});
			o.notice=function(cts){//todo cache notice
				if(this.commitFlag===cts||cts in changeStack){
					if(this.obsProxy){
						this.obsProxy(cts);
					}else{
						console.log("notice:commit "+cts+".");
					}
					if(arguments[1]===true&&this.prevObContainer){
						this.prevObContainer.notice(cts);
					}
				}
			};
			o.noticeAll=function(o, i){
				if(this.obsProxy){
					this.obsProxy(o, i);
				}else{
					console.log("notice:obj "+o+"and index:"+i+".");
				}
				if(this.prevObContainer){
				this.prevObContainer.noticeAll(o, i);}
			};
			o.commit=function(cts){
				var o=this.getRoot.curO;
				var i;
				if(arguments[1]===true){
					for(i in o){
						if(o[i].val&&o[i].val.obContainer==="obContainer"&&o[i].val.isInChangeStack(cts)){
							o[i].o.innerSet(i, this[i].val.getRoot.curO);
							o.setChangeList(i, cts);
						}
					}
					if(o.commitFlag===cts&&this.prevObContainer){
						this.prevObContainer.commit(cts, true);
					}
					return;
				}
				if(commiting===true&&cts!==commitFlag){
					console("commiting, please waiting");
					return false;
				}else if(commiting===false){
					commiting=true;
				}
				for(i in o){
					if(o[i].val&&o[i].val.obContainer!=null&&o[i].val.obContainer==="obContainer"){
						if(o[i].val.commitFlag===cts){
							o[i].o.innerSet(i, this[i].val.getRoot.curO);
							//o.setChangeList(i, cts);
						}else{
							o[i].val.commit(cts, " ");
							}
						}
					}
				//if(o.commitFlag!=cts){
					conv(this.getRoot.curO, cts);
					commiting=false;
					if(this.getRoot.curO.commitFlag===cts&&cts!=="init"){
						if(this.prevObContainer.commit){
						this.prevObContainer.commit(cts, true);}
						if(arguments[1]===" "){
							this.notice(cts);
						}else{//just outside directly call commit
							this.notice(cts, true);
						}
					}

			};
			Object.defineProperty(o, "changeList", {writeable:false, enumerable:false, configurable:false});
			Object.defineProperty(o, "notice", {writeable:false, enumerable:false, configurable:false});
			Object.defineProperty(o, "noticeAll", {writeable:false, enumerable:false, configurable:false});
			Object.defineProperty(o, "commit", {writeable:false, enumerable:false, configurable:false});
			Object.defineProperty(o, "setChangeList", {writeable:false, enumerable:false, configurable:false});
			Object.defineProperty(o, "isInChangeStack", {writeable:false, enumerable:false, configurable:false});
			return conv(o, o.commitFlag);
		}
	}
	function conv(o, cts){
		o=o.getRoot.curO;
		if(Object.keys(o).length!==0){
		var innerD={};
		var cache={};
		var addset=function(i){
			Object.defineProperty(o, i, {
				get: function(){
					return {val:innerD[i], o:o, cache:cache[i]};
				},
				set: function(e){
					if(e.ccache){
						cache[i]=e.val;
						}else{
							if(e.obContainer==="obContainer"){
								e.prevObContainer=o;
								e=e.getRoot.curO;
							}
							if(innerD[i]==="obContainer"){
								innerD[i].prevObContainer=[];
							}
							innerD[i]=e;
							o.noticeAll(o, i);
						}
					}
				});};
		for(var i in o){
			if(o.hasOwnProperty(i)){
				innerD[i]=o[i];  //here just assume it is value attr, it should be function, accessor proxy
				addset(i);
				o.setChangeList(i, cts);
				if(innerD[i].obContainer==="obContainer"){
					innerD[i].prevObContainer=o.getRoot.curO;
				}
			}
		}
		o.innerSet=function(ind, val){
			innerD[ind]=val;
		};
		o.commitCache=function(cts){
			var noticeChange=Object.keys(cache);
			if(noticeChange.length===0){
				//no notice
			}else{
				for(var i in cache){
					if(innerD[i].obContainer==="obContainer"){
						innerD[i].prevObContainer=[];
					}
					if(cache[i].obContainer==="obContainer"){
						cache[i].prevObContainer=this.getRoot.curO;
						cache[i]=cache[i].getRoot.curO;
					}
					innerD[i]=cache[i];
					this.setChangeList(i, cts);
				}
				cache={};
			}
		};
		Object.defineProperty(o, "commitCache", {writeable:false, enumerable:false, configurable:false});
		var ret=Object.create(o);
		o.getRoot.curO=ret;
	}
				var inso=o;
			while(inso.obContainer==="obContainer"){
				inso.commitCache(cts);
				inso=Object.getPrototypeOf(inso);
			}
			return o.getRoot.curO;
}}

function addObs(o, s){
o.obsProxy=function(){
if(arguments.length===1){
console.log("commit flag:"+this.commitFlag+". change list:"+this.changeList);}else{
console.log("in obj:"+arguments[0]+". index:"+arguments[1]);}
console.log("log by "+s);};}