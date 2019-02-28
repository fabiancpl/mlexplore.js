
function project( data ) {

  var features = getProjectionFeatures();

  // Build hyper-parameters object
  var params = {}
  params.epsilon = config.models.projection.epsilon; 
  params.perplexity = config.models.projection.perplexity;
  params.dim = 2;

  console.info( 'Projecting data in ' + config.models.projection.iterations + ' iterations!' );
  console.info( params );
  console.info( 'Attributes: ' + features );
  console.info( 'Númber of Items: ' + visibleData.length );

  // Transform data to multi-dimensional array
  var arrayData = [];
  data.forEach( d => {
    
    row = [];
    features.forEach( feature => {
      row.push( +d[ feature ] );
    } );
    arrayData.push( row );
  } );

  // Instantiate t-SNE object and attach the data
  var tsne = new tsnejs.tSNE( params );
  tsne.initDataRaw( arrayData );

  // Run t-SNE iterations
  for( var k = 0; k < config.models.projection.iterations; k++ ) {
    tsne.step();
  }

  console.info( 'Projection finished!' );

  return { 
    "results" : tsne.getSolution()
  };

}