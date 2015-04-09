o=obContainer({x:1, y:11});
addObs(o, "observerable o!");
o.z="new attr z";
o.commit('add new attr z to o');
o=o.getRoot.curO;
o.xx="new attr xx";
o.commit("add new attr xx to o");
o=o.getRoot.curO;

o1=obContainer({x1:1, y1:11});
addObs(o1, "observerable o1!");
o1.z1="new attr z1";
o1.commit("add new attr z1");
o1=o1.getRoot.curO;
	//test
	o1.x1="change attr x1";
	o1.y1={val:"change attr y1", ccache:true};
	o1.commit("#commit the change cached");

bo=obContainer({box:1, boy:11, boo:o, boo1:o1});
addObs(bo, "observerable bo!");
bo.boz="new attr boz";
bo.commit("add new attr boz");
bo=bo.getRoot.curO;
	//test
	o1.xx1="new attr xx1";
	o1.commit("add new attr xx1");

	