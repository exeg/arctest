'use strict'
const fs = require('fs');
const tspClass = require('./tspClass');

function getData() {
// Make sure we got a filename on the command line.
  if (process.argv.length < 3) {
    console.log('Usage: node ' + process.argv[1] + ' FILENAME');
    process.exit(1);
  }

// Read the file and print its contents.
  const filename = process.argv[2];
  let data = fs.readFileSync(filename, 'utf8').toString().split("\n");
  let result = [];
  for (let i in data) {
  	let tmp = [];
  	tmp = data[i].split(" ");
  	result.push({
  		x: Number(tmp[0].trim()),
  		y: Number(tmp[1].trim())
  	})

  }
  return result;
};

function Create2DArray(rows,fill=true) {
	let arr = [];
  	for (let i=0; i <= rows; i++) {
		arr.push([]);		
		if (fill){
			arr[i].push(new Array(rows));
	  		for (let j = 0; j <= rows; j++){
	     		arr[i][j] = 0;
			}
		}
	}		
	return arr;
}

function get_distance(c1,c2) {
	let dx = Math.pow((c1.x - c2.x), 2);
	let dy = Math.pow((c1.y - c2.y), 2);
	return (Math.floor(Math.sqrt(dx + dy) + 0.5));
};

function startShow () {
	let hrstart = process.hrtime(), startDate = new Date();
    let data = getData();
    let tdlen = data.length;

    let graph = Create2DArray(tdlen-1);
	// fill matrix with distances from every city to every other city
	for (let i = 0; i < tdlen; i++) {
		for (let j = i; j < tdlen; j++) {
			graph[i][j] = graph[j][i] = get_distance(data[i],data[j]);
		}
	}
	// console.log(graph);
	let adjlist = Create2DArray(tdlen-1,false);
	const tspInst = new tspClass(data,tdlen,graph);
	// console.log("Node Count", tspInst.getNodeCount);	
	let mst = tspInst.prim();
	// console.log("mst ",mst)
   	// map relations from parent array onto matrix
	for (let v1 = 0; v1 < tdlen; v1++) {
	// there is an edge between v1 and parent[v1]
		let v2 = mst[v1];
		if (v2 !== -1) {
			adjlist[v1].push(v2);
			adjlist[v2].push(v1);
		}
	}

	// console.log("adjlist ",adjlist);
	let odds = tspInst.findOdds(adjlist);
	// console.log("odds", odds);
	let newAdjlist = tspInst.perfect_matching(odds,adjlist);
	// console.log("newAdjlist", newAdjlist);
	let eulerCirc = tspInst.euler(adjlist);
	// console.log("eulerCirc",eulerCirc);
	let hamilton = tspInst.make_hamilton(eulerCirc);
	// console.log("hamilton", hamilton)
	// let twoOpt = tspInst.twoOpt(hamilton.path, hamilton.path_dist);
	// console.log("twoOpt",twoOpt)
	let plength = tspInst.get_path_length(hamilton);
	// console.log("path lenght", plength);
	let twoOpt = tspInst.twoOpt(hamilton, plength);
    let hrend = process.hrtime(hrstart)
	//Results
	console.log("Point Sequence: ", hamilton);
	console.log("Size",twoOpt);
	console.log('Execution time (hr): %ds %dms', hrend[0], hrend[1]);
	let exportData = { 
	    path: hamilton,
	    size: twoOpt, 
	    time: `${hrend[0]}s ${hrend[1]}ms`
	}; 
	exportData = JSON.stringify(exportData);
	fs.writeFileSync('results.json', exportData);
};	

startShow();