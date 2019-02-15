
function cluster( data, config ) {

  /* Hyper-parameters algorithm */
  var CLUSTERS = 3;

  console.info( 'Clustering data!' );
  console.info( CLUSTERS );
  console.info( 'Attributes: ' + config.features.filter( f => f.project === true ).length );
  console.info( 'Items: ' + data.filter( d => d.visible === true ).length );

  // Transform data to multi-dimensional array
  var featuredData = [];
  data.forEach( d => {
    
    datum = {};
    config.features.forEach( feature => {
      if( feature.project )
        datum[ feature.name ] = +d[ feature.name ];
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
     return Http.responseText.split( ' ' );
  }

}