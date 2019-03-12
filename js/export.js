
// Show the window for exporting the configuration object
function exportConfiguration() {

  console.log( 'Exporting configuration as JSON!' );

  var configCopy = Object.assign( {}, config );
  //configCopy[ 'features' ] = configCopy[ 'features' ].filter( f => ![ 'x', 'y', 'cluster' ].includes( f.name ) );

  downloadPlain( JSON.stringify( configCopy, null, 2 ), datasetName + '-config.json', 'text/plain' );

}

// Show the window for exporting the data
// Data object includes projection and clustering models results by default
function exportData() {

  console.log( 'Exporting data as CSV!' );

  var string = '';

  // Read the user option
  var option1 = d3.select( '#exportDataOption1' ).property( 'checked' );
  var option2 = d3.select( '#exportDataOption2' ).property( 'checked' );
  var option3 = d3.select( '#exportDataOption3' ).property( 'checked' );

  var features = [ '__seqId' ];
  if( option1 ) {
    features.push( 'x' );
    features.push( 'y' );
    if( colorFeature !== undefined ) features.push( colorFeature );
  } else if( option2 ) {
    config.features.forEach( feature => features.push( feature.name ) );
  } else if( option3 ) {
    features = getProjectionFeatures();
    features.push( 'x' );
    features.push( 'y' );
    if( colorFeature !== undefined ) features.push( colorFeature );
  }

  // Add the header of the CSV
  string = features.toString();
  console.log( 'Attributes to export: ' + string );
  string += '\n';

  // Add the content of the CSV
  visibleData.forEach( row => {

    var row_array = [];
    features.forEach( feature => {
      row_array.push( row[ feature ] );
    } );
    string += row_array.toString() + '\n';

  } );

  downloadPlain( string, datasetName + '.csv', 'text/plain' );

  // Hide the export data modal
  $( '#exportDataModal' ).modal( 'hide' );

}

// Show the window for exporting the projection as PNG
function exportProjection() {

  console.log( 'Exporting projection as PNG!' );

  var projection = d3.select( '#projection' ).select( 'svg' ).node();

  saveSvgAsPng( projection, datasetName + '-embedding.png' );

}

function downloadPlain( content, fileName, contentType ) {
  var a = document.createElement( 'a' );
  var file = new Blob( [ content ], { type: contentType } );
  a.href = URL.createObjectURL( file );
  a.download = fileName;
  a.click();
}