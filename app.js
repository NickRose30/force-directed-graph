const width = 1250;
const height = 800;

const nodes = [
  { node: 'A', size: 5 },
  { node: 'B', size: 10 },
  { node: 'C', size: 15 },
  { node: 'D', size: 20 },
  { node: 'E', size: 25 },
  { node: 'F', size: 30 },
  { node: 'G', size: 35 },
  { node: 'H', size: 18 },
];

// links variable, each one with fields specifying the two ends of the link
// will need to add another force (d3.forceLink) to the simulation in order
// for the links to influence the behavior of the nodes
const links = [
  { source: 'A', target: 'B' },
  { source: 'B', target: 'C' },
  { source: 'C', target: 'D' },
  { source: 'D', target: 'E' },
  { source: 'E', target: 'F' },
  { source: 'F', target: 'A' },
  { source: 'D', target: 'A' },
  { source: 'F', target: 'G' },
  { source: 'G', target: 'B' },
  { source: 'C', target: 'H' },
  { source: 'H', target: 'B' },
];

const svg = d3.select('svg')
              .attr('width', width)
              .attr('height', height);


/**
 * DRAGGING FUNCTIONS
 * we'd like to be able to move our nodes independently of the simulation forces. the fx and
 * fy values for a node will fix the x and y values at whatever the specified value is. set them
 * to null to remove the fixing of the position.
 */
// when we start dragging set the fixed values for the node equal to its current position
const dragStart = node => {
  node.fx = node.x;
  // needs to be done on drag start or else dragging will stop working after about 10 seconds.
  // look up alpha values for more explanation. this is very confusing
  simulation.alphaTarget(0.5).restart();
  node.fy = node.y;
};
// as we're dragging update the node's fixed values based on the drag event
const drag = node => {
  node.fx = d3.event.x;
  node.fy = d3.event.y;
};
// when we're finished dragging set the fixed properties back to null
const dragEnd = node => {
  // this just needs to be done at the end. again, look up alpha values for further explanation
  simulation.alphaTarget(0);
  node.fx = null;
  node.fy = null;
};

const linkSelection = svg
                      .selectAll('line')
                      .data(links)
                      .enter()
                      .append('line')
                        .attr('stroke', 'slategrey')
                        .attr('stroke-width', 1);

const nodeSelection = svg
                      .selectAll('circle')
                      .data(nodes)
                      .enter()
                      .append('circle')
                        .attr('r', d => d.size)
                        .attr('fill', 'white')
                        // add support for dragging to each circle 
                        .call(d3.drag()
                                .on('start', dragStart)
                                .on('drag', drag)
                                .on('end', dragEnd)
                        );


// create the simulation. this doesn't do anything visually, it just
// gives the data attached to each node (circle, in this case) some
// new properties related to the nodes velocity and position
const simulation = d3.forceSimulation(nodes);

// FORCE 1: PULL TO CENTER
// add a force to the simulation. this is required to get the nodes moving on the page.
// this is a center force, which tugs on the nodes so that their average position lies
// in the designated center. the first argument here is just. it can be whatever you
// want and will only be used if you need to access the force later
simulation.force('center', d3.forceCenter(width / 2, height / 3));

// FORCE 2: REPEL EACH OTHER
// add another force to the simulation. up to this point all the nodes just get pulled into
// the center. the Many Body Force is a repulsive force, causing the nodes to push away from
// each other. the strength method is optional and takes a strength at which to push the nodes
// away from each other; negative values are repulsive forces and positive values are atractive
// forces. so the 'center' force above pulls all the nodes into the center, then this force
// pushes them away from each other. if we passed a positive number to .strength they would get
// pulled together even more tightly in the center
simulation.force('nodes', d3.forceManyBody().strength(-70));

// FORCE 3: LINK FORCE
// forceLink - creates the link force with the provided links array.
// .id - d3 needs to be able to translate between the link and the source/target nodes. by
// default it assumes the values for source and target are indices in the nodes array, but
// actually they are the values in the 'node' field of each node. we could change our links
// array so that source and target reference indices, but instead we'll use the .id method.
// .distance - specify a desired distance between nodes, other forces can affect this. by 
// passing it a value based on the size of the source and target, we create the effect of
// larger nodes having a larger repulsize force than smaller nodes
simulation.force('links',
                  d3.forceLink(links)
                    .id(node => node.node)
                    .distance(d => 5 * (d.source.size + d.target.size))
                );

// this .on can be chained onto the .force
// this is a function specifying how the positions of our nodes/links should update based on
// the velocities and positions calculated by the simulation. so this is just saying to update
// the cx and cy attrs of the circles and the x1/2/3/4 of the links to what the simulation has
// calculated for them. this gets called on every 'tick' of the clock. the only other type of
// 'on' event for simulations is 'end' which will get called at the end of the simulation
simulation.on('tick', () => {
              nodeSelection
                .attr('cx', d => d.x)
                .attr('cy', d => d.y)
              
              linkSelection
                .attr('x1', d => d.source.x)
                .attr('y1', d => d.source.y)
                .attr('x2', d => d.target.x)
                .attr('y2', d => d.target.y)
            });