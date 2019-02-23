
function cluster( data, config, run_on_projection = false ) {

  /* Hyper-parameters algorithm */
  var CLUSTERS = 3;

  var features;
  if( run_on_projection ) {
    features = [ 'x', 'y' ];
  } else {
    features = getProjectioFeatures();
  }

  console.info( 'Clustering data!' );
  console.info( CLUSTERS );
  console.info( 'Attributes: ' + features );
  console.info( 'Númber of Items: ' + visibleData.length );

  // Transform data to multi-dimensional array
  var featuredData = [];
  data.forEach( d => {
    
    datum = {};
    features.forEach( feature => {
      datum[ feature ] = +d[ feature ];
    } );
    featuredData.push( datum );
  } );

  var Http = new XMLHttpRequest();
  var url = 'http://localhost:5000/kmeans/' + CLUSTERS;
  Http.open( 'POST', url, false );
  Http.setRequestHeader( 'Content-Type', 'application/json' );

  Http.send( JSON.stringify( featuredData ) );

  console.info( 'Clustering finished!' );

  if( Http.status === 200 ) {
    return { 
      "results" : Http.responseText.split( ' ' ),
      "hyper-parameters" : {
        "clusters" : CLUSTERS
      }
    };
  }

}

function getProjectioFeatures() {

  var features = config.features.filter( f => f.project === true );
  var featureNames = []; 

  features.forEach( f => featureNames.push( f.name ) );

  return featureNames;

}