/* global tsnejs, importScripts */

onmessage = function(e) {
  console.log('Project Worker: Message received from main script');

  const data = e.data.data;
  const features = e.data.features;
  // var features = getProjectionFeatures();

  // Build hyper-parameters object
  var params = {};
  // params.epsilon = projectionConfigTemp.epsilon;
  params.epsilon = e.data.epsilon;
  // params.perplexity = projectionConfigTemp.perplexity;
  params.perplexity = e.data.perplexity;
  params.dim = e.data.perplexity || 2;


  console.info( 'Projecting data in ' + e.data.iterations + ' iterations!' );
  console.info( params );
  console.info( 'Attributes: ' + features );
  console.info( 'Númber of Items: ' + data.length );

  // Transform data to multi-dimensional array
  var arrayData = [];
  data.forEach( d => {

    let row = [];
    features.forEach( feature => {
      row.push( +d[ feature ] );
    } );
    arrayData.push( row );
  } );

  importScripts('../../../libs/tsne.js');

  // Instantiate t-SNE object and attach the data
  var tsne = new tsnejs.tSNE( params );
  tsne.initDataRaw( arrayData );

  // Run t-SNE iterations
  for( let k = 0; k < e.data.iterations; k++ ) {
    console.log('step', k);
    tsne.step();
    postMessage({
      solution: tsne.getSolution(),
      i: k
    });
  }



};