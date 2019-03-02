
function cluster( data, run_on_projection = false ) {

  var features;
  if( run_on_projection ) {
    features = [ 'x', 'y' ];
  } else {
    features = getProjectionFeatures();
  }

  console.info( 'Clustering data!' );
  console.info( 'Number of clusters: ' + clusteringConfigTemp.clusters );
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
  var url = 'http://localhost:5000/kmeans/' + clusteringConfigTemp.clusters;
  Http.open( 'POST', url, false );
  Http.setRequestHeader( 'Content-Type', 'application/json' );

  Http.send( JSON.stringify( featuredData ) );

  console.info( 'Clustering finished!' );

  if( Http.status === 200 ) {
    return { 
      "results" : Http.responseText.split( ' ' ),
      "config" : {
        "clusters" : clusteringConfigTemp.clusters,
        "run_on_projection" : run_on_projection
      }
    };
  }

}