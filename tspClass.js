class TSP {
	constructor(cities,len,graph) {
        this.cities = cities;
        this.n = len;
        this.graph = graph;
    }
	// x and y coords of a node
	get getNodeCount(){
		return this.cities.length;

	};

	// Find MST using Prim's algorithm
	minKey(dist, visited){
		let  min = Infinity, minIndex = -1;
		for (let v = 0; v < dist.length; v++){
			if (visited[v] == false && dist[v] <= min){
				min = dist[v];
				minIndex = v;    
			}  
		}  
		return minIndex; 
	};
	prim() {
		let parent = [], key = [], visited = [];
	  	let length = this.n, i;

	  	for (i = 0; i < length; i++){ //{1}
	      	key[i] = Infinity;
	     	visited[i] = false;
	  	}

	  	key[0] = 0;     //{1}
	  	parent[0] = -1;

	  	for (i = 0; i < length-1; i++) { //{3}
	  	    let u = this.minKey(key, visited); //{4}
	  	    visited[u] = true;            //{5}

	    	for (let v = 0; v < length; v++){ 
	         	if (this.graph[u][v] && visited[v] == false && this.graph[u][v] <  key[v]){ //{6}
	         	      parent[v]  = u;            //{7}
	         	      key[v] = this.graph[u][v]; //{8}
	         	}
	        }
	    }
	    return parent; //{9} 
	};

	findOdds(adjlist) {
		let odds = [];
	/////////////////////////////////////////////////////
	// Find nodes with odd degrees in T to get subgraph O
	/////////////////////////////////////////////////////

		// store odds in new vector for now
		for (let r = 0; r < this.n; r++) {
			if ( adjlist[r].length % 2 !== 0) {
				odds.push(r);
			}
		}
		return odds;
	}

	perfect_matching(odds, adjlist) {
	/////////////////////////////////////////////////////
	// find a perfect matching M in the subgraph O using greedy algorithm
	// but not minimum
	/////////////////////////////////////////////////////
		let closest, length, i = 0; //int d;
		let tmp, first, firstIndex, it, itIndex;

		while (odds.length) {
			firstIndex = 0;
			itIndex = firstIndex + 1;
			let end = odds.length;
			length = Number.MAX_SAFE_INTEGER;

			for (; itIndex != end; ++itIndex) {
				// if this node is closer than the current closest, update closest and length
				first = odds[firstIndex];
				it = odds[itIndex];
				if (this.graph[first][it] < length) {
					length = this.graph[first][it];
					closest = it;
					tmp = itIndex;
				}
			}	// two nodes are matched, end of list reached

			adjlist[first].push(closest);
			adjlist[closest].push(first);
			odds.splice(tmp,1);
			odds.splice(firstIndex,1);

		}
		return adjlist;
	}

	euler (adjlist) {
		/////////////////////////////////////////////////////////
		// Based on this algorithm:
		//	http://www.graph-magics.com/articles/euler.php
		// we know graph has 0 odd vertices, so start at any vertex
		// O(V+E) complexity
		/////////////////////////////////////////////////////////

		// make copy of original adjlist to use/modify
		let temp = [...adjlist], path = [];
		// Repeat until the current vertex has no more neighbors and the stack is empty.
		let stk = [], pos = 0;
		while (stk.length > 0 || temp[pos].length > 0 ) {
			// If current vertex has no neighbors -
			if (temp[pos].length == 0) {
				// add it to circuit,
				path.push(pos);
				// remove the last vertex from the stack and set it as the current one.
				// let last = stk.length - 1;				
				pos = stk.pop();
			}
			// Otherwise (in case it has neighbors)
			else {
				// add the vertex to the stack,
				stk.push(pos);
				// take any of its neighbors,
				let neighbor = temp[pos].pop();
				//temp[pos][temp[pos].length - 1];
				// remove the edge between selected neighbor and that vertex,
				
		        for (let i = 0; i < temp[neighbor].length; i++)
		            if (temp[neighbor][i] == pos) { // find position of neighbor in list
		            	temp[neighbor].splice(i,1)
		                break;
		            }
				// and set that neighbor as the current vertex.
		        pos = neighbor;
			}
		}
		path.push(pos);
		return path;
	}

	make_hamilton(path) {
		// remove visited nodes from Euler tour
		let visited = [], newPath = [], check;
		for (let i = 0; i < path.length; i++) {
			let check = path[i];
			if (!visited[check]) {
				visited[check] = true;
				newPath.push(check)
			}
		}
		return newPath;

	}

	reverse (path, start, end){
		while (end - start > 0) {
			// Start, end is relative value to the start,
			// the index is start|slut % size
			let temp = path[start % this.n];
			path[start % this.n] = path[end % this.n];
			path[end % this.n] = temp;
			start++;
			end--;
		}
	}


 	is_path_shorter(v1, v2, v3, v4, total_dist){

		if ((this.graph[v1][v3] + this.graph[v2][v4]) < (this.graph[v1][v2] + this.graph[v3][v4]))
		{
			total_dist -= (this.graph[v1][v2] + this.graph[v3][v4] -this.graph[v1][v3]
					- this.graph[v2][v4]);
			return 1;
		}
	return 0;
	}


// Non-looping version of two-opt heuristic
	twoOpt(path, pathLength){
		let counter = 0;
		let term_cond = 5;
		let old_distance = pathLength;
		//int size = path.size();
		let v1, v2, u1, u2;

		// Iterate over each edge
		for (let i = 0; i < this.n; i++)
		{
			// first edge
			u1 = i;
			v1 = (i+1) % this.n; // wrap around to first node if u1 is last node

			// Skip adjacent edges, start with node one past v1
			for (let j = i + 2; (j + 1) % this.n != i; j++)
			{
				// mod by length to go back to beginning
				u2 = j % this.n;
				v2 = (j+1) % this.n;

				// Check if new edges would shorten the path length
				// If so, decreases pathLength
				if (this.is_path_shorter(path[u1], path[v1], path[u2],
						path[v2], pathLength))
				{

					// Swap u1--v1 and u2--v2
					this.reverse(path, i + 1, j, this.n); // v1, u2

					if (pathLength - old_distance < 5 && counter == term_cond)
						break;

					// reset i
					if (pathLength - old_distance > term_cond )
						i = 0;

					old_distance = pathLength;
					counter++;
				}
			}
		}
		return pathLength;
	}



	 get_path_length(path){
		let length = 0,size = path.length;
		for (let i = 0; i < size-1; i++)
		{
			length += this.graph[path[i]][path[i+1]];
		}
		length += this.graph[path[size-1]][path[0]]; // back home
		return length;
	}



};
module.exports = TSP;