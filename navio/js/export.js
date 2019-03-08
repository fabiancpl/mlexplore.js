
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

  // Add the header of the CSV
  config.features.forEach( feature => string += feature.name + ',' );
  string = string.substring( 0, string.length - 1 ) + '\n';

  // Add the content of the CSV
  visibleData.forEach( row => {

    string_row = '';
    config.features.forEach( feature => {
      string_row += row[ feature.name ] + ',';
    } );
    string += string_row.substring( 0, string_row.length - 1 ) + '\n';

  } );

  downloadPlain( string, datasetName + '.csv', 'text/plain' ); 

}

// Show the window for exporting the projection as PNG
function exportProjection() {

  console.log( 'Exporting projection as PNG!' );

  var projection = d3.select( '#projection' ).select( 'svg' ).node();

  saveSvgAsPng( projection, "projection.png" );

}

function downloadPlain( content, fileName, contentType ) {
  var a = document.createElement( 'a' );
  var file = new Blob( [ content ], { type: contentType } );
  a.href = URL.createObjectURL( file );
  a.download = fileName;
  a.click();
}