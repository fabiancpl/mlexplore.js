
/* Hyper-parameters algorithm */
var ITERATIONS = 1000,
  PERPLEXITY = 30,
  EPSILON = 200
  DIMENSIONS = 2;

function project( data ) {

  var arrayData = [];

  // Transform data to multi-dimensional array
  data.forEach( d => {
    
    row = [];
    config.features.forEach( feature => {
      if( feature.project )
        row.push( +d[ feature.name ] );
    } );
    
    arrayData.push( row );
  } );
  
  // Build hyper-parameters object
  var params = {}
  params.epsilon = EPSILON; 
  params.perplexity = PERPLEXITY;
  params.dim = DIMENSIONS;

  console.info( 'Projecting data in ' + ITERATIONS + ' iterations!' );

  // Instantiate t-SNE object and attach the data
  var tsne = new tsnejs.tSNE( params );
  tsne.initDataRaw( arrayData );

  // Run t-SNE iterations
  for( var k = 0; k < ITERATIONS; k++ ) {
    tsne.step();
  }

  return tsne.getSolution();

}